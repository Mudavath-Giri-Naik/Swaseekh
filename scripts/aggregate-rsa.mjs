// Aggregate RS Aggarwal extraction output -> assign IDs, build concepts/models/formulas,
// dedupe, report per-concept counts, and (optionally) insert into MongoDB.
// Usage:
//   node scripts/aggregate-rsa.mjs            -> dry run: report only, writes scripts/data/rsa/build.json
//   node scripts/aggregate-rsa.mjs --insert   -> also insert into MongoDB
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import mongoose from 'mongoose'

const RSA = 'e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa'
const OUT = `${RSA}/out`
const DO_INSERT = process.argv.includes('--insert')

// ---- env ----
const env = readFileSync('e:/Swaseekh-main/Swaseekh-main/.env.local', 'utf-8')
const E = {}
for (const line of env.split('\n')) { const i = line.indexOf('='); if (i < 0) continue; const k = line.slice(0, i).trim(); let v = line.slice(i + 1).trim(); if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1); if (k) E[k] = v }

const chunks = JSON.parse(readFileSync(`${RSA}/chunk-manifest.json`, 'utf-8'))
const chunkById = {}
for (const c of chunks) chunkById[c.chunkId] = c

// ---- load all agent outputs ----
const files = readdirSync(OUT).filter(f => /^c\d+\.json$/.test(f))
let parsed = 0, broken = []
const raw = []  // {chunkId, q}
for (const f of files) {
  const id = parseInt(f.slice(1).replace('.json', ''))
  let txt = readFileSync(`${OUT}/${f}`, 'utf-8').trim()
  if (txt.startsWith('```')) txt = txt.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/, '').trim()
  let arr
  try { arr = JSON.parse(txt) } catch (e) { broken.push(f); continue }
  if (!Array.isArray(arr)) { broken.push(f); continue }
  parsed++
  for (const q of arr) raw.push({ chunkId: id, q })
}
console.log(`Output files: ${files.length} | parsed ok: ${parsed} | broken: ${broken.length}`)
if (broken.length) console.log('  broken files:', broken.join(', '))

// ---- normalise + dedupe ----
const normKey = s => (s || '').toLowerCase().replace(/\$[^$]*\$/g, m => m).replace(/[^a-z0-9]/g, '').slice(0, 120)
const seen = new Set()
const bySlug = {}   // slug -> { name, questions: [] }
let dropped = 0
for (const { chunkId, q } of raw) {
  const ck = chunkById[chunkId]; if (!ck) continue
  if (!q || !q.questionText || !q.correctAnswer) { dropped++; continue }
  const key = ck.slug + '|' + normKey(q.questionText)
  if (seen.has(key)) { dropped++; continue }
  seen.add(key)
  bySlug[ck.slug] = bySlug[ck.slug] || { name: ck.name, questions: [] }
  bySlug[ck.slug].questions.push({
    ...q,
    _conceptSlug: ck.slug,
    _conceptName: ck.name,
    _chapter: ck.chapter,
    _sourceType: ck.type === 'solved' ? 'solved_example' : 'exercise',
  })
}
console.log(`Raw questions: ${raw.length} | after dedupe/validate: ${seen.size} | dropped: ${dropped}`)

// ---- chapter order for stable concept numbering ----
const chapterOrder = [...new Set(chunks.map(c => c.chapter))].sort((a, b) => a - b)
const slugByChapter = {}
for (const c of chunks) slugByChapter[c.chapter] = c.slug

// ---- counters (continue from DB) ----
const startQ = 341, startCon = 2, startFor = 24, startMod = 15
let qN = startQ, conN = startCon, forN = startFor, modN = startMod
const pad = (n, w = 3) => String(n).padStart(w, '0')

const concepts = [], models = [], formulas = [], questions = []

