// Bulk-import every authored question across scripts/data/auto/*.json.
// Same pipeline as import-questions.js: validate -> dedup (subtopic+text+year) ->
// assign sequential pyq_#### ids -> batch-of-10 insert with reporting.
const fs = require('fs')
const path = require('path')
const { connect, mongoose } = require('./db')

const AUTO = path.join(__dirname, 'data', 'auto')
const TYPES = new Set(['NAT', 'MCQ', 'MSQ'])
const DIFFS = new Set(['easy', 'medium', 'hard'])

function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
function dedupKey(q) { return `${norm(q.meta && q.meta.subtopic)}|${q.meta && q.meta.year}|${norm(q.question).slice(0, 120)}` }

async function loadFormulaIds(C) {
  const docs = await C.find({}).toArray()
  const ids = new Set()
  for (const d of docs) for (const g of d.groups || []) for (const f of g.formulas || []) if (f.formulaId) ids.add(f.formulaId)
  return ids
}
function validate(q, fids) {
  const e = []
  const req = (p, v) => { if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) e.push(`missing ${p}`) }
  req('question', q.question); req('answer', q.answer); req('to_find', q.to_find); req('formula_note', q.formula_note)
  const m = q.meta || {}
  ;['exam', 'year', 'marks', 'difficulty', 'type', 'subject', 'topic', 'subtopic'].forEach((k) => req('meta.' + k, m[k]))
  if (m.type && !TYPES.has(m.type)) e.push(`type ${m.type}`)
  if (m.difficulty && !DIFFS.has(m.difficulty)) e.push(`diff ${m.difficulty}`)
  const u = q.understand || {}
  req('understand.plain', u.plain); req('understand.visual_alt', u.visual_alt)
  if (!Array.isArray(u.keywords) || !u.keywords.length) e.push('keywords empty')
  else u.keywords.forEach((k, i) => { req(`kw${i}.term`, k.term); req(`kw${i}.explain`, k.explain); req(`kw${i}.example`, k.example) })
  const g = q.given || {}
  req('given.aim', g.aim); req('given.plan', g.plan)
  if (!Array.isArray(g.terms) || !g.terms.length) e.push('given.terms empty')
  else g.terms.forEach((t, i) => { req(`gt${i}.term`, t.term); req(`gt${i}.meaning`, t.meaning); req(`gt${i}.example`, t.example); req(`gt${i}.connects`, t.connects) })
  const s = q.solution || {}
  req('solution.result', s.result)
  if (!Array.isArray(s.steps) || !s.steps.length) e.push('steps empty')
  else s.steps.forEach((st, i) => { req(`st${i}.title`, st.title); req(`st${i}.apply`, st.apply); if (typeof st.step !== 'number') e.push(`st${i}.step`); if (st.formula_id && !fids.has(st.formula_id)) e.push(`st${i}.fid ${st.formula_id}`) })
  if (!Array.isArray(q.formula_ids_used)) e.push('fids_used')
  else q.formula_ids_used.forEach((fid) => { if (fid && !fids.has(fid)) e.push(`fids_used ${fid}`) })
  return e
}

