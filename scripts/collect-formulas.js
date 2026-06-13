// Gather every new formula defined across scripts/data/auto/*.json and upsert them
// into one content doc (con_900). Dedup by formulaId against ALL existing content docs.
const fs = require('fs')
const path = require('path')
const { connect, mongoose } = require('./db')

const AUTO = path.join(__dirname, 'data', 'auto')

function loadAuto() {
  const formulas = []
  const refs = new Map() // referenced formulaId -> a representative {raw,title}
  if (!fs.existsSync(AUTO)) return { formulas, refs }
  for (const f of fs.readdirSync(AUTO)) {
    if (!f.endsWith('.json')) continue
    let obj
    try { obj = JSON.parse(fs.readFileSync(path.join(AUTO, f), 'utf8')) } catch { continue }
    for (const fm of obj.formulas || []) if (fm && fm.formulaId) formulas.push(fm)
    for (const q of obj.questions || []) {
      for (const st of (q.solution && q.solution.steps) || []) {
        if (st && st.formula_id && !refs.has(st.formula_id)) refs.set(st.formula_id, { raw: st.formula_raw || '', title: st.title || '' })
      }
      for (const fid of q.formula_ids_used || []) if (fid && !refs.has(fid)) refs.set(fid, { raw: '', title: '' })
    }
  }
  return { formulas, refs }
}
function humanize(id) { return String(id).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }

async function main() {
  await connect()
  const C = mongoose.connection.db.collection('content')
  const docs = await C.find({}).toArray()
  const existing = new Set()
  for (const d of docs) for (const g of d.groups || []) for (const f of g.formulas || []) if (f.formulaId) existing.add(f.formulaId)

  const { formulas: auto, refs } = loadAuto()
  const fresh = []
  const seen = new Set()
  for (const fm of auto) {
    if (existing.has(fm.formulaId) || seen.has(fm.formulaId)) continue
    seen.add(fm.formulaId)
    fresh.push({
      formulaId: fm.formulaId,
      name: fm.name || humanize(fm.formulaId),
      latex: fm.latex || fm.plain || fm.name || '',
      plain: fm.plain || '',
      whenToUse: fm.whenToUse || '',
      terms: Array.isArray(fm.terms) ? fm.terms : [],
      trap: fm.trap || '',
      reference: fm.reference || '',
    })
  }
  // Stub any formula_id referenced by a question but never defined, using the
  // step's formula_raw as its content so the question validates and still previews.
  let stubs = 0
  for (const [id, info] of refs) {
    if (existing.has(id) || seen.has(id)) continue
    seen.add(id)
    fresh.push({
      formulaId: id, name: info.title || humanize(id), latex: info.raw || humanize(id),
      plain: info.raw || '', whenToUse: '', terms: [], trap: '', reference: 'GATE bank import',
    })
    stubs++
  }
  console.log(`auto formulas seen: ${auto.length}; defined+stub new unique to add: ${fresh.length} (stubs: ${stubs})`)
  if (!fresh.length) { await mongoose.disconnect(); return }

  let doc = await C.findOne({ conceptId: 'con_900' })
  if (!doc) {
    const crypto = require('crypto')
    await C.insertOne({ _id: crypto.randomBytes(12).toString('hex'), conceptId: 'con_900', conceptTitle: 'Additional Formulas', reference: 'Auto-generated from GATE bank import', groups: [{ groupId: 'auto', groupTitle: 'Imported formulas', formulas: fresh }] })
    console.log(`Created con_900 with ${fresh.length} formulas`)
  } else {
    const g = (doc.groups || []).find((x) => x.groupId === 'auto') || (doc.groups = doc.groups || []).push({ groupId: 'auto', groupTitle: 'Imported formulas', formulas: [] }) && doc.groups[doc.groups.length - 1]
    const grp = doc.groups.find((x) => x.groupId === 'auto')
    grp.formulas.push(...fresh)
    await C.updateOne({ _id: doc._id }, { $set: { groups: doc.groups } })
    console.log(`Updated con_900: added ${fresh.length} formulas`)
  }
  await mongoose.disconnect()
}
main().catch((e) => { console.error(e); process.exit(1) })
