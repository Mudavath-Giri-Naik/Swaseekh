const fs = require('fs')
const path = require('path')
const { connect, mongoose } = require('../db')
const OUT_DIR = path.join(__dirname, '..', 'data', 'mock')

async function main() {
  const final = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'final.json'), 'utf8'))
  const byId = new Map(final.map((f) => [f.id, f]))
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')
  const all = await Q.find({}, { projection: { id: 1, 'meta.type': 1, question: 1, answer: 1 } }).toArray()
  const src = new Map(all.map((d) => [d.id, d]))

  // 1) missing entirely
  const finalIds = new Set(final.map((f) => f.id))
  const missing = all.filter((d) => !finalIds.has(d.id)).map((d) => d.id)
  console.log('MISSING:', missing)
  for (const id of missing) {
    const s = src.get(id)
    console.log(`\n--- ${id} (${s.meta?.type}) ans=${JSON.stringify(s.answer)} ---\n${(s.question || '').slice(0, 500)}`)
  }

  // 2) choice w/o options
  console.log('\n\n===== CHOICE WITHOUT OPTIONS =====')
  for (const f of final) {
    const t = src.get(f.id)?.meta?.type
    if ((t === 'MCQ' || t === 'MSQ') && (!f.options || !f.options.length) && !f.isNat && !f.subjective && !f.excluded) {
      const s = src.get(f.id)
      console.log(`\n--- ${f.id} (${t}) ans=${JSON.stringify(s.answer)} ---\n${(s.question || '').slice(0, 600)}`)
    }
  }

  // 3) bad correctOptions count
  console.log('\n\n===== BAD correctOptions COUNT =====')
  let n = 0
  for (const f of final) {
    const t = src.get(f.id)?.meta?.type
    if (!f.options || !f.options.length || f.excluded || f.subjective) continue
    const bad = (t === 'MCQ' && f.correctOptions.length !== 1) || (t === 'MSQ' && f.correctOptions.length < 1)
    if (bad) {
      n++
      const s = src.get(f.id)
      console.log(`${f.id} [${t}] correctOptions=${JSON.stringify(f.correctOptions)} optKeys=${JSON.stringify(f.options.map((o) => o.key))} ans=${JSON.stringify(s.answer)}`)
    }
  }
  console.log('total bad:', n)
  await mongoose.disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
