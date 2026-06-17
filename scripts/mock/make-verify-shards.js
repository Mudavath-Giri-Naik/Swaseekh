// Build verification shards: each auto-parsed choice question, paired with its
// SOURCE question text + answer, so a swarm agent can confirm the structured
// parse is faithful and flag/correct any mistakes. Returns-only-corrections model.

const fs = require('fs')
const path = require('path')
const { connect, mongoose } = require('../db')

const OUT_DIR = path.join(__dirname, '..', 'data', 'mock')
const VERIFY_DIR = path.join(OUT_DIR, 'verify')
const SHARD = 30

async function main() {
  fs.mkdirSync(VERIFY_DIR, { recursive: true })
  const auto = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'auto.json'), 'utf8'))
  // Only verify choice questions that the parser structured (have options).
  const choice = auto.filter((a) => !a.isNat && a.options && a.options.length >= 2)

  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')
  const srcDocs = await Q.find(
    { id: { $in: choice.map((c) => c.id) } },
    { projection: { id: 1, question: 1, answer: 1, 'meta.type': 1 } }
  ).toArray()
  const srcById = new Map(srcDocs.map((d) => [d.id, d]))
  await mongoose.disconnect()

  // clear old shards
  for (const f of fs.existsSync(VERIFY_DIR) ? fs.readdirSync(VERIFY_DIR) : []) {
    if (/^shard-\d+\.json$/.test(f)) fs.unlinkSync(path.join(VERIFY_DIR, f))
  }

  const items = choice.map((c) => {
    const s = srcById.get(c.id)
    return {
      id: c.id,
      type: s?.meta?.type,
      sourceQuestion: s?.question || '',
      sourceAnswer: s?.answer || '',
      parsed: { stem: c.stem, options: c.options, correctOptions: c.correctOptions, excluded: c.excluded },
    }
  })

  let shardCount = 0
  for (let i = 0; i < items.length; i += SHARD) {
    const slice = items.slice(i, i + SHARD)
    const n = String(shardCount).padStart(3, '0')
    fs.writeFileSync(path.join(VERIFY_DIR, `shard-${n}.json`), JSON.stringify(slice, null, 2))
    shardCount++
  }
  console.log(`verify items: ${items.length}, shards: ${shardCount} (size ${SHARD}) in ${VERIFY_DIR}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
