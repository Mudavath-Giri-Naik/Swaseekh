// Bridge Phase 1 (subtopic->concept map) into Phase 2 (per-concept authoring).
// 1. Parse the mapping workflow output -> data/subtopic-concept-map.json
// 2. For every concept that LACKS a content doc, write a task file
//    data/concept-tasks/<conceptId>.json with: subject, topic, title,
//    the subtopics routed to it, question count, and sample question stems.
//   node scripts/build-concept-tasks.js <workflow-output-file>
const { connect, mongoose } = require('./db')
const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, 'data')
const TASKS = path.join(DATA, 'concept-tasks')
fs.mkdirSync(TASKS, { recursive: true })

function parseMapping(file) {
  const raw = fs.readFileSync(file, 'utf8')
  let obj
  try { obj = JSON.parse(raw) } catch {
    // fall back: find the {"subjects" json
    const i = raw.indexOf('{"subjects"'); obj = JSON.parse(raw.slice(i))
  }
  const subjects = obj.result?.subjects || obj.subjects || []
  // map[subject][subtopic] = { conceptId, conceptTitle }
  const map = {}
  for (const s of subjects) {
    map[s.subject] = {}
    for (const m of s.mapping || []) map[s.subject][m.subtopic] = { conceptId: m.conceptId, conceptTitle: m.conceptTitle }
  }
  return map
}

async function main() {
  const wfFile = process.argv[2]
  if (!wfFile || !fs.existsSync(wfFile)) { console.error('Usage: node build-concept-tasks.js <workflow-output-file>'); process.exit(1) }
  const map = parseMapping(wfFile)
  fs.writeFileSync(path.join(DATA, 'subtopic-concept-map.json'), JSON.stringify(map, null, 1))
  const totalMappings = Object.values(map).reduce((n, m) => n + Object.keys(m).length, 0)
  console.log(`Saved subtopic-concept-map.json: ${Object.keys(map).length} subjects, ${totalMappings} subtopic mappings`)

  const inventory = JSON.parse(fs.readFileSync(path.join(DATA, 'concept-inventory.json'), 'utf8'))
  await connect()
  const Q = mongoose.connection.db.collection('questions')

  let written = 0, skipped = 0
  const authorList = []
  for (const subj of inventory) {
    const subMap = map[subj.subject] || {}
    // group this subject's subtopics by concept
    const byConcept = {}
    for (const [subtopic, info] of Object.entries(subMap)) {
      (byConcept[info.conceptId] = byConcept[info.conceptId] || []).push(subtopic)
    }
    for (const concept of subj.concepts) {
      if (concept.hasContent) { skipped++; continue } // keep the 4 existing sheets untouched
      const subtopics = byConcept[concept.conceptId] || []
      // sample question stems for these subtopics
      const samples = []
      const counts = {}
      for (const st of subtopics) {
        const c = await Q.countDocuments({ 'meta.subject': subj.subject, 'meta.subtopic': st })
        counts[st] = c
        const qs = await Q.find({ 'meta.subject': subj.subject, 'meta.subtopic': st }, { projection: { question: 1 } }).limit(3).toArray()
        qs.forEach(d => samples.push({ subtopic: st, stem: String(d.question).replace(/\s+/g, ' ').slice(0, 220) }))
      }
      const totalQ = Object.values(counts).reduce((a, b) => a + b, 0)
      const task = {
        conceptId: concept.conceptId, conceptTitle: concept.title, subject: subj.subject, topic: concept.topic,
        subtopics, subtopicCounts: counts, questionCount: totalQ, sampleQuestions: samples.slice(0, 12),
      }
      fs.writeFileSync(path.join(TASKS, `${concept.conceptId}.json`), JSON.stringify(task, null, 1))
      authorList.push(concept.conceptId)
      written++
    }
  }
  fs.writeFileSync(path.join(DATA, 'concept-author-list.json'), JSON.stringify(authorList))
  console.log(`Wrote ${written} concept task files (skipped ${skipped} with existing content). Author list: ${authorList.length} concepts.`)
  await mongoose.disconnect()
}
main().catch(e => { console.error('FATAL:', e); process.exit(1) })
