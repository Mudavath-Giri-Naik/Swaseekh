// Sync new formula content docs into the `content` collection.
// - Never duplicates a formulaId that already exists ANYWHERE (the info route
//   flattens across all content docs).
// - Creates a new content doc per conceptId if missing; otherwise merges groups
//   and appends only brand-new formulas.
//
// Usage: node scripts/sync-formulas.js
const crypto = require('crypto')
const { connect, mongoose } = require('./db')
const toAdd = require(process.argv[2] || './data/formulas-add')

async function loadExistingFormulaIds(C) {
  const docs = await C.find({}).toArray()
  const ids = new Set()
  for (const d of docs) {
    for (const g of d.groups || []) {
      for (const f of g.formulas || []) {
        if (f.formulaId) ids.add(f.formulaId)
      }
    }
  }
  return ids
}

async function main() {
  await connect()
  const C = mongoose.connection.db.collection('content')

  const existingIds = await loadExistingFormulaIds(C)
  console.log(`Existing formula ids in DB: ${existingIds.size}`)

  let createdDocs = 0
  let addedFormulas = 0
  let skipped = 0

  for (const spec of toAdd) {
    let doc = await C.findOne({ conceptId: spec.conceptId })

    if (!doc) {
      // Build a fresh content doc, dropping any formula ids that already exist elsewhere.
      const groups = []
      for (const g of spec.groups) {
        const formulas = []
        for (const f of g.formulas) {
          if (existingIds.has(f.formulaId)) { skipped++; continue }
          existingIds.add(f.formulaId)
          formulas.push(f)
          addedFormulas++
        }
        if (formulas.length) groups.push({ groupId: g.groupId, groupTitle: g.groupTitle, formulas })
      }
      const _id = crypto.randomBytes(12).toString('hex')
      await C.insertOne({
        _id,
        conceptId: spec.conceptId,
        conceptTitle: spec.conceptTitle,
        reference: spec.reference || '',
        groups,
      })
      createdDocs++
      console.log(`Created content doc ${spec.conceptId} (${spec.conceptTitle}) with ${groups.reduce((s, g) => s + g.formulas.length, 0)} formulas`)
    } else {
      // Merge into existing doc.
      const groups = doc.groups || []
      for (const g of spec.groups) {
        let target = groups.find((x) => x.groupId === g.groupId)
        if (!target) {
          target = { groupId: g.groupId, groupTitle: g.groupTitle, formulas: [] }
          groups.push(target)
        }
        for (const f of g.formulas) {
          if (existingIds.has(f.formulaId)) { skipped++; continue }
          existingIds.add(f.formulaId)
          target.formulas.push(f)
          addedFormulas++
        }
      }
      await C.updateOne({ _id: doc._id }, { $set: { groups } })
      console.log(`Updated content doc ${spec.conceptId}: now ${groups.reduce((s, g) => s + g.formulas.length, 0)} formulas`)
    }
  }

  console.log(`\nSync done. New docs: ${createdDocs}, formulas added: ${addedFormulas}, skipped (already existed): ${skipped}`)
  await mongoose.disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