for (const chapter of chapterOrder) {
  const slug = slugByChapter[chapter]
  const bucket = bySlug[slug]
  if (!bucket || !bucket.questions.length) continue
  const conceptId = `APT-CON-${pad(conN++)}`

  // models: distinct modelName
  const modelMap = {}    // modelName -> modelId
  const formulaMap = {}  // formulaTitle -> {id, expression}
  for (const q of bucket.questions) {
    const mn = (q.modelName || 'General').trim()
    if (!modelMap[mn]) modelMap[mn] = `APT-MOD-${pad(modN++)}`
    for (const fr of (q.formulas || [])) {
      const ft = (fr.title || '').trim()
      if (ft && !formulaMap[ft]) formulaMap[ft] = { id: `APT-FOR-${pad(forN++)}`, expression: fr.expression || '' }
    }
  }

  // build questions
  const modelQ = {}, formulaQ = {}
  for (const q of bucket.questions) {
    const questionId = `APT-Q-${pad(qN++)}`
    const mn = (q.modelName || 'General').trim()
    const modelId = modelMap[mn]
    const fids = [...new Set((q.formulas || []).map(fr => formulaMap[(fr.title || '').trim()]?.id).filter(Boolean))]
    questions.push({
      questionId, conceptSlug: slug, modelId, formulaIds: fids,
      questionText: q.questionText,
      questionType: q.questionType || (q.options ? 'mcq' : 'integer'),
      options: q.options || null,
      correctAnswer: q.correctAnswer,
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      solution: {
        steps: (q.solution?.steps || []).map((s, i) => ({
          stepNumber: s.stepNumber || i + 1,
          explanation: s.explanation || '',
          formula: s.formula || null,
          formulaExpression: s.formulaExpression || '',
          calculation: s.calculation || '',
          result: s.result || '',
        })),
        shortcut: q.solution?.shortcut || '',
        commonMistake: q.solution?.commonMistake || '',
        timeToSolve: q.solution?.timeToSolve || '',
      },
      source: 'rs_agarwal',
      sourcePage: `${bucket.name} (Ch ${chapter})`,
      sourceType: q._sourceType,
      tags: Array.isArray(q.tags) ? q.tags.slice(0, 6) : [],
      createdAt: new Date(),
    })
    ;(modelQ[modelId] = modelQ[modelId] || []).push(questionId)
    for (const fid of fids) (formulaQ[fid] = formulaQ[fid] || []).push(questionId)
  }

  // model docs
  const modelIds = []
  for (const [mn, mid] of Object.entries(modelMap)) {
    const qids = modelQ[mid] || []
    if (!qids.length) continue
    modelIds.push(mid)
    models.push({ modelId: mid, conceptSlug: slug, name: mn, description: `${mn} — question pattern in ${bucket.name}.`,
      questionIds: qids, formulaIds: [], questionCount: qids.length, difficulty: 'medium', createdAt: new Date() })
  }
  // formula docs
  const formulaIds = []
  for (const [ft, info] of Object.entries(formulaMap)) {
    const qids = formulaQ[info.id] || []
    formulaIds.push(info.id)
    formulas.push({ formulaId: info.id, conceptSlug: slug, title: ft, expression: info.expression,
      plainText: '', explanation: '', derivation: '', questionCount: qids.length, questionIds: qids,
      tags: [], source: 'rs_agarwal', createdAt: new Date() })
  }

  concepts.push({
    conceptId, name: bucket.name, slug,
    description: `${bucket.name} — Quantitative Aptitude (R.S. Aggarwal). Solved examples and exercise questions with step-by-step solutions.`,
    totalQuestions: bucket.questions.length, totalFormulas: formulaIds.length, totalModels: modelIds.length,
    models: modelIds, cheatsheet: { formulas: formulaIds, tips: [], tricks: [] },
    createdAt: new Date(), updatedAt: new Date(),
  })
}

// ---- report ----
console.log('\n===== QUESTIONS PER CONCEPT =====')
let total = 0
for (const c of concepts) { console.log(`  ${c.conceptId}  ${c.name.padEnd(34)} ${String(c.totalQuestions).padStart(4)} Q | ${String(c.totalModels).padStart(3)} models | ${String(c.totalFormulas).padStart(3)} formulas`); total += c.totalQuestions }
console.log(`\nTOTAL new concepts: ${concepts.length} | new questions: ${total} | new models: ${models.length} | new formulas: ${formulas.length}`)
console.log(`ID ranges -> Q: APT-Q-${pad(startQ)}..APT-Q-${pad(qN-1)} | CON: APT-CON-${pad(startCon)}..APT-CON-${pad(conN-1)}`)

writeFileSync(`${RSA}/build.json`, JSON.stringify({ concepts, models, formulas, questions }, null, 1))
console.log(`\nWrote build.json (${questions.length} questions).`)

// ---- insert ----
if (DO_INSERT) {
  console.log('\nConnecting to MongoDB to insert...')
  await mongoose.connect(E['MONGODB_URI'], { dbName: 'swaseekh' })
  const db = mongoose.connection.db
  // safety: only insert concepts whose slug does not already exist
  const existingSlugs = new Set(await db.collection('aptitude_concepts').distinct('slug'))
  const newConcepts = concepts.filter(c => !existingSlugs.has(c.slug))
  const newSlugs = new Set(newConcepts.map(c => c.slug))
  const newQuestions = questions.filter(q => newSlugs.has(q.conceptSlug))
  const newModels = models.filter(m => newSlugs.has(m.conceptSlug))
  const newFormulas = formulas.filter(f => newSlugs.has(f.conceptSlug))
  console.log(`Inserting: ${newConcepts.length} concepts, ${newQuestions.length} questions, ${newModels.length} models, ${newFormulas.length} formulas (skipped existing slugs: ${[...existingSlugs].join(', ')})`)
  const batch = async (col, arr) => { for (let i = 0; i < arr.length; i += 200) await db.collection(col).insertMany(arr.slice(i, i + 200)) }
  if (newFormulas.length) await batch('aptitude_formulas', newFormulas)
  if (newModels.length) await batch('aptitude_models', newModels)
  if (newQuestions.length) await batch('aptitude_questions', newQuestions)
  if (newConcepts.length) await batch('aptitude_concepts', newConcepts)
  await db.collection('aptitude_meta').updateOne({ _id: 'counters' }, { $set: {
    lastQuestionNumber: qN - 1, lastFormulaNumber: forN - 1, lastModelNumber: modN - 1, lastConceptNumber: conN - 1, updatedAt: new Date() } }, { upsert: true })
  console.log('Insert complete. Meta counters updated.')
  await mongoose.connection.close()
}
