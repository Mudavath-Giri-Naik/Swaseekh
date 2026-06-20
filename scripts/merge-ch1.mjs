// Merge Chapter-1 (Number System) extracted questions INTO the existing number-system concept.
// Preserves the existing 92 questions; adds only deduped new ones with fresh IDs.
// Run: node scripts/merge-ch1.mjs            (dry run - report only)
//      node scripts/merge-ch1.mjs --insert   (apply)
import { readFileSync, readdirSync } from 'fs'
import mongoose from 'mongoose'

const RSA = 'e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa'
const OUT = `${RSA}/out`
const DO = process.argv.includes('--insert')

const env = readFileSync('e:/Swaseekh-main/Swaseekh-main/.env.local', 'utf-8')
const E = {}
for (const l of env.split('\n')) { const i = l.indexOf('='); if (i < 0) continue; const k = l.slice(0, i).trim(); let v = l.slice(i + 1).trim(); if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); if (k) E[k] = v }

const ch1 = JSON.parse(readFileSync(`${RSA}/ch1-chunk-manifest.json`, 'utf-8'))
const ch1Ids = new Set(ch1.map(c => c.chunkId))
const typeById = {}; for (const c of ch1) typeById[c.chunkId] = c.type

// load ch1 extraction outputs
const raw = []
for (const f of readdirSync(OUT)) {
  const m = f.match(/^c(\d+)\.json$/); if (!m) continue
  const id = parseInt(m[1]); if (!ch1Ids.has(id)) continue
  try { let t = readFileSync(`${OUT}/${f}`, 'utf-8').trim(); if (t.startsWith('```')) t = t.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/, '').trim(); const a = JSON.parse(t); if (Array.isArray(a)) for (const q of a) raw.push({ id, q }) } catch {}
}
console.log(`Ch1 outputs loaded: ${raw.length} raw questions from ${[...ch1Ids].filter(id=>readdirSync(OUT).includes('c'+String(id).padStart(3,'0')+'.json')).length} chunks`)

const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 120)

