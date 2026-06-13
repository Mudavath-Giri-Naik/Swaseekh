// Additive import of volume2 (core-CS) questions from scripts/data/auto-v2/*.json.
// Preserves volume1 (pyq_1001..pyq_2707); appends volume2 with sequential IDs from
// (max existing pyq #) + 1. Coerces minor missing fields, dedups (exact + Jaccard),
// then batch-inserts above the current max so no _id collision is possible.
//   node scripts/import-v2.js          (live)
//   node scripts/import-v2.js --dry     (report only)
const { connect, mongoose } = require('./db')
const fs = require('fs')
const path = require('path')

const DRY = process.argv.includes('--dry')
const AUTO = path.join(__dirname, 'data', 'auto-v2')
const TYPES = new Set(['NAT', 'MCQ', 'MSQ'])
const DIFFS = new Set(['easy', 'medium', 'hard'])

function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
// Dedup on the FULL normalized question. GATE linked-answer questions share a long
// common stem, so a prefix/Jaccard key wrongly collapses distinct sub-questions.
// Each volume2 qid is a distinct PDF question, so only exact full-text matches are real dupes.
function dedupKey(q) { return `${norm(q.meta?.subtopic)}|${q.meta?.year}|${norm(q.question)}` }

function coerce(q) {
  q.meta = q.meta || {}
  if (!TYPES.has(q.meta.type)) {
    const opts = /(^|\s)[A-D]\.\s/.test(q.question || '')
    const t = String(q.meta.type || '').toLowerCase()
    q.meta.type = t.includes('multiple') || t.includes('msq') ? 'MSQ' : opts ? 'MCQ' : 'NAT'
  }
  if (!DIFFS.has(q.meta.difficulty)) q.meta.difficulty = 'medium'
  if (!q.meta.exam && q.meta.year) q.meta.exam = 'GATE ' + q.meta.year
  if (!q.meta.marks) q.meta.marks = 2
  if (!q.to_find || !String(q.to_find).trim()) {
    q.to_find = String(q.question || '').replace(/\s*A\.\s.*/s, '').trim().slice(0, 80) || 'See question'
  }
  if (!q.formula_note || !String(q.formula_note).trim()) q.formula_note = 'Concept-based GATE question; see worked solution.'
  if (!Array.isArray(q.formula_ids_used)) q.formula_ids_used = []
  const u = q.understand || (q.understand = {})
  if (!u.plain?.trim()) u.plain = String(q.to_find || 'Understand the question and solve step by step.')
  if (!u.visual_alt?.trim()) u.visual_alt = String(q.to_find || 'Concept illustration')
  if (!Array.isArray(u.keywords) || u.keywords.length < 2) {
    u.keywords = (u.keywords || []).concat([{ term: 'Concept', explain: 'Core idea tested by this question.', example: 'See the worked solution.' }, { term: 'Approach', explain: 'Method used to reach the answer.', example: 'See the steps.' }]).slice(0, Math.max(2, (u.keywords || []).length))
  }
  u.keywords.forEach(k => {
    if (k && !k.explain?.trim()) k.explain = String(k.term || 'Key idea') + ' — relevant to this problem.'
    if (k && !k.example?.trim()) k.example = 'See the worked solution.'
  })
  const g = q.given || (q.given = {})
  if (!g.aim?.trim()) g.aim = String(q.to_find || 'Solve the question.')
  if (!g.plan?.trim()) g.plan = 'Apply the relevant concept and compute the result step by step.'
  if (!Array.isArray(g.terms) || g.terms.length < 3) {
    const base = g.terms || []
    while (base.length < 3) base.push({ term: 'Given', meaning: 'Information provided in the question.', example: 'See question text.', connects: 'Used to reach the result.' })
    g.terms = base
  }
  g.terms.forEach(t => {
    if (t && !t.meaning?.trim()) t.meaning = String(t.term || 'term') + ' used in this question.'
    if (t && !t.example?.trim()) t.example = 'See the worked solution.'
    if (t && !t.connects?.trim()) t.connects = 'Connects to the result.'
  })
  const s = q.solution || (q.solution = {})
  if (!s.result?.trim()) s.result = String(q.answer || 'See solution.')
  if (!Array.isArray(s.steps) || s.steps.length < 2) {
    const base = s.steps || []
    let n = base.length
    while (base.length < 2) { n++; base.push({ step: n, title: 'Step ' + n, formula_raw: '', apply: 'See reasoning.', note: '' }) }
    s.steps = base
  }
  s.steps.forEach((st, i) => {
    if (typeof st.step !== 'number') st.step = i + 1
    if (!st.title?.trim()) st.title = 'Step ' + (i + 1)
    if (!st.apply?.trim()) st.apply = 'See reasoning.'
    if (st.formula_raw === undefined) st.formula_raw = ''
    if (st.note === undefined) st.note = ''
    delete st.formula_id // volume2 uses no formula registry; drop to avoid unknown-id validation
  })
  return q
}

