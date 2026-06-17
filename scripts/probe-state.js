// One-off probe: report DB state relevant to mock-tests build.
const { connect, mongoose } = require('./db')

async function main() {
  await connect()
  const db = mongoose.connection.db
  const cols = await db.listCollections().toArray()
  console.log('=== COLLECTIONS ===')
  for (const c of cols) {
    const n = await db.collection(c.name).countDocuments()
    console.log(`${c.name}: ${n}`)
  }

  const Q = db.collection('questions')
  const total = await Q.countDocuments()
  console.log(`\n=== questions total: ${total} ===`)

  // Year distribution
  const byYear = await Q.aggregate([
    { $group: { _id: '$meta.year', n: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]).toArray()
  console.log('\n=== by meta.year ===')
  byYear.forEach((y) => console.log(`${y._id}: ${y.n}`))

  // Type / difficulty / marks distribution
  for (const f of ['meta.type', 'meta.difficulty', 'meta.marks', 'meta.subject', 'meta.exam']) {
    const agg = await Q.aggregate([
      { $group: { _id: `$${f}`, n: { $sum: 1 } } },
      { $sort: { n: -1 } },
    ]).toArray()
    console.log(`\n=== by ${f} ===`)
    agg.forEach((a) => console.log(`${JSON.stringify(a._id)}: ${a.n}`))
  }

  // Do any have options?
  const withOptions = await Q.countDocuments({ options: { $exists: true, $ne: null } })
  const withOptionsArr = await Q.countDocuments({ 'options.0': { $exists: true } })
  console.log(`\n=== questions with 'options' field: ${withOptions} (non-empty array: ${withOptionsArr}) ===`)

  // Sample one full doc, list all top-level keys
  const sample = await Q.findOne({})
  console.log('\n=== sample top-level keys ===')
  console.log(Object.keys(sample || {}))
  console.log('\n=== sample.meta ===')
  console.log(JSON.stringify(sample?.meta, null, 2))
  console.log('\n=== sample.question ===')
  console.log((sample?.question || '').slice(0, 300))
  console.log('\n=== sample.answer ===')
  console.log(JSON.stringify(sample?.answer))
  console.log('\n=== sample.options (if any) ===')
  console.log(JSON.stringify(sample?.options))

  await mongoose.disconnect()
  console.log('\nDone.')
}
main().catch((e) => { console.error('PROBE ERROR:', e.message); process.exit(1) })
