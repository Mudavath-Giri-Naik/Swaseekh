// Dedup + resequence script
// 1. Remove near-duplicate documents (same PDF question authored twice)
// 2. Re-assign _id / id to be strictly sequential: pyq_1001, pyq_1002, ...
// Run: node scripts/resequence.js
// Dry run: node scripts/resequence.js --dry

const { connect, mongoose } = require('./db')
const fs = require('fs')
const path = require('path')

const DRY = process.argv.includes('--dry')

function words(s) {
  return new Set(String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(w => w.length > 2))
}

function jaccard(a, b) {
  const wa = words(a), wb = words(b)
  const inter = [...wa].filter(w => wb.has(w)).length
  const union = new Set([...wa, ...wb]).size
  return union ? inter / union : 0
}

async function main() {
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')

  // ── STEP 1: Load all docs ──────────────────────────────────────────────────
  const all = await Q.find({}).toArray()
  console.log(`Loaded ${all.length} documents`)

  // ── STEP 2: Deduplicate using Jaccard word-overlap within subject+year ──────
  // Load pre-computed duplicate IDs from the analysis script
  const dupFile = path.join(__dirname, 'data', 'dupes-to-remove.json')
  const dupIdsToRemove = fs.existsSync(dupFile) ? JSON.parse(fs.readFileSync(dupFile, 'utf8')) : []
  const dupSet = new Set(dupIdsToRemove)
  console.log(`\nDedup: removing ${dupSet.size} pre-identified duplicates (Jaccard>=0.82, same subject+year)`)

  const toDelete = [...dupSet]
  const keep = all.filter(d => !dupSet.has(d._id))

  console.log(`Keeping ${keep.length}, deleting ${toDelete.length} duplicates`)
  if (toDelete.length > 0) {
    console.log('  Duplicate IDs to remove:', toDelete.slice(0, 20).join(', '), toDelete.length > 20 ? `... (+${toDelete.length - 20} more)` : '')
  }

  if (!DRY && toDelete.length > 0) {
    const r = await Q.deleteMany({ _id: { $in: toDelete } })
    console.log(`  Deleted ${r.deletedCount} duplicates`)
  } else if (DRY) {
    console.log('  [DRY RUN] Would delete', toDelete.length, 'duplicates')
  }

  // ── STEP 3: Sort kept docs by their current pyq number ────────────────────
  keep.sort((a, b) => {
    const na = parseInt(String(a._id).replace(/\D/g, ''), 10)
    const nb = parseInt(String(b._id).replace(/\D/g, ''), 10)
    return na - nb
  })

  console.log(`\nResequencing ${keep.length} documents from pyq_1001 to pyq_${1000 + keep.length}`)

  // ── STEP 4: Re-sequence ───────────────────────────────────────────────────
  // Build mapping: old _id → new _id
  const mapping = []
  keep.forEach((doc, i) => {
    const newId = `pyq_${1001 + i}`
    if (doc._id !== newId || doc.id !== newId) {
      mapping.push({ old: doc._id, newId, doc })
    }
  })

  const needChange = mapping.filter(m => m.old !== m.newId)
  console.log(`Documents needing ID change: ${needChange.length}`)

  if (DRY) {
    console.log('[DRY RUN] First 10 ID changes:')
    needChange.slice(0, 10).forEach(m => console.log(`  ${m.old} → ${m.newId}`))
    console.log(`\n[DRY RUN] Final count would be: ${keep.length} (pyq_1001 – pyq_${1000 + keep.length})`)
    await mongoose.disconnect()
    return
  }

  // Process in batches of 50: insert new doc, delete old
  let changed = 0
  const BATCH = 50
  for (let i = 0; i < needChange.length; i += BATCH) {
    const batch = needChange.slice(i, i + BATCH)
    // Build new docs
    const newDocs = batch.map(({ newId, doc }) => {
      const d = { ...doc, _id: newId, id: newId }
      return d
    })
    // Insert new
    try {
      await Q.insertMany(newDocs, { ordered: false })
    } catch (e) {
      // ignore dup key errors (doc already has correct id)
      if (!e.message.includes('E11000')) throw e
    }
    // Delete old
    const oldIds = batch.map(m => m.old)
    await Q.deleteMany({ _id: { $in: oldIds } })
    changed += batch.length
    if (changed % 200 === 0 || i + BATCH >= needChange.length) {
      console.log(`  Resequenced ${changed}/${needChange.length}`)
    }
  }

  // ── STEP 5: Verify ────────────────────────────────────────────────────────
  const finalCount = await Q.countDocuments()
  const sample = await Q.find({}).sort({ _id: 1 }).limit(3).toArray()
  const sampleEnd = await Q.find({}).sort({ _id: -1 }).limit(3).toArray()

  console.log(`\n=== DONE ===`)
  console.log(`Final count: ${finalCount}`)
  console.log(`First IDs:`, sample.map(d => d._id).join(', '))
  console.log(`Last IDs: `, sampleEnd.reverse().map(d => d._id).join(', '))

  // Check for gaps
  const allIds = await Q.find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).toArray()
  let gaps = 0
  for (let i = 0; i < allIds.length; i++) {
    const expected = `pyq_${1001 + i}`
    if (allIds[i]._id !== expected) { gaps++; if (gaps <= 5) console.log(`  GAP at i=${i}: expected ${expected}, got ${allIds[i]._id}`) }
  }
  console.log(gaps === 0 ? '✓ No gaps — perfect sequential order' : `⚠ ${gaps} gaps found`)

  // Save mapping for reference
  const mapOut = needChange.map(m => ({ from: m.old, to: m.newId }))
  fs.writeFileSync(path.join(__dirname, 'data', 'resequence-map.json'), JSON.stringify(mapOut))
  console.log(`Mapping saved to scripts/data/resequence-map.json`)

  await mongoose.disconnect()
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
