// Patch the small residual set on final.json deterministically:
//  - re-map the 28 "bad correctOptions count" records from their source answer
//    using a corrected lead-letter / pure-letter-list rule
//  - mark un-renderable diagram/descriptive questions as subjective
// Then writes final.json back. Run before merge-and-import --write.

const fs = require('fs')
const path = require('path')
const { connect, mongoose } = require('../db')
const OUT_DIR = path.join(__dirname, '..', 'data', 'mock')

const SUBJECTIVE_IDS = new Set(['pyq_3427', 'pyq_4201', 'pyq_5115', 'pyq_5179'])

function mapAnswerFixed(answer, optKeys) {
  const a = (answer || '').trim()
  const excluded = /^x[\.\)\s]/i.test(a)
  // group (a): a pure list of option letters ("A, B" / "B, C, D" / "A and C")
  if (/^\(?[A-H]\)?(\s*(,|and|&)\s*\(?[A-H]\)?)+$/i.test(a)) {
    const keys = [...new Set((a.match(/[A-H]/gi) || []).map((s) => s.toUpperCase()))].filter((k) => optKeys.includes(k))
    return { keys, excluded }
  }
  // lead letter: "B. D Latch" / "D. (A) and (B)" / "C. A pointer..." -> take ONLY the lead
  const lead = a.match(/^\(?([A-H])[\.\)\:]/)
  if (lead) {
    const k = lead[1].toUpperCase()
    return { keys: optKeys.includes(k) ? [k] : [], excluded }
  }
  // bare single letter
  if (/^\(?[A-H]\)?$/.test(a)) {
    const k = a.replace(/[()]/g, '').toUpperCase()
    return { keys: optKeys.includes(k) ? [k] : [], excluded }
  }
  return { keys: [], excluded }
}

async function main() {
  const final = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'final.json'), 'utf8'))
  const byId = new Map(final.map((f) => [f.id, f]))

  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')
  const all = await Q.find({}, { projection: { id: 1, 'meta.type': 1, question: 1, answer: 1 } }).toArray()
  const src = new Map(all.map((d) => [d.id, d]))

  let remapped = 0, subjectified = 0, added = 0

  // 1) Add any record missing from final entirely (was dropped by an agent)
  for (const d of all) {
    if (!byId.has(d.id)) {
      const rec = { id: d.id, isNat: false, subjective: true, excluded: false, options: [], correctOptions: [], stem: (d.question || '').trim() }
      byId.set(d.id, rec); added++
    }
  }

  // 2) Re-map bad correctOptions counts
  for (const f of byId.values()) {
    const t = src.get(f.id)?.meta?.type
    if (!f.options || !f.options.length || f.excluded || f.subjective) continue
    const optKeys = f.options.map((o) => o.key)
    const badMcq = t === 'MCQ' && f.correctOptions.length !== 1
    const badMsq = t === 'MSQ' && f.correctOptions.length < 1
    if (badMcq || badMsq) {
      const ans = src.get(f.id)?.answer || ''
      const m = mapAnswerFixed(ans, optKeys)
      if (m.keys.length) { f.correctOptions = m.keys; f.excluded = m.excluded; remapped++ }
    }
  }

  // 3) Force diagram/descriptive items to subjective
  for (const id of SUBJECTIVE_IDS) {
    const f = byId.get(id)
    if (f) { f.subjective = true; f.options = []; f.correctOptions = []; f.isNat = false; subjectified++ }
  }

  const out = [...byId.values()]
  fs.writeFileSync(path.join(OUT_DIR, 'final.json'), JSON.stringify(out))
  console.log(`added: ${added}, remapped: ${remapped}, subjectified: ${subjectified}, total: ${out.length}`)

  // verify no more bad counts
  let stillBad = 0, noOpts = 0
  for (const f of out) {
    const t = src.get(f.id)?.meta?.type
    if (f.subjective || f.isNat || f.excluded) continue
    if (!f.options.length) { if (t === 'MCQ' || t === 'MSQ') noOpts++; continue }
    const eff = f.correctOptions.length > 1 ? 'MSQ' : t
    if (eff === 'MCQ' && f.correctOptions.length !== 1) stillBad++
    if (eff === 'MSQ' && f.correctOptions.length < 1) stillBad++
  }
  console.log(`after patch -> choice w/o options: ${noOpts}, bad correctOptions: ${stillBad}`)
  await mongoose.disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
