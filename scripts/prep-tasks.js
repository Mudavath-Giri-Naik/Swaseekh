// Pre-process everything into scripts/data/agent-tasks.json
// One entry per task containing everything the author agent needs inline.
// Run: node scripts/prep-tasks.js
const fs = require('fs')
const path = require('path')

const D = path.join(__dirname, 'data')

const tasks = JSON.parse(fs.readFileSync(path.join(D, 'tasks.json'), 'utf8'))
const index = JSON.parse(fs.readFileSync(path.join(D, 'index.json'), 'utf8'))
const registry = JSON.parse(fs.readFileSync(path.join(D, 'formula-registry.json'), 'utf8'))

const indexMap = {}
for (const q of index) indexMap[q.qid] = q

// Load all answers
const answers = {}
for (let c = 2; c <= 11; c++) {
  try {
    const a = JSON.parse(fs.readFileSync(path.join(D, 'answers', `ch${c}.json`), 'utf8'))
    Object.assign(answers, a)
  } catch {}
}

// Registry compact form (id + name + plain)
const regCompact = registry.map(f => `${f.id}|${f.name}|${f.plain||''}`)

// Already-done pages (have valid json files in auto/)
const autoDir = path.join(D, 'auto')
const donePagesSet = new Set()
if (fs.existsSync(autoDir)) {
  for (const f of fs.readdirSync(autoDir)) {
    if (!f.endsWith('.json')) continue
    const pg = parseInt(f.replace('page-', '').replace('.json', ''))
    try {
      const obj = JSON.parse(fs.readFileSync(path.join(autoDir, f), 'utf8'))
      // Check it has the right number of questions
      const task = tasks.find(t => t.page === pg)
      if (task && obj.questions && obj.questions.length === task.qids.length) {
        donePagesSet.add(pg)
      }
    } catch {}
  }
}

// Build per-task payloads
const agentTasks = []
for (const task of tasks) {
  if (donePagesSet.has(task.page)) continue // skip already-done
  const qMetas = task.qids.map(qid => {
    const m = indexMap[qid] || {}
    return {
      qid,
      subject: m.subject || '',
      topic: m.topic || '',
      subtopic: m.subtopic || '',
      year: m.year || null,
      type: m.type || 'MCQ',
      marks: m.marks || 2,
      difficulty: m.difficulty || 'medium',
      prose: m.prose || '',
      answer: answers[qid] || 'N/A'
    }
  })
  agentTasks.push({
    page: task.page,
    chapter: task.chapter,
    qids: task.qids,
    qMetas,
    imgPath: path.join(D, 'pages', `page-${String(task.page).padStart(4,'0')}.png`).replace(/\\/g, '/'),
    imgPathNext: path.join(D, 'pages', `page-${String(task.page+1).padStart(4,'0')}.png`).replace(/\\/g, '/'),
  })
}

const outPath = path.join(D, 'agent-tasks.json')
fs.writeFileSync(outPath, JSON.stringify({ tasks: agentTasks, registry: regCompact }))
console.log(`Written ${outPath}`)
console.log(`Total tasks: ${agentTasks.length} (${donePagesSet.size} already done, skipped)`)
console.log(`Formula registry: ${registry.length} entries`)
