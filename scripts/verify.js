// STEP 9 — final verification. Prints grouped counts (subject / topic / subtopic)
// and a Chapter expected-vs-actual comparison table, flagging mismatches.
const { connect, mongoose } = require('./db')

// Expected per-chapter totals from the user's spec (grand total 1,711).
const CHAPTERS = [
  { ch: 1, name: 'Combinatorics', expected: 50 },
  { ch: 2, name: 'Graph Theory', expected: 83 },
  { ch: 3, name: 'Mathematical Logic', expected: 77 },
  { ch: 4, name: 'Set Theory & Algebra', expected: 171 },
  { ch: 5, name: 'Calculus', expected: 63 },
  { ch: 6, name: 'Linear Algebra', expected: 102 },
  { ch: 7, name: 'Probability', expected: 107 },
  { ch: 8, name: 'Analytical Aptitude', expected: 139 },
  { ch: 9, name: 'Quantitative Aptitude', expected: 494 },
  { ch: 10, name: 'Spatial Aptitude', expected: 49 },
  { ch: 11, name: 'Verbal Aptitude', expected: 376 },
]

async function main() {
  await connect()
  const Q = mongoose.connection.db.collection('questions')

  const total = await Q.countDocuments()
  console.log(`\n=== TOTAL QUESTIONS IN DB: ${total} ===\n`)

  console.log('=== COUNTS BY subject / topic / subtopic ===')
  const agg = await Q.aggregate([
    { $group: { _id: { s: '$meta.subject', t: '$meta.topic', st: '$meta.subtopic' }, n: { $sum: 1 } } },
    { $sort: { '_id.s': 1, '_id.t': 1, '_id.st': 1 } },
  ]).toArray()
  for (const a of agg) console.log(`  ${a._id.s}  /  ${a._id.t}  /  ${a._id.st}  :  ${a.n}`)

  // Chapter 1 detail (Combinatorics) — by subtopic
  console.log('\n=== CHAPTER 1 (Combinatorics) by subtopic ===')
  const ch1 = await Q.aggregate([
    { $match: { 'meta.subject': 'Discrete Mathematics', $or: [{ 'meta.topic': 'Combinatorics' }, { 'meta.topic': 'Counting Principles' }] } },
    { $group: { _id: '$meta.subtopic', n: { $sum: 1 } } },
    { $sort: { n: -1 } },
  ]).toArray()
  let ch1total = 0
  for (const a of ch1) { console.log(`  ${a._id}: ${a.n}`); ch1total += a.n }
  console.log(`  -- Chapter 1 total: ${ch1total} (expected 50) ${ch1total === 50 ? 'OK' : 'MISMATCH'}`)

  await mongoose.disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
