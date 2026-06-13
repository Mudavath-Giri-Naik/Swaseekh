// Build the full per-page task list for volume2 authoring from index-v2.json,
// INCLUDING the official answer (answer_official) and answer-refined type per qid.
// Outputs:
//   scripts/data/tasks-v2-full.json   (array of page-tasks)
//   scripts/data/tasks-v2/page-NNNN.json  (one small file per page, read by agents)
const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, 'data')
const PAGES = path.join(DATA, 'pages-v2')
const TASKS = path.join(DATA, 'tasks-v2')
fs.mkdirSync(TASKS, { recursive: true })
const idx = JSON.parse(fs.readFileSync(path.join(DATA, 'index-v2.json'), 'utf8'))

const pad = (n) => String(n).padStart(4, '0')
const byPage = {}
for (const it of idx) (byPage[it.page] = byPage[it.page] || []).push(it)

const tasks = Object.keys(byPage).map(Number).sort((a, b) => a - b).map((page) => {
  const items = byPage[page]
  const imgPath = path.join(PAGES, `page-${pad(page)}.png`)
  const imgPathNext = path.join(PAGES, `page-${pad(page + 1)}.png`)
  return {
    page,
    chapter: items[0].chapter,
    subject: items[0].subject,
    imgPath,
    imgPathNext: fs.existsSync(imgPathNext) ? imgPathNext : '',
    qids: items.map((it) => ({
      qid: it.qid, subject: it.subject, topic: it.topic, subtopic: it.subtopic,
      year: it.year, type: it.type, marks: it.marks, difficulty: it.difficulty,
      answer_official: it.answer_key || '', // official GATE answer (ground truth); '' if none/N-A
      prose: it.prose,
    })),
  }
})

fs.writeFileSync(path.join(DATA, 'tasks-v2-full.json'), JSON.stringify(tasks))
for (const t of tasks) fs.writeFileSync(path.join(TASKS, `page-${pad(t.page)}.json`), JSON.stringify(t, null, 1))

const totalQ = tasks.reduce((s, t) => s + t.qids.length, 0)
const withAns = tasks.reduce((s, t) => s + t.qids.filter(q => q.answer_official && q.answer_official !== 'N/A' && q.answer_official !== 'X').length, 0)
console.log(`Wrote ${tasks.length} page-tasks (${totalQ} questions, ${withAns} with a concrete official answer)`)
console.log(`Per-page task files -> ${TASKS}`)
