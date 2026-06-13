const { connect, mongoose } = require('./db')
const fs = require('fs')
const path = require('path')

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
  const qCount = await Q.countDocuments()
  console.log(`\n=== questions total: ${qCount} ===`)

  // distinct subjects/topics/subtopics
  console.log('\n=== distinct meta.subject ===')
  console.log(await Q.distinct('meta.subject'))
  console.log('\n=== distinct meta.topic ===')
  console.log(await Q.distinct('meta.topic'))
  console.log('\n=== distinct meta.subtopic ===')
  console.log(await Q.distinct('meta.subtopic'))

  // group counts by subtopic
  console.log('\n=== counts by subtopic ===')
  const agg = await Q.aggregate([
    { $group: { _id: { s: '$meta.subject', t: '$meta.topic', st: '$meta.subtopic' }, n: { $sum: 1 } } },
    { $sort: { n: -1 } },
  ]).toArray()
  agg.forEach((a) => console.log(`${a._id.s} / ${a._id.t} / ${a._id.st}: ${a.n}`))

  // dump 3 full sample questions to files
  const samples = await Q.find({}).limit(4).toArray()
  fs.writeFileSync(path.join(__dirname, 'data', 'sample-questions.json'), JSON.stringify(samples, null, 2))
  console.log(`\nWrote ${samples.length} sample questions to scripts/data/sample-questions.json`)

  // dump all _id and id to check id format
  const ids = await Q.find({}, { projection: { _id: 1, id: 1, 'meta.year': 1, 'meta.subtopic': 1, question: 1 } }).toArray()
  fs.writeFileSync(
    path.join(__dirname, 'data', 'existing-ids.json'),
    JSON.stringify(ids.map((d) => ({ _id: d._id, id: d.id, year: d.meta?.year, subtopic: d.meta?.subtopic, q: (d.question || '').slice(0, 90) })), null, 2)
  )
  console.log(`Wrote ${ids.length} id rows to scripts/data/existing-ids.json`)

  // content collection (formulas)
  const C = db.collection('content')
  const cCount = await C.countDocuments()
  console.log(`\n=== content docs: ${cCount} ===`)
  const contentDocs = await C.find({}).toArray()
  fs.writeFileSync(path.join(__dirname, 'data', 'content.json'), JSON.stringify(contentDocs, null, 2))
  console.log(`Wrote ${contentDocs.length} content docs to scripts/data/content.json`)

  // flatten all formula ids
  const formulaIds = []
  for (const d of contentDocs) {
    for (const g of d.groups ?? []) {
      for (const f of g.formulas ?? []) {
        if (f.formulaId) formulaIds.push({ id: f.formulaId, name: f.name, latex: f.latex, concept: d.conceptId, group: g.groupId })
      }
    }
  }
  fs.writeFileSync(path.join(__dirname, 'data', 'formula-ids.json'), JSON.stringify(formulaIds, null, 2))
  console.log(`Total formula entries: ${formulaIds.length}`)

  // subjects collection
  const S = db.collection('subjects')
  const subs = await S.find({}).toArray()
  fs.writeFileSync(path.join(__dirname, 'data', 'subjects.json'), JSON.stringify(subs, null, 2))
  console.log(`\n=== subjects: ${subs.length} ===`)
  subs.forEach((s) => console.log(`${s._id} | ${s.name}`))

  await mongoose.disconnect()
  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
