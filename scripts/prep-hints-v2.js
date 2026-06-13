// Generate per-page hint files for the authoring swarm.
// For every REMAINING page (from remaining-v2.json) write
// scripts/data/hints-v2/page-NNNN.json = { page, chapter, subject, qids:[...] }
// where each qid carries subtopic / year / type / marks / official answer_key / source.
// Also prints the list of remaining page numbers (for the workflow args).
const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, 'data')
const HINTS = path.join(DATA, 'hints-v2')
fs.mkdirSync(HINTS, { recursive: true })

const index = JSON.parse(fs.readFileSync(path.join(DATA, 'index-v2.json'), 'utf8'))
const remaining = JSON.parse(fs.readFileSync(path.join(DATA, 'remaining-v2.json'), 'utf8'))
const byQid = {}
for (const it of index) byQid[it.qid] = it

const pad = (n) => String(n).padStart(4, '0')
const pages = []
for (const t of remaining) {
  const subject = (byQid[t.qids[0]] || {}).subject || ''
  const qids = t.qids.map((q) => {
    const it = byQid[q] || {}
    return {
      qid: q, subtopic: it.subtopic, year: it.year, type: it.type, marks: it.marks,
      answer_key: it.answer_key, source: it.source,
    }
  })
  fs.writeFileSync(path.join(HINTS, `page-${pad(t.page)}.json`),
    JSON.stringify({ page: t.page, chapter: t.chapter, subject, count: qids.length, qids }, null, 1))
  pages.push(t.page)
}
fs.writeFileSync(path.join(DATA, 'remaining-pages-v2.json'), JSON.stringify(pages))
console.log(`Wrote ${pages.length} hint files to hints-v2/`)
console.log(`Remaining pages: ${pages.length} (first ${pages.slice(0, 8).join(',')} ... last ${pages.slice(-4).join(',')})`)
