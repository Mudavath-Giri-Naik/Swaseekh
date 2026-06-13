// Coverage check for volume2 authoring.
// Compares tasks-v2.json (expected qids per page) against auto-v2/page-NNNN.json
// (authored questions per page). A page is COVERED if its file parses and has
// at least as many questions as the page has qids. Writes remaining-v2.json.
const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, 'data')
const AUTO = path.join(DATA, 'auto-v2')
const tasks = JSON.parse(fs.readFileSync(path.join(DATA, 'tasks-v2.json'), 'utf8'))

const pad = (n) => String(n).padStart(4, '0')

let coveredPages = 0, coveredQ = 0, missingPages = 0, missingQ = 0, partial = 0, badJson = 0
const remaining = []
const byChapRemaining = {}

for (const t of tasks) {
  const file = path.join(AUTO, `page-${pad(t.page)}.json`)
  const need = t.qids.length
  let have = 0, ok = false
  if (fs.existsSync(file)) {
    try { const o = JSON.parse(fs.readFileSync(file, 'utf8')); have = (o.questions || []).length; ok = true }
    catch { badJson++ }
  }
  if (ok && have >= need) {
    coveredPages++; coveredQ += need
  } else {
    missingPages++; missingQ += need
    if (ok && have > 0) partial++
    remaining.push({ page: t.page, chapter: t.chapter, qids: t.qids, need, have })
    byChapRemaining[t.chapter] = (byChapRemaining[t.chapter] || 0) + 1
  }
}

remaining.sort((a, b) => a.page - b.page)
fs.writeFileSync(path.join(DATA, 'remaining-v2.json'), JSON.stringify(remaining))

const totalQ = tasks.reduce((s, t) => s + t.qids.length, 0)
console.log(`=== VOLUME2 COVERAGE ===`)
console.log(`Pages: ${coveredPages}/${tasks.length} covered, ${missingPages} remaining (${partial} partial, ${badJson} badJSON)`)
console.log(`Questions: ~${coveredQ}/${totalQ} covered, ~${missingQ} remaining`)
console.log(`Remaining page-tasks by chapter:`)
for (const c of Object.keys(byChapRemaining).map(Number).sort((a, b) => a - b)) {
  console.log(`  Ch${c}: ${byChapRemaining[c]} pages`)
}
console.log(`Wrote remaining-v2.json (${remaining.length} tasks)`)
