// Full integrity + duplicate analysis of the volume2 questions in the live DB.
// Volume2 = pyq_2708 .. pyq_5299 (10 core-CS subjects). Volume1 = pyq_1001 .. pyq_2707.
//   node scripts/analyze-v2.js
const { connect, mongoose } = require('./db')

const V2_LO = 2708, V2_HI = 5299
const EXPECTED = {
  'Algorithms': 334, 'Computer Organization & Architecture': 238, 'Compiler Design': 234,
  'Computer Networks': 215, 'Databases': 284, 'Digital Logic': 303, 'Operating System': 335,
  'Data Structures': 236, 'Programming in C': 127, 'Theory of Computation': 286,
}
const TYPES = new Set(['NAT', 'MCQ', 'MSQ']), DIFFS = new Set(['easy', 'medium', 'hard'])

function num(id) { const n = parseInt(String(id).replace(/\D/g, ''), 10); return Number.isNaN(n) ? -1 : n }
function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
function words(s) { return norm(s).split(/\s+/).filter(w => w.length > 2) }
function jaccard(aw, bw) {
  const sa = new Set(aw), sb = new Set(bw)
  let inter = 0; for (const w of sa) if (sb.has(w)) inter++
  const union = new Set([...sa, ...sb]).size
  return union ? inter / union : 0
}
function reqMissing(q) {
  const e = []
  const req = (p, v) => { if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) e.push(p) }
  req('question', q.question); req('answer', q.answer); req('to_find', q.to_find); req('formula_note', q.formula_note)
  const m = q.meta || {};['exam', 'year', 'marks', 'difficulty', 'type', 'subject', 'topic', 'subtopic'].forEach(k => req('meta.' + k, m[k]))
  if (m.type && !TYPES.has(m.type)) e.push('bad type ' + m.type)
  if (m.difficulty && !DIFFS.has(m.difficulty)) e.push('bad diff ' + m.difficulty)
  const u = q.understand || {}; req('understand.plain', u.plain); req('understand.visual_alt', u.visual_alt)
  if (!Array.isArray(u.keywords) || u.keywords.length < 2) e.push('keywords<2')
  const g = q.given || {}; req('given.aim', g.aim); req('given.plan', g.plan)
  if (!Array.isArray(g.terms) || g.terms.length < 2) e.push('given.terms<2')
  const s = q.solution || {}; req('solution.result', s.result)
  if (!Array.isArray(s.steps) || s.steps.length < 2) e.push('steps<2')
  if (!Array.isArray(q.formula_ids_used)) e.push('fids not array')
  return e
}

