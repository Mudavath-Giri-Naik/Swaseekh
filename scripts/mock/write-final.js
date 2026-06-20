// Writes the EXISTING final.json to the DB additively (no rebuild).
// Use after merge-and-import.js (dry run) + patch-residual.js.
const fs = require('fs')
const path = require('path')
const { connect, mongoose } = require('../db')
const OUT_DIR = path.join(__dirname, '..', 'data', 'mock')

async function main() {
  const final = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'final.json'), 'utf8'))
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')
  const bulk = Q.initializeUnorderedBulkOp()
  for (const f of final) {
    bulk.find({ id: f.id }).updateOne({
      $set: {
        options: f.options || [],
        correctOptions: f.correctOptions || [],
        stem: (f.stem && f.stem.length ? f.stem : undefined),
        isNat: !!f.isNat,
        subjective: !!f.subjective,
        excluded: !!f.excluded,
        optionsSource: 'parsed-2026-06',
      },
    })
  }
  const res = await bulk.execute()
  console.log(`wrote final.json (${final.length}) -> modified: ${res.modifiedCount}, matched: ${res.matchedCount}`)
  await mongoose.disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
