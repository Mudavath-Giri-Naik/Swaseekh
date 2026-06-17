// Merge deterministic parse + swarm repairs + swarm verify-corrections, then
// write the structured option fields back to the `questions` collection
// ADDITIVELY (only $set new fields: options, correctOptions, stem, isNat,
// subjective, excluded, optionsSource). NEVER touches question / answer / meta.
//
// Run AFTER the mock-options-swarm workflow finishes.
//   node scripts/mock/merge-and-import.js          # dry run (writes final.json, prints coverage)
//   node scripts/mock/merge-and-import.js --write   # actually write to DB

const fs = require('fs')
const path = require('path')
const { connect, mongoose } = require('../db')

const OUT_DIR = path.join(__dirname, '..', 'data', 'mock')
const WRITE = process.argv.includes('--write')

function readJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch (e) { return null }
}
function readShardDir(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/^shard-\d+\.json$/.test(f)) continue
    const data = readJsonSafe(path.join(dir, f))
    if (Array.isArray(data)) out.push(...data)
    else console.warn(`WARN: ${f} not a valid JSON array — skipped`)
  }
  return out
}

function normKey(k) { return String(k || '').trim().toUpperCase().replace(/[^A-H]/g, '') }

function cleanRecord(r) {
  const options = Array.isArray(r.options)
    ? r.options
        .map((o) => ({ key: normKey(o.key), text: String(o.text ?? '').trim() }))
        .filter((o) => o.key)
    : []
  let correctOptions = Array.isArray(r.correctOptions)
    ? [...new Set(r.correctOptions.map(normKey).filter(Boolean))]
    : []
  // Drop correct keys that aren't present among options
  const optKeys = new Set(options.map((o) => o.key))
  if (options.length) correctOptions = correctOptions.filter((k) => optKeys.has(k))
  return {
    id: r.id,
    isNat: !!r.isNat,
    subjective: !!r.subjective,
    excluded: !!r.excluded,
    options,
    correctOptions,
    stem: String(r.stem ?? '').trim(),
  }
}

async function main() {
  const auto = readJsonSafe(path.join(OUT_DIR, 'auto.json')) || []
  const repairs = readShardDir(path.join(OUT_DIR, 'review-out'))
  const corrections = readShardDir(path.join(OUT_DIR, 'verify-out'))

  console.log(`auto: ${auto.length}, repairs: ${repairs.length}, verify-corrections: ${corrections.length}`)

  // Base map from auto
  const byId = new Map()
  for (const r of auto) byId.set(r.id, cleanRecord(r))
  // Repairs add/replace the review items (these ids were NOT in auto)
  for (const r of repairs) byId.set(r.id, cleanRecord(r))
  // Verify corrections override specific fields on existing records
  let applied = 0
  for (const c of corrections) {
    const base = byId.get(c.id)
    if (!base) { byId.set(c.id, cleanRecord(c)); applied++; continue }
    const merged = cleanRecord({ ...base, ...c })
    byId.set(c.id, merged)
    applied++
  }
  console.log(`verify corrections applied: ${applied}`)

  const final = [...byId.values()]
  fs.writeFileSync(path.join(OUT_DIR, 'final.json'), JSON.stringify(final))

  // ─── Coverage check against the DB ──────────────────────────────────────
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')
  const allMeta = await Q.find({}, { projection: { id: 1, 'meta.type': 1 } }).toArray()
  const typeById = new Map(allMeta.map((d) => [d.id, d.meta?.type || 'MCQ']))

  const finalIds = new Set(final.map((f) => f.id))
  const missing = []
  for (const d of allMeta) if (!finalIds.has(d.id)) missing.push(d.id)

  // every MCQ/MSQ must have options OR be justified (isNat/subjective/excluded)
  const unresolved = []
  let withOptions = 0, natCount = 0, subjCount = 0, exclCount = 0, badCorrect = 0
  for (const f of final) {
    const t = typeById.get(f.id)
    if (f.options.length) {
      withOptions++
      if (!f.excluded && !f.subjective) {
        if (t === 'MCQ' && f.correctOptions.length !== 1) badCorrect++
        if (t === 'MSQ' && f.correctOptions.length < 1) badCorrect++
      }
    } else {
      if (f.isNat) natCount++
      else if (f.subjective) subjCount++
      else if (f.excluded) exclCount++
      else if (t === 'MCQ' || t === 'MSQ') unresolved.push({ id: f.id, type: t })
    }
  }

  console.log('\n=== COVERAGE ===')
  console.log(`final records: ${final.length} / db questions: ${allMeta.length}`)
  console.log(`db questions with NO final record (missing): ${missing.length}`)
  if (missing.length) console.log('  missing ids sample:', missing.slice(0, 20))
  console.log(`with structured options: ${withOptions}`)
  console.log(`NAT (numeric): ${natCount}, subjective: ${subjCount}, excluded(no opts): ${exclCount}`)
  console.log(`choice questions still WITHOUT options (unresolved): ${unresolved.length}`)
  if (unresolved.length) console.log('  unresolved sample:', unresolved.slice(0, 30))
  console.log(`choice w/ options but bad correctOptions count: ${badCorrect}`)

  if (WRITE) {
    console.log('\n=== WRITING to DB (additive $set) ===')
    let n = 0
    const bulk = Q.initializeUnorderedBulkOp()
    for (const f of final) {
      bulk.find({ id: f.id }).updateOne({
        $set: {
          options: f.options,
          correctOptions: f.correctOptions,
          stem: f.stem || undefined,
          isNat: f.isNat,
          subjective: f.subjective,
          excluded: f.excluded,
          optionsSource: 'parsed-2026-06',
        },
      })
      n++
    }
    if (n) {
      const res = await bulk.execute()
      console.log(`bulk modified: ${res.modifiedCount}, matched: ${res.matchedCount}`)
    }
  } else {
    console.log('\n(dry run — pass --write to persist. final.json written.)')
  }

  await mongoose.disconnect()
}
main().catch((e) => { console.error('IMPORT ERROR:', e); process.exit(1) })
