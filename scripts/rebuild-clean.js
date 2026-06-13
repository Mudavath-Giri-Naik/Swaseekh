// Full clean rebuild of the questions collection.
// 1. Drop existing collection
// 2. Import all auto/ files (deduped)
// 3. Re-sequence pyq_1001, pyq_1002, ... with no gaps using temp IDs
// Run: node scripts/rebuild-clean.js
// Dry run: node scripts/rebuild-clean.js --dry

const { connect, mongoose } = require('./db')
const fs = require('fs')
const path = require('path')

const DRY = process.argv.includes('--dry')
const AUTO = path.join(__dirname, 'data', 'auto')
const TYPES = new Set(['NAT', 'MCQ', 'MSQ'])
const DIFFS = new Set(['easy', 'medium', 'hard'])

function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() }
function dedupKey(q) { return `${norm(q.meta?.subtopic)}|${q.meta?.year}|${norm(q.question).slice(0, 120)}` }

function words(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(w => w.length > 2)
}

function jaccard(a, b) {
  const wa = new Set(words(a)), wb = new Set(words(b))
  const inter = [...wa].filter(w => wb.has(w)).length
  const union = new Set([...wa, ...wb]).size
  return union ? inter / union : 0
}

function coerce(q) {
  if (q.meta && !TYPES.has(q.meta.type)) {
    const opts = /(^|\s)[A-D]\.\s/.test(q.question || '')
    const t = String(q.meta.type || '').toLowerCase()
    q.meta.type = t.includes('multiple') || t.includes('msq') ? 'MSQ' : opts ? 'MCQ' : 'NAT'
  }
  if (q.meta && !DIFFS.has(q.meta.difficulty)) q.meta.difficulty = 'medium'
  if (!q.to_find || !String(q.to_find).trim()) {
    q.to_find = String(q.question || '').replace(/\s*A\.\s.*/s, '').trim().slice(0, 80) || 'See question'
  }
  const u = q.understand || (q.understand = {})
  if (!u.visual_alt?.trim()) u.visual_alt = String(q.to_find || 'Concept illustration')
  if (Array.isArray(u.keywords)) u.keywords.forEach(k => {
    if (k && !k.explain?.trim()) k.explain = String(k.term || 'Key idea') + ' — relevant to this problem.'
    if (k && !k.example?.trim()) k.example = 'See the worked solution.'
  })
  const g = q.given || (q.given = {})
  if (Array.isArray(g.terms)) g.terms.forEach(t => {
    if (t && !t.meaning?.trim()) t.meaning = String(t.term || 'term') + ' used in this question.'
    if (t && !t.example?.trim()) t.example = 'See the worked solution.'
    if (t && !t.connects?.trim()) t.connects = 'Connects to the result.'
  })
  return q
}