async function main() {
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions'); const C = db.collection('content')
  const fids = await loadFormulaIds(C)
  console.log(`Known formula ids: ${fids.size}`)

  // gather candidates
  const files = fs.existsSync(AUTO) ? fs.readdirSync(AUTO).filter((f) => f.endsWith('.json')).sort() : []
  let cands = []
  let badFiles = 0
  for (const f of files) {
    let obj
    try { obj = JSON.parse(fs.readFileSync(path.join(AUTO, f), 'utf8')) } catch { badFiles++; console.log('  BAD JSON:', f); continue }
    for (const q of obj.questions || []) {
      // coerce non-standard meta.type to the allowed enum
      if (q.meta && !TYPES.has(q.meta.type)) {
        const opts = /(^|\s)[A-D]\.\s/.test(q.question || '')
        const t = String(q.meta.type || '').toLowerCase()
        q.meta.type = t.includes('multiple') || t.includes('msq') ? 'MSQ' : opts ? 'MCQ' : 'NAT'
      }
      if (q.meta && !DIFFS.has(q.meta.difficulty)) q.meta.difficulty = 'medium'
      // auto-fill missing to_find from question text
      if (!q.to_find || !String(q.to_find).trim()) {
        const qt = String(q.question || '').replace(/\s*A\.\s.*/s, '').trim()
        q.to_find = qt.slice(0, 80) || 'See question'
      }
      // auto-fill minor missing fields so good docs aren't rejected
      const u = q.understand || (q.understand = {})
      if (!u.visual_alt || !String(u.visual_alt).trim()) u.visual_alt = String(q.to_find || 'Concept illustration')
      if (Array.isArray(u.keywords)) u.keywords.forEach((k) => {
        if (k && (!k.explain || !String(k.explain).trim())) k.explain = String(k.term || 'Key idea') + ' — relevant to this problem.'
        if (k && (!k.example || !String(k.example).trim())) k.example = 'See the worked solution.'
      })
      const g = q.given || (q.given = {})
      if (Array.isArray(g.terms)) g.terms.forEach((t) => {
        if (t && (!t.meaning || !String(t.meaning).trim())) t.meaning = String(t.term || 'term') + ' used in this question.'
        if (t && (!t.example || !String(t.example).trim())) t.example = 'See the worked solution.'
        if (t && (!t.connects || !String(t.connects).trim())) t.connects = 'Connects to the result.'
      })
      cands.push({ __src: f, ...q })
    }
  }
  console.log(`Loaded ${cands.length} candidate questions from ${files.length} files (${badFiles} unreadable)`)

  // existing dedup + max id
  const existing = await Q.find({}, { projection: { _id: 1, question: 1, 'meta.subtopic': 1, 'meta.year': 1 } }).toArray()
  const seen = new Set(existing.map((d) => dedupKey({ question: d.question, meta: { subtopic: d.meta && d.meta.subtopic, year: d.meta && d.meta.year } })))
  let maxNum = 0
  for (const d of existing) { const n = parseInt(String(d._id).replace(/\D/g, ''), 10); if (!Number.isNaN(n) && n > maxNum) maxNum = n }
  let next = Math.max(1000, maxNum) + 1
  console.log(`Existing: ${existing.length}; next id pyq_${next}`)

  const toInsert = [], dupes = [], invalid = []
  const batchSeen = new Set()
  for (const q of cands) {
    const errs = validate(q, fids)
    if (errs.length) { invalid.push({ src: q.__src, q: (q.question || '').slice(0, 60), errs: errs.slice(0, 4) }); continue }
    const key = dedupKey(q)
    if (seen.has(key) || batchSeen.has(key)) { dupes.push(q.__src); continue }
    batchSeen.add(key)
    const id = `pyq_${next++}`
    const doc = { _id: id, id, ...q }; delete doc.__src
    toInsert.push(doc)
  }
  console.log(`\nReady: ${toInsert.length}; duplicates: ${dupes.length}; invalid: ${invalid.length}`)
  if (invalid.length) { console.log('-- first 25 invalid --'); invalid.slice(0, 25).forEach((d) => console.log(`  [${d.src}] ${d.q} :: ${d.errs.join('; ')}`)) }

  let inserted = 0, failed = 0
  for (let b = 0; b < toInsert.length; b += 10) {
    const batch = toInsert.slice(b, b + 10)
    try { const r = await Q.insertMany(batch, { ordered: false }); inserted += r.insertedCount }
    catch (e) { const ok = e.result ? e.result.insertedCount : 0; inserted += ok; failed += batch.length - ok; console.log(`  batch ${b / 10 + 1} FAIL ${batch.length - ok}: ${e.message.slice(0, 120)}`) }
    if ((b / 10) % 20 === 0) console.log(`  ...${inserted} inserted so far`)
  }
  console.log(`\n=== IMPORT-ALL DONE === inserted ${inserted}, failed ${failed}, dupes ${dupes.length}, invalid ${invalid.length}`)
  // write invalid report for a repair pass
  fs.writeFileSync(path.join(__dirname, 'data', 'invalid-report.json'), JSON.stringify(invalid, null, 1))
  await mongoose.disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
