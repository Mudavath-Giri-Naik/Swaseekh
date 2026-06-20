// Add specific straggler chunks (by id) into their existing chapters with fresh IDs.
// Usage: node scripts/merge-extra.mjs 154 172 --insert
import { readFileSync, existsSync } from 'fs'
import mongoose from 'mongoose'

const RSA = 'e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa'
const OUT = `${RSA}/out`
const DO = process.argv.includes('--insert')
const ids = process.argv.slice(2).filter(a => /^\d+$/.test(a)).map(Number)

const env = readFileSync('e:/Swaseekh-main/Swaseekh-main/.env.local', 'utf-8')
const E = {}
for (const l of env.split('\n')) { const i = l.indexOf('='); if (i < 0) continue; const k = l.slice(0, i).trim(); let v = l.slice(i + 1).trim(); if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); if (k) E[k] = v }

const manifest = JSON.parse(readFileSync(`${RSA}/chunk-manifest.json`, 'utf-8'))
const byId = {}; for (const c of manifest) byId[c.chunkId] = c
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 120)
const pad = n => String(n).padStart(3, '0')

async function main() {
  await mongoose.connect(E['MONGODB_URI'], { dbName: 'swaseekh' })
  const db = mongoose.connection.db
  const maxNum = async (col, f, p) => { const ds = await db.collection(col).find({}).project({ [f]: 1 }).toArray(); let mx = 0; for (const d of ds) { const n = parseInt(String(d[f] || '').replace(p, '')); if (n > mx) mx = n } return mx }
  let qN = await maxNum('aptitude_questions', 'questionId', 'APT-Q-') + 1
  let modN = await maxNum('aptitude_models', 'modelId', 'APT-MOD-') + 1
  let forN = await maxNum('aptitude_formulas', 'formulaId', 'APT-FOR-') + 1

  for (const id of ids) {
    const meta = byId[id]; if (!meta) { console.log(`chunk ${id} not in manifest, skip`); continue }
    const p = `${OUT}/c${pad(id)}.json`; if (!existsSync(p)) { console.log(`c${pad(id)}.json missing, skip`); continue }
    let arr; try { let t = readFileSync(p, 'utf-8').trim(); if (t.startsWith('```')) t = t.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/, '').trim(); arr = JSON.parse(t) } catch { console.log(`c${pad(id)} parse fail`); continue }
    if (!Array.isArray(arr) || !arr.length) { console.log(`c${pad(id)} empty`); continue }
    const slug = meta.slug
    const existing = await db.collection('aptitude_questions').find({ conceptSlug: slug }).project({ questionText: 1 }).toArray()
    const seen = new Set(existing.map(e => norm(e.questionText)))
    const modelMap = {}, formulaMap = {}, modelQ = {}, formulaQ = {}
    const nq = []
    for (const q of arr) {
      if (!q || !q.questionText || !q.correctAnswer) continue
      const key = norm(q.questionText); if (seen.has(key)) continue; seen.add(key)
      const mn = (q.modelName || 'General').trim(); if (!modelMap[mn]) modelMap[mn] = `APT-MOD-${pad(modN++)}`
      for (const fr of (q.formulas || [])) { const ft = (fr.title || '').trim(); if (ft && !formulaMap[ft]) formulaMap[ft] = { id: `APT-FOR-${pad(forN++)}`, expression: fr.expression || '' } }
      const fids = [...new Set((q.formulas || []).map(fr => formulaMap[(fr.title || '').trim()]?.id).filter(Boolean))]
      const questionId = `APT-Q-${pad(qN++)}`
      nq.push({ questionId, conceptSlug: slug, modelId: modelMap[mn], formulaIds: fids, questionText: q.questionText, questionType: q.questionType || (q.options ? 'mcq' : 'integer'), options: q.options || null, correctAnswer: q.correctAnswer, difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium', solution: { steps: (q.solution?.steps || []).map((s, i) => ({ stepNumber: s.stepNumber || i + 1, explanation: s.explanation || '', formula: s.formula || null, formulaExpression: s.formulaExpression || '', calculation: s.calculation || '', result: s.result || '' })), shortcut: q.solution?.shortcut || '', commonMistake: q.solution?.commonMistake || '', timeToSolve: q.solution?.timeToSolve || '' }, source: 'rs_agarwal', sourcePage: `${meta.name} (Ch ${meta.chapter})`, sourceType: meta.type === 'solved' ? 'solved_example' : 'exercise', tags: Array.isArray(q.tags) ? q.tags.slice(0, 6) : [], createdAt: new Date() })
      ;(modelQ[modelMap[mn]] = modelQ[modelMap[mn]] || []).push(questionId)
      for (const fid of fids) (formulaQ[fid] = formulaQ[fid] || []).push(questionId)
    }
    const nm = Object.entries(modelMap).filter(([, mid]) => (modelQ[mid] || []).length).map(([mn, mid]) => ({ modelId: mid, conceptSlug: slug, name: mn, description: `${mn} — question pattern in ${meta.name}.`, questionIds: modelQ[mid], formulaIds: [], questionCount: modelQ[mid].length, difficulty: 'medium', createdAt: new Date() }))
    const nf = Object.entries(formulaMap).map(([ft, info]) => ({ formulaId: info.id, conceptSlug: slug, title: ft, expression: info.expression, plainText: '', explanation: '', derivation: '', questionCount: (formulaQ[info.id] || []).length, questionIds: formulaQ[info.id] || [], tags: [], source: 'rs_agarwal', createdAt: new Date() }))
    console.log(`c${pad(id)} (${slug}): adding ${nq.length} new (deduped from ${arr.length})`)
    if (DO && nq.length) {
      if (nf.length) await db.collection('aptitude_formulas').insertMany(nf)
      if (nm.length) await db.collection('aptitude_models').insertMany(nm)
      await db.collection('aptitude_questions').insertMany(nq)
      const concept = await db.collection('aptitude_concepts').findOne({ slug })
      await db.collection('aptitude_concepts').updateOne({ slug }, { $set: { totalQuestions: (concept.totalQuestions || 0) + nq.length, totalModels: (concept.totalModels || 0) + nm.length, totalFormulas: (concept.totalFormulas || 0) + nf.length, models: [...(concept.models || []), ...nm.map(m => m.modelId)], 'cheatsheet.formulas': [...((concept.cheatsheet && concept.cheatsheet.formulas) || []), ...nf.map(f => f.formulaId)], updatedAt: new Date() } })
    }
  }
  if (DO) await db.collection('aptitude_meta').updateOne({ _id: 'counters' }, { $set: { lastQuestionNumber: qN - 1, lastModelNumber: modN - 1, lastFormulaNumber: forN - 1, updatedAt: new Date() } }, { upsert: true })
  const total = await db.collection('aptitude_questions').countDocuments()
  console.log(`aptitude_questions grand total: ${total}`)
  await mongoose.connection.close()
}
main().catch(e => { console.error(e); process.exit(1) })
