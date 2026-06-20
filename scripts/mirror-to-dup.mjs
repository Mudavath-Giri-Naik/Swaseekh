// Mirror the 5 aptitude_* collections from main `swaseekh` (cluster u5kk52w)
// into the E:\dup clone `swaseekh_clone` (cluster mxbra1s). Clean-replace; touches nothing else.
import { readFileSync } from 'fs'
import mongoose from 'mongoose'

function readEnv(path) {
  const env = readFileSync(path, 'utf-8'); const E = {}
  for (const l of env.split('\n')) { const i = l.indexOf('='); if (i < 0) continue; const k = l.slice(0, i).trim(); let v = l.slice(i + 1).trim(); if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); if (k) E[k] = v }
  return E
}
const main = readEnv('e:/Swaseekh-main/Swaseekh-main/.env.local')
const dup = readEnv('e:/dup/.env.local')

const COLLS = ['aptitude_concepts', 'aptitude_models', 'aptitude_formulas', 'aptitude_questions', 'aptitude_meta']

async function main_() {
  console.log('Source: swaseekh (main)  ->  Target: swaseekh_clone (E:\\dup)')
  const src = await mongoose.createConnection(main['MONGODB_URI'], { dbName: 'swaseekh' }).asPromise()
  const tgt = await mongoose.createConnection(dup['MONGODB_URI'], { dbName: dup['MONGODB_DB_NAME'] || 'swaseekh_clone' }).asPromise()
  console.log('Connected to both clusters.')

  for (const c of COLLS) {
    const docs = await src.db.collection(c).find({}).toArray()
    await tgt.db.collection(c).deleteMany({})
    if (docs.length) {
      for (let i = 0; i < docs.length; i += 500) await tgt.db.collection(c).insertMany(docs.slice(i, i + 500), { ordered: false })
    }
    const n = await tgt.db.collection(c).countDocuments()
    console.log(`  ${c}: copied ${docs.length} -> target now ${n}`)
  }

  const q = await tgt.db.collection('aptitude_questions').countDocuments()
  const con = await tgt.db.collection('aptitude_concepts').countDocuments()
  console.log(`\nDONE. swaseekh_clone now has ${q} aptitude_questions across ${con} concepts.`)
  await src.close(); await tgt.close()
}
main_().catch(e => { console.error('Mirror failed:', e.message); process.exit(1) })