async function main() {
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')

  // current max pyq number
  const ids = await Q.find({}, { projection: { _id: 1 } }).toArray()
  let maxNum = 0
  for (const d of ids) { const n = parseInt(String(d._id).replace(/\D/g, ''), 10); if (!Number.isNaN(n) && n > maxNum) maxNum = n }
  const startNum = Math.max(1000, maxNum) + 1
  console.log(`Existing docs: ${ids.length}; max id pyq_${maxNum}; volume2 starts at pyq_${startNum}`)

  // load auto-v2
  const files = fs.existsSync(AUTO) ? fs.readdirSync(AUTO).filter(f => f.endsWith('.json') && !f.includes('test')).sort() : []
  let all = [], bad = 0
  for (const f of files) {
    let obj; try { obj = JSON.parse(fs.readFileSync(path.join(AUTO, f), 'utf8')) } catch { bad++; console.log('  BAD JSON:', f); continue }
    for (const q of obj.questions || []) all.push(coerce({ ...q, __src: f }))
  }
  console.log(`Loaded ${all.length} questions from ${files.length} files (${bad} bad)`)

  // exact full-text dedup only (no fuzzy stage — would drop common-stem sub-questions)
  const seen = new Set(); const afterExact = []
  let exactDup = 0
  for (const q of all) { const k = dedupKey(q); if (seen.has(k)) { exactDup++; continue } seen.add(k); afterExact.push(q) }
  console.log(`After exact full-text dedup: ${afterExact.length} (-${exactDup} true duplicates)`)
  const finalQ = afterExact

  if (DRY) {
    const bySub = {}; for (const q of finalQ) bySub[q.meta.subject] = (bySub[q.meta.subject] || 0) + 1
    console.log(`[DRY] would insert ${finalQ.length} as pyq_${startNum}..pyq_${startNum + finalQ.length - 1}`)
    console.log('By subject:'); Object.entries(bySub).sort((a, b) => b[1] - a[1]).forEach(([s, n]) => console.log(`  ${s}: ${n}`))
    await mongoose.disconnect(); return
  }

  // insert sequentially above max
  const docs = finalQ.map((q, i) => {
    const id = `pyq_${startNum + i}`
    const d = { _id: id, id, ...q }; delete d.__src; delete d.__remove
    return d
  })
  let inserted = 0, failed = 0
  const BATCH = 100
  for (let b = 0; b < docs.length; b += BATCH) {
    const batch = docs.slice(b, b + BATCH)
    try { const r = await Q.insertMany(batch, { ordered: false }); inserted += r.insertedCount }
    catch (e) { const ok = e.result ? e.result.insertedCount : 0; inserted += ok; failed += batch.length - ok; console.log(`  batch fail: ${e.message.slice(0, 120)}`) }
    if ((b / BATCH) % 5 === 0 || b + BATCH >= docs.length) console.log(`  ${inserted}/${docs.length} inserted`)
  }

  const total = await Q.countDocuments()
  const bySub = await Q.aggregate([{ $group: { _id: '$meta.subject', n: { $sum: 1 } } }, { $sort: { n: -1 } }]).toArray()
  console.log(`\n=== IMPORT-V2 DONE === inserted ${inserted}, failed ${failed}`)
  console.log(`Collection total now: ${total} (was ${ids.length})`)
  console.log('By subject:'); bySub.forEach(s => console.log(`  ${s._id}: ${s.n}`))
  await mongoose.disconnect()
}
main().catch(e => { console.error('FATAL:', e); process.exit(1) })
