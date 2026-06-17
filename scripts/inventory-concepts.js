// Full inventory of the concept/topic/content/question linkage, per subject.
// Drives the formula-sheet build: shows which concepts lack a content doc and
// what question subtopics need mapping onto each concept.
//   node scripts/inventory-concepts.js            (console summary)
//   node scripts/inventory-concepts.js --json      (write data/concept-inventory.json)
const { connect, mongoose } = require('./db')
const fs = require('fs')
const path = require('path')

async function main() {
  await connect()
  const db = mongoose.connection.db
  const Subj = db.collection('subjects'), Top = db.collection('topics'), Con = db.collection('concepts')
  const Content = db.collection('content'), Q = db.collection('questions')

  const subjects = await Subj.find({}).toArray()
  const contentIds = new Set((await Content.find({}, { projection: { _id: 1, conceptId: 1 } }).toArray()).flatMap(c => [c._id, c.conceptId]).filter(Boolean))

  const inventory = []
  let totalConcepts = 0, withContent = 0
  for (const s of subjects.sort((a, b) => (a.order || 0) - (b.order || 0))) {
    const topics = await Top.find({ subjectId: s._id }).sort({ order: 1 }).toArray()
    const concepts = await Con.find({ subjectId: s._id }).sort({ order: 1 }).toArray()
    const qCount = await Q.countDocuments({ 'meta.subject': s.name })
    const subtopics = await Q.distinct('meta.subtopic', { 'meta.subject': s.name })
    const topicVals = await Q.distinct('meta.topic', { 'meta.subject': s.name })
    const topicById = Object.fromEntries(topics.map(t => [t._id, t.name]))
    const sEntry = {
      subject: s.name, subjectId: s._id, questionCount: qCount,
      topics: topics.map(t => ({ topicId: t._id, name: t.name })),
      concepts: concepts.map(c => ({ conceptId: c._id, title: c.title, topic: topicById[c.topicId] || c.topicId, hasContent: contentIds.has(c._id) })),
      questionSubtopics: subtopics.sort(),
      questionTopics: topicVals.sort(),
    }
    inventory.push(sEntry)
    totalConcepts += concepts.length
    withContent += sEntry.concepts.filter(c => c.hasContent).length
  }

  if (process.argv.includes('--json')) {
    fs.writeFileSync(path.join(__dirname, 'data', 'concept-inventory.json'), JSON.stringify(inventory, null, 1))
    console.log('Wrote data/concept-inventory.json')
  }

  console.log(`\n=== CONCEPT INVENTORY === ${totalConcepts} concepts, ${withContent} with content docs, ${totalConcepts - withContent} MISSING\n`)
  for (const s of inventory) {
    console.log(`■ ${s.subject}  (${s.questionCount} questions, ${s.concepts.length} concepts, ${s.concepts.filter(c => !c.hasContent).length} need sheets)`)
    console.log(`   concepts: ${s.concepts.map(c => c.title + (c.hasContent ? '✓' : '')).join(' | ')}`)
    console.log(`   question subtopics (${s.questionSubtopics.length}): ${s.questionSubtopics.slice(0, 40).join(', ')}${s.questionSubtopics.length > 40 ? ' …' : ''}`)
  }
  await mongoose.disconnect()
}
main().catch(e => { console.error('FATAL:', e); process.exit(1) })