async function main() {
  await mongoose.connect(E['MONGODB_URI'], { dbName: 'swaseekh' })
  const db = mongoose.connection.db

  // existing number-system questions -> dedup keys
  const existing = await db.collection('aptitude_questions').find({ conceptSlug: 'number-system' }).project({ questionText: 1 }).toArray()
  const seen = new Set(existing.map(e => norm(e.questionText)))
  console.log(`Existing number-system questions: ${existing.length}`)

  // global max ids
  const maxNum = async (col, field, pref) => { const ds = await db.collection(col).find({}).project({ [field]: 1 }).toArray(); let mx = 0; for (const d of ds) { const n = parseInt(String(d[field] || '').replace(pref, '')); if (n > mx) mx = n } return mx }
  let qN = await maxNum('aptitude_questions', 'questionId', 'APT-Q-') + 1
  let modN = await maxNum('aptitude_models', 'modelId', 'APT-MOD-') + 1
  let forN = await maxNum('aptitude_formulas', 'formulaId', 'APT-FOR-') + 1
  const pad = (n) => String(n).padStart(3, '0')

  // dedup + build
  const modelMap = {}, formulaMap = {}, modelQ = {}, formulaQ = {}
  const newQuestions = []
  let dup = 0, bad = 0
  for (const { id, q } of raw) {
    if (!q || !q.questionText || !q.correctAnswer) { bad++; continue }
    const key = norm(q.questionText)
    if (seen.has(key)) { dup++; continue }
    seen.add(key)
    const mn = (q.modelName || 'General').trim()
    if (!modelMap[mn]) modelMap[mn] = `APT-MOD-${pad(modN++)}`
    for (const fr of (q.formulas || [])) { const ft = (fr.title || '').trim(); if (ft && !formulaMap[ft]) formulaMap[ft] = { id: `APT-FOR-${pad(forN++)}`, expression: fr.expression || '' } }
    const fids = [...new Set((q.formulas || []).map(fr => formulaMap[(fr.title || '').trim()]?.id).filter(Boolean))]
    const questionId = `APT-Q-${pad(qN++)}`
    newQuestions.push({
      questionId, conceptSlug: 'number-system', modelId: modelMap[mn], formulaIds: fids,
      questionText: q.questionText, questionType: q.questionType || (q.options ? 'mcq' : 'integer'),
      options: q.options || null, correctAnswer: q.correctAnswer,
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      solution: { steps: (q.solution?.steps || []).map((s, i) => ({ stepNumber: s.stepNumber || i + 1, explanation: s.explanation || '', formula: s.formula || null, formulaExpression: s.formulaExpression || '', calculation: s.calculation || '', result: s.result || '' })), shortcut: q.solution?.shortcut || '', commonMistake: q.solution?.commonMistake || '', timeToSolve: q.solution?.timeToSolve || '' },
      source: 'rs_agarwal', sourcePage: 'Number System (Ch 1)', sourceType: typeById[id] === 'solved' ? 'solved_example' : 'exercise',
      tags: Array.isArray(q.tags) ? q.tags.slice(0, 6) : [], createdAt: new Date(),
    })
    ;(modelQ[modelMap[mn]] = modelQ[modelMap[mn]] || []).push(questionId)
    for (const fid of fids) (formulaQ[fid] = formulaQ[fid] || []).push(questionId)
  }

  const newModels = Object.entries(modelMap).filter(([, mid]) => (modelQ[mid] || []).length).map(([mn, mid]) => ({ modelId: mid, conceptSlug: 'number-system', name: mn, description: `${mn} — question pattern in Number System.`, questionIds: modelQ[mid], formulaIds: [], questionCount: modelQ[mid].length, difficulty: 'medium', createdAt: new Date() }))
  const newFormulas = Object.entries(formulaMap).map(([ft, info]) => ({ formulaId: info.id, conceptSlug: 'number-system', title: ft, expression: info.expression, plainText: '', explanation: '', derivation: '', questionCount: (formulaQ[info.id] || []).length, questionIds: formulaQ[info.id] || [], tags: [], source: 'rs_agarwal', createdAt: new Date() }))

  console.log(`\nNew (deduped) to ADD: ${newQuestions.length} questions | ${newModels.length} models | ${newFormulas.length} formulas`)
  console.log(`Duplicates skipped: ${dup} | invalid: ${bad}`)
  console.log(`Number System total after merge: ${existing.length} + ${newQuestions.length} = ${existing.length + newQuestions.length}`)

  if (DO && newQuestions.length) {
    const batch = async (col, arr) => { for (let i = 0; i < arr.length; i += 200) await db.collection(col).insertMany(arr.slice(i, i + 200)) }
    await batch('aptitude_formulas', newFormulas)
    await batch('aptitude_models', newModels)
    await batch('aptitude_questions', newQuestions)
    // update concept aggregate
    const concept = await db.collection('aptitude_concepts').findOne({ slug: 'number-system' })
    const addModelIds = newModels.map(m => m.modelId), addFormulaIds = newFormulas.map(f => f.formulaId)
    await db.collection('aptitude_concepts').updateOne({ slug: 'number-system' }, {
      $set: {
        totalQuestions: (concept.totalQuestions || 0) + newQuestions.length,
        totalModels: (concept.totalModels || 0) + addModelIds.length,
        totalFormulas: (concept.totalFormulas || 0) + addFormulaIds.length,
        models: [...(concept.models || []), ...addModelIds],
        'cheatsheet.formulas': [...((concept.cheatsheet && concept.cheatsheet.formulas) || []), ...addFormulaIds],
        updatedAt: new Date(),
      },
    })
    await db.collection('aptitude_meta').updateOne({ _id: 'counters' }, { $set: { lastQuestionNumber: qN - 1, lastModelNumber: modN - 1, lastFormulaNumber: forN - 1, updatedAt: new Date() } }, { upsert: true })
    const total = await db.collection('aptitude_questions').countDocuments()
    const nsTotal = await db.collection('aptitude_questions').countDocuments({ conceptSlug: 'number-system' })
    console.log(`\nInserted. Number System now: ${nsTotal} | aptitude_questions grand total: ${total}`)
  }
  await mongoose.connection.close()
}
main().catch(e => { console.error(e); process.exit(1) })