async function main() {
  await connect()
  const Q = mongoose.connection.db.collection('questions')
  const all = await Q.find({}).toArray()
  const v2 = all.filter(d => { const n = num(d._id); return n >= V2_LO && n <= V2_HI })
  const v1 = all.filter(d => { const n = num(d._id); return n >= 1001 && n < V2_LO })

  console.log('================ VOLUME 2 ANALYSIS ================')
  console.log(`DB total: ${all.length} | volume1: ${v1.length} | volume2: ${v2.length}`)

  // ── A. ID sequence integrity (volume2) ─────────────────────────────────
  const nums = v2.map(d => num(d._id)).sort((a, b) => a - b)
  let gaps = 0, dupId = 0; const idSet = new Set()
  for (const n of nums) { if (idSet.has(n)) dupId++; idSet.add(n) }
  for (let i = 1; i < nums.length; i++) if (nums[i] !== nums[i - 1] + 1) gaps++
  console.log(`\n[A] ID sequence: pyq_${nums[0]}..pyq_${nums[nums.length - 1]} | gaps: ${gaps} | duplicate ids: ${dupId}`)

  // ── B. Exact duplicate questions within volume2 ─────────────────────────
  const byText = new Map()
  for (const d of v2) {
    const k = norm(d.question)
    if (!byText.has(k)) byText.set(k, [])
    byText.get(k).push(d._id)
  }
  const exactDups = [...byText.entries()].filter(([, ids]) => ids.length > 1)
  console.log(`\n[B] EXACT duplicate questions (identical full text) within volume2: ${exactDups.length} group(s)`)
  exactDups.slice(0, 20).forEach(([k, ids]) => console.log(`    x${ids.length}: ${ids.join(', ')}  :: ${k.slice(0, 70)}`))

  // ── C. Exact duplicates crossing volume2 <-> volume1 ────────────────────
  const v1Text = new Set(v1.map(d => norm(d.question)))
  const cross = v2.filter(d => v1Text.has(norm(d.question)))
  console.log(`\n[C] Volume2 questions identical to a volume1 question: ${cross.length}`)
  cross.slice(0, 10).forEach(d => console.log(`    ${d._id} [${d.meta?.subject}] ${String(d.question).slice(0, 60)}`))

  // ── D. NEAR-duplicate pairs within subject+year (flag for review) ───────
  // GATE linked-answer questions share a long common stem; those are NOT dupes.
  // We separate "very high" (>=0.95, likely true dup) from "high" (0.85-0.95, usually common-stem).
  const groups = {}
  for (const d of v2) { const k = (d.meta?.subject || '') + '|' + (d.meta?.year || ''); (groups[k] = groups[k] || []).push(d) }
  const wordCache = new Map()
  const wc = (d) => { if (!wordCache.has(d._id)) wordCache.set(d._id, words(d.question)); return wordCache.get(d._id) }
  let veryHigh = [], high = 0
  for (const docs of Object.values(groups)) {
    for (let i = 0; i < docs.length; i++) for (let j = i + 1; j < docs.length; j++) {
      const s = jaccard(wc(docs[i]), wc(docs[j]))
      if (s >= 0.95) veryHigh.push([docs[i], docs[j], s])
      else if (s >= 0.85) high++
    }
  }
  console.log(`\n[D] Near-duplicate pairs within same subject+year:`)
  console.log(`    >=0.95 similarity (LIKELY TRUE DUPLICATE - needs review): ${veryHigh.length}`)
  console.log(`    0.85-0.95 similarity (usually linked common-stem questions, expected): ${high}`)
  veryHigh.slice(0, 25).forEach(([a, b, s]) => {
    console.log(`    sim=${s.toFixed(3)}  ${a._id} vs ${b._id}  [${a.meta?.subject} ${a.meta?.year}]`)
    console.log(`        A: ${String(a.question).replace(/\s+/g, ' ').slice(0, 95)}`)
    console.log(`        B: ${String(b.question).replace(/\s+/g, ' ').slice(0, 95)}`)
  })

  // ── E. Schema completeness ──────────────────────────────────────────────
  let invalid = 0; const sampleBad = []
  for (const d of v2) { const e = reqMissing(d); if (e.length) { invalid++; if (sampleBad.length < 10) sampleBad.push(`${d._id}: ${e.slice(0, 4).join(', ')}`) } }
  console.log(`\n[E] Schema completeness: ${v2.length - invalid}/${v2.length} fully valid | ${invalid} with missing fields`)
  sampleBad.forEach(s => console.log(`    ${s}`))

  // ── F. Distribution vs expected (TOC) ───────────────────────────────────
  const bySub = {}, byType = {}, byDiff = {}, byYear = {}
  for (const d of v2) {
    bySub[d.meta?.subject] = (bySub[d.meta?.subject] || 0) + 1
    byType[d.meta?.type] = (byType[d.meta?.type] || 0) + 1
    byDiff[d.meta?.difficulty] = (byDiff[d.meta?.difficulty] || 0) + 1
    byYear[d.meta?.year] = (byYear[d.meta?.year] || 0) + 1
  }
  console.log(`\n[F] Subject counts vs PDF table-of-contents:`)
  let allMatch = true
  for (const s of Object.keys(EXPECTED)) {
    const got = bySub[s] || 0, exp = EXPECTED[s], ok = got === exp
    if (!ok) allMatch = false
    console.log(`    ${ok ? 'OK ' : 'XX '} ${s.padEnd(40)} ${got} / ${exp}`)
  }
  console.log(`    => ${allMatch ? 'ALL SUBJECTS MATCH TOC EXACTLY' : 'MISMATCH FOUND'}`)
  console.log(`\n[G] Type: ${JSON.stringify(byType)}`)
  console.log(`    Difficulty: ${JSON.stringify(byDiff)}`)
  const years = Object.keys(byYear).map(Number).filter(n => n).sort((a, b) => a - b)
  console.log(`    Year span: ${years[0]} .. ${years[years.length - 1]} across ${years.length} distinct years`)
  const noYear = v2.filter(d => !d.meta?.year).length
  if (noYear) console.log(`    WARNING: ${noYear} questions missing a year`)

  console.log('\n================ SUMMARY ================')
  console.log(`Volume2: ${v2.length} questions, pyq_${nums[0]}..pyq_${nums[nums.length - 1]}`)
  console.log(`Exact duplicates: ${exactDups.length} | cross-volume dups: ${cross.length} | likely-true near-dups: ${veryHigh.length}`)
  console.log(`Invalid schema: ${invalid} | subjects match TOC: ${allMatch ? 'YES' : 'NO'} | sequence gaps: ${gaps}`)
  await mongoose.disconnect()
}
main().catch(e => { console.error('FATAL:', e); process.exit(1) })
