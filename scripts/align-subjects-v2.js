// Align volume2 CS subject names to the curated 'subjects' collection so the
// Question Bank, Syllabus nav, cross-navigation, and dashboard all agree.
//   'Computer Organization & Architecture' -> 'Computer Organization and Architecture'
//   'Data Structures'                      -> 'Programming and Data Structures'
//   'Programming in C'                     -> 'Programming and Data Structures'
// Updates BOTH the live DB and the on-disk auto-v2/*.json source (so they stay in sync).
//   node scripts/align-subjects-v2.js          (live)
//   node scripts/align-subjects-v2.js --dry     (report only)
const { connect, mongoose } = require('./db')
const fs = require('fs')
const path = require('path')

const DRY = process.argv.includes('--dry')
const AUTO = path.join(__dirname, 'data', 'auto-v2')
const RENAMES = [
  ['Computer Organization & Architecture', 'Computer Organization and Architecture'],
  ['Data Structures', 'Programming and Data Structures'],
  ['Programming in C', 'Programming and Data Structures'],
]
const MAP = Object.fromEntries(RENAMES)

async function main() {
  // ── DB update ────────────────────────────────────────────────────────────
  await connect()
  const Q = mongoose.connection.db.collection('questions')
  console.log('=== DB updates ===')
  for (const [from, to] of RENAMES) {
    const n = await Q.countDocuments({ 'meta.subject': from })
    console.log(`  "${from}" -> "${to}": ${n} docs`)
    if (!DRY && n) await Q.updateMany({ 'meta.subject': from }, { $set: { 'meta.subject': to } })
  }
  const after = await Q.aggregate([{ $group: { _id: '$meta.subject', n: { $sum: 1 } } }, { $sort: { n: -1 } }]).toArray()
  console.log(DRY ? '\n[DRY] current subjects:' : '\nSubjects after update:')
  after.forEach(s => console.log(`  ${s._id}: ${s.n}`))

  // ── auto-v2 source files (keep on-disk in sync with DB) ───────────────────
  console.log('\n=== auto-v2 source files ===')
  const files = fs.existsSync(AUTO) ? fs.readdirSync(AUTO).filter(f => f.endsWith('.json')) : []
  let changedFiles = 0, changedQ = 0
  for (const f of files) {
    const p = path.join(AUTO, f)
    let obj; try { obj = JSON.parse(fs.readFileSync(p, 'utf8')) } catch { continue }
    let touched = false
    for (const q of obj.questions || []) {
      if (q.meta && MAP[q.meta.subject]) { q.meta.subject = MAP[q.meta.subject]; touched = true; changedQ++ }
    }
    if (touched) { changedFiles++; if (!DRY) fs.writeFileSync(p, JSON.stringify(obj, null, 1)) }
  }
  console.log(`  ${DRY ? 'would update' : 'updated'} ${changedQ} questions across ${changedFiles} files`)

  await mongoose.disconnect()
  console.log(`\n${DRY ? '[DRY RUN — nothing written]' : 'DONE'}`)
}
main().catch(e => { console.error('FATAL:', e); process.exit(1) })