async function main() {
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')

  // ── STEP 1: Load all auto/ questions ──────────────────────────────────────
  const files = fs.existsSync(AUTO)
    ? fs.readdirSync(AUTO).filter(f => f.endsWith('.json') && !f.includes('test')).sort()
    : []

  let allQuestions = []
  let badFiles = 0
  for (const f of files) {
    let obj; try { obj = JSON.parse(fs.readFileSync(path.join(AUTO, f), 'utf8')) } catch { badFiles++; continue }
    for (const q of obj.questions || []) {
      allQuestions.push({ ...coerce({ ...q }), __src: f })
    }
  }
  console.log(`Loaded ${allQuestions.length} questions from ${files.length} auto/ files (${badFiles} bad)`)

  // ── STEP 2: Exact dedup by key ─────────────────────────────────────────────
  const seenKey = new Set()
  const afterExactDedup = []
  let exactDupes = 0
  for (const q of allQuestions) {
    const k = dedupKey(q)
    if (seenKey.has(k)) { exactDupes++; continue }
    seenKey.add(k)
    afterExactDedup.push(q)
  }
  console.log(`After exact dedup: ${afterExactDedup.length} (removed ${exactDupes} exact dupes)`)

  // ── STEP 3: Jaccard dedup within same subject+year ─────────────────────────
  const subjectYearGroups = {}
  for (const q of afterExactDedup) {
    const k = (q.meta?.subject || '') + '|' + (q.meta?.year || '')
    ;(subjectYearGroups[k] = subjectYearGroups[k] || []).push(q)
  }
  const toRemove = new Set()
  for (const [k, docs] of Object.entries(subjectYearGroups)) {
    if (docs.length < 2) continue
    for (let i = 0; i < docs.length; i++) {
      if (toRemove.has(i)) continue
      for (let j = i + 1; j < docs.length; j++) {
        if (toRemove.has(j)) continue
        if (jaccard(docs[i].question, docs[j].question) >= 0.82) {
          toRemove.add(j) // keep i (earlier in sort order = lower page)
        }
      }
    }
    // Mark by reference using a flag
    docs.forEach((d, idx) => { if (toRemove.has(idx)) d.__remove = true })
    toRemove.clear()
  }
  const finalQuestions = afterExactDedup.filter(q => !q.__remove)
  console.log(`After Jaccard dedup: ${finalQuestions.length}`)

  if (DRY) {
    console.log(`[DRY RUN] Would insert ${finalQuestions.length} questions (pyq_1001–pyq_${1000 + finalQuestions.length})`)
    await mongoose.disconnect()
    return
  }

  // ── STEP 4: Drop existing collection ─────────────────────────────────────
  const existingCount = await Q.countDocuments()
  console.log(`\nDropping existing collection (${existingCount} docs)...`)
  await Q.drop().catch(() => {}) // ignore if doesn't exist
  console.log('Collection dropped.')

  // ── STEP 5: Insert all with sequential IDs (no collision possible) ─────────
  const newDocs = finalQuestions.map((q, i) => {
    const id = `pyq_${1001 + i}`
    const doc = { _id: id, id, ...q }
    delete doc.__src; delete doc.__remove
    return doc
  })
  console.log(`Inserting ${newDocs.length} documents (pyq_1001 – pyq_${1000 + newDocs.length})...`)

  let inserted = 0
  const BATCH = 100
  for (let b = 0; b < newDocs.length; b += BATCH) {
    const batch = newDocs.slice(b, b + BATCH)
    const r = await Q.insertMany(batch, { ordered: false })
    inserted += r.insertedCount
    if ((b / BATCH) % 10 === 0 || b + BATCH >= newDocs.length) console.log(`  ${inserted}/${newDocs.length} inserted`)
  }

  // ── STEP 6: Verify ────────────────────────────────────────────────────────
  const finalCount = await Q.countDocuments()
  const allIds = await Q.find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).toArray()

  // Sort by numeric value for gap check
  allIds.sort((a, b) => {
    const na = parseInt(String(a._id).replace(/\D/g, ''), 10)
    const nb = parseInt(String(b._id).replace(/\D/g, ''), 10)
    return na - nb
  })

  let gaps = 0
  for (let i = 0; i < allIds.length; i++) {
    const expected = `pyq_${1001 + i}`
    if (allIds[i]._id !== expected) { gaps++; if (gaps <= 3) console.log(`  GAP: expected ${expected}, got ${allIds[i]._id}`) }
  }

  const bySubj = await Q.aggregate([{ $group: { _id: '$meta.subject', n: { $sum: 1 } } }, { $sort: { n: -1 } }]).toArray()
  console.log(`\n=== REBUILD COMPLETE ===`)
  console.log(`Total: ${finalCount} | Gaps: ${gaps}`)
  console.log(`Range: ${allIds[0]?._id} – ${allIds[allIds.length - 1]?._id}`)
  console.log('By subject:')
  for (const s of bySubj) console.log(`  ${s._id}: ${s.n}`)

  await mongoose.disconnect()
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
