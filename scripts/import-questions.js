// Generic question importer.
//   node scripts/import-questions.js <data-module>
// e.g. node scripts/import-questions.js ./data/ch1-questions
//
// Pipeline (matches the user's 9-step spec):
//   1. Connect to live DB.
//   2. Load every existing formula id (across all content docs) for validation.
//   3. Load every existing question for dedup (meta.subtopic + normalized text + meta.year)
//      and to compute the next free pyq_#### id.
//   4. Validate each candidate doc (required fields, type/difficulty enums,
//      every formula_id exists, no empty required fields, steps well-formed).
//   5. Skip duplicates (logged) and invalid docs (logged, NOT inserted).
//   6. Assign sequential pyq_#### ids.
//   7. Insert in batches of 10; print inserted/failed per batch.
const { connect, mongoose } = require('./db')

const TYPES = new Set(['NAT', 'MCQ', 'MSQ'])
const DIFFS = new Set(['easy', 'medium', 'hard'])

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
function dedupKey(q) {
  return `${norm(q.meta && q.meta.subtopic)}|${q.meta && q.meta.year}|${norm(q.question).slice(0, 120)}`
}

async function loadFormulaIds(C) {
  const docs = await C.find({}).toArray()
  const ids = new Set()
  for (const d of docs) for (const g of d.groups || []) for (const f of g.formulas || []) if (f.formulaId) ids.add(f.formulaId)
  return ids
}

function validate(q, formulaIds, idx) {
  const errs = []
  const req = (path, val) => { if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) errs.push(`missing/empty ${path}`) }

  req('question', q.question)
  req('answer', q.answer)
  req('to_find', q.to_find)
  req('formula_note', q.formula_note)

  const m = q.meta || {}
  req('meta.exam', m.exam); req('meta.year', m.year); req('meta.marks', m.marks)
  req('meta.difficulty', m.difficulty); req('meta.type', m.type)
  req('meta.subject', m.subject); req('meta.topic', m.topic); req('meta.subtopic', m.subtopic)
  if (m.type && !TYPES.has(m.type)) errs.push(`meta.type "${m.type}" not in NAT/MCQ/MSQ`)
  if (m.difficulty && !DIFFS.has(m.difficulty)) errs.push(`meta.difficulty "${m.difficulty}" not in easy/medium/hard`)

  const u = q.understand || {}
  req('understand.plain', u.plain)
  req('understand.visual_alt', u.visual_alt)
  if (!Array.isArray(u.keywords) || u.keywords.length === 0) errs.push('understand.keywords empty')
  else u.keywords.forEach((k, i) => { req(`keyword[${i}].term`, k.term); req(`keyword[${i}].explain`, k.explain); req(`keyword[${i}].example`, k.example) })

  const g = q.given || {}
  req('given.aim', g.aim); req('given.plan', g.plan)
  if (!Array.isArray(g.terms) || g.terms.length === 0) errs.push('given.terms empty')
  else g.terms.forEach((t, i) => { req(`given.term[${i}].term`, t.term); req(`given.term[${i}].meaning`, t.meaning); req(`given.term[${i}].example`, t.example); req(`given.term[${i}].connects`, t.connects) })

  const s = q.solution || {}
  req('solution.result', s.result)
  if (!Array.isArray(s.steps) || s.steps.length === 0) errs.push('solution.steps empty')
  else s.steps.forEach((st, i) => {
    req(`step[${i}].title`, st.title); req(`step[${i}].apply`, st.apply)
    if (typeof st.step !== 'number') errs.push(`step[${i}].step not a number`)
    if (st.formula_id && !formulaIds.has(st.formula_id)) errs.push(`step[${i}].formula_id "${st.formula_id}" NOT in DB`)
  })

  if (!Array.isArray(q.formula_ids_used)) errs.push('formula_ids_used not array')
  else q.formula_ids_used.forEach((fid) => { if (fid && !formulaIds.has(fid)) errs.push(`formula_ids_used "${fid}" NOT in DB`) })

  return errs
}

async function main() {
  const mod = process.argv[2]
  if (!mod) { console.error('Usage: node scripts/import-questions.js <data-module>'); process.exit(1) }
  const candidates = require(mod)
  if (!Array.isArray(candidates)) { console.error('Data module must export an array'); process.exit(1) }
  console.log(`Loaded ${candidates.length} candidate questions from ${mod}`)

  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')
  const C = db.collection('content')

  const formulaIds = await loadFormulaIds(C)
  console.log(`Known formula ids: ${formulaIds.size}`)

  // existing docs → dedup set + max numeric id
  const existing = await Q.find({}, { projection: { _id: 1, id: 1, question: 1, 'meta.subtopic': 1, 'meta.year': 1 } }).toArray()
  const seen = new Set(existing.map((d) => dedupKey({ question: d.question, meta: { subtopic: d.meta && d.meta.subtopic, year: d.meta && d.meta.year } })))
  let maxNum = 0
  for (const d of existing) {
    const n = parseInt(String(d._id).replace(/\D/g, ''), 10)
    if (!Number.isNaN(n) && n > maxNum) maxNum = n
  }
  let nextNum = Math.max(1000, maxNum) + 1
  console.log(`Existing questions: ${existing.length}; next id starts at pyq_${nextNum}`)

  // validate + dedup + assign ids
  const toInsert = []
  const dupes = []
  const invalid = []
  const batchSeen = new Set()
  for (let i = 0; i < candidates.length; i++) {
    const q = candidates[i]
    const errs = validate(q, formulaIds, i)
    if (errs.length) { invalid.push({ i, q: (q.question || '').slice(0, 70), errs }); continue }
    const key = dedupKey(q)
    if (seen.has(key) || batchSeen.has(key)) { dupes.push({ i, q: (q.question || '').slice(0, 70) }); continue }
    batchSeen.add(key)
    const id = `pyq_${nextNum++}`
    toInsert.push({ _id: id, id, ...q })
  }

  console.log(`\nValidation: ${toInsert.length} ready, ${dupes.length} duplicates, ${invalid.length} invalid`)
  if (dupes.length) { console.log('-- duplicates skipped --'); dupes.forEach((d) => console.log(`   [${d.i}] ${d.q}`)) }
  if (invalid.length) { console.log('-- INVALID (not inserted) --'); invalid.forEach((d) => console.log(`   [${d.i}] ${d.q}\n        ${d.errs.join('; ')}`)) }

  // batch insert (batches of 10)
  let inserted = 0, failed = 0
  for (let b = 0; b < toInsert.length; b += 10) {
    const batch = toInsert.slice(b, b + 10)
    try {
      const res = await Q.insertMany(batch, { ordered: false })
      inserted += res.insertedCount
      console.log(`Batch ${b / 10 + 1}: inserted ${res.insertedCount}/${batch.length}  (${batch[0]._id}..${batch[batch.length - 1]._id})`)
    } catch (e) {
      const ok = e.result ? e.result.insertedCount : 0
      inserted += ok
      failed += batch.length - ok
      console.log(`Batch ${b / 10 + 1}: inserted ${ok}/${batch.length}, FAILED ${batch.length - ok} — ${e.message}`)
    }
  }

  console.log(`\n=== IMPORT COMPLETE === inserted: ${inserted}, failed: ${failed}, duplicates: ${dupes.length}, invalid: ${invalid.length}`)
  await mongoose.disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
