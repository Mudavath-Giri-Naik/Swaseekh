// Phase 3: publish the authored formula sheets + link questions to them.
// 1. Upsert every scripts/data/content-v3/<conceptId>.json into the 'content' collection.
// 2. From the Phase-2 workflow output, build (subject, subtopic) -> [formulaIds].
// 3. Set formula_ids_used on questions of that (subject, subtopic) — ONLY where it is
//    currently empty/missing, so volume1's existing curated links are preserved.
//   node scripts/apply-formula-sheets.js <phase2-workflow-output> [--dry]
const { connect, mongoose } = require('./db')
const fs = require('fs')
const path = require('path')

const DRY = process.argv.includes('--dry')
const DATA = path.join(__dirname, 'data')
const CONTENT_DIR = path.join(DATA, 'content-v3')

function parseMaps(file) {
  const raw = fs.readFileSync(file, 'utf8')
  let obj; try { obj = JSON.parse(raw) } catch { const i = raw.indexOf('{'); obj = JSON.parse(raw.slice(i)) }
  return obj.result?.maps || obj.maps || []
}

async function main() {
  const wfFile = process.argv[2]
  if (!wfFile || !fs.existsSync(wfFile)) { console.error('Usage: node apply-formula-sheets.js <phase2-output> [--dry]'); process.exit(1) }

  // concept -> subject (from inventory)
  const inventory = JSON.parse(fs.readFileSync(path.join(DATA, 'concept-inventory.json'), 'utf8'))
  const conceptSubject = {}
  for (const s of inventory) for (const c of s.concepts) conceptSubject[c.conceptId] = s.subject

  // build (subject, subtopic) -> formulaIds from phase-2 maps
  const maps = parseMaps(wfFile)
  const link = {} // subject -> subtopic -> [fids]
  for (const m of maps) {
    const subj = conceptSubject[m.conceptId]
    if (!subj) continue
    for (const sf of m.subtopicFormulas || []) {
      if (!sf.subtopic || !Array.isArray(sf.formulaIds) || !sf.formulaIds.length) continue
      ;(link[subj] = link[subj] || {})[sf.subtopic] = sf.formulaIds
    }
  }
  fs.writeFileSync(path.join(DATA, 'subtopic-formula-map.json'), JSON.stringify(link, null, 1))
  const pairCount = Object.values(link).reduce((n, m) => n + Object.keys(m).length, 0)
  console.log(`Built (subject,subtopic)->formulaIds for ${pairCount} pairs across ${Object.keys(link).length} subjects`)

  await connect()
  const db = mongoose.connection.db
  const Content = db.collection('content'), Q = db.collection('questions')

  // ── 1. Upsert content docs ────────────────────────────────────────────────
  const files = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json')) : []
  let upserted = 0, badDocs = 0, totalFormulas = 0
  const seenFids = new Set(); let dupFids = 0
  for (const f of files) {
    let doc; try { doc = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8')) } catch { badDocs++; console.log('  BAD JSON:', f); continue }
    if (!doc.conceptId) doc.conceptId = path.basename(f, '.json')
    if (!doc._id) doc._id = doc.conceptId
    for (const g of doc.groups || []) for (const fm of g.formulas || []) { totalFormulas++; if (fm.formulaId) { if (seenFids.has(fm.formulaId)) dupFids++; seenFids.add(fm.formulaId) } }
    if (!DRY) await Content.replaceOne({ _id: doc._id }, doc, { upsert: true })
    upserted++
  }
  console.log(`Content docs: ${upserted} upserted, ${badDocs} bad, ${totalFormulas} formulas (${dupFids} duplicate formulaIds across sheets)`)

  // ── 2. Link questions (only where formula_ids_used is empty/missing) ───────
  let updatedQ = 0, pairsApplied = 0
  for (const [subject, sub] of Object.entries(link)) {
    for (const [subtopic, fids] of Object.entries(sub)) {
      const filter = {
        'meta.subject': subject, 'meta.subtopic': subtopic,
        $or: [{ formula_ids_used: { $exists: false } }, { formula_ids_used: { $size: 0 } }],
      }
      if (DRY) { updatedQ += await Q.countDocuments(filter); pairsApplied++; continue }
      const r = await Q.updateMany(filter, { $set: { formula_ids_used: fids } })
      updatedQ += r.modifiedCount; pairsApplied++
    }
  }
  console.log(`Questions ${DRY ? 'WOULD BE' : ''} linked: ${updatedQ} (across ${pairsApplied} subject+subtopic pairs)`)

  // ── 3. Coverage report ────────────────────────────────────────────────────
  const totalQ = await Q.countDocuments()
  const withFids = await Q.countDocuments({ formula_ids_used: { $exists: true, $ne: [] } })
  console.log(`\nCoverage: ${withFids}/${totalQ} questions now have >=1 formula_ids_used`)
  const contentCount = await Content.countDocuments()
  const conceptsWithSheet = await Content.countDocuments({ 'groups.0': { $exists: true } })
  console.log(`Content collection: ${contentCount} docs, ${conceptsWithSheet} with formula groups`)
  await mongoose.disconnect()
}
main().catch(e => { console.error('FATAL:', e); process.exit(1) })
