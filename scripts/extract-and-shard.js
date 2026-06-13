// 1. Salvage subtopic->formula maps for already-completed concepts from the
//    stopped Phase-2 workflow journal -> data/concept-links/<conceptId>.json
// 2. Compute pending concepts (content-v3 doc missing) and split into N shard
//    workflow scripts from the wf-v3-sheets.js template.
//   node scripts/extract-and-shard.js <journal.jsonl> [N=4]
const fs = require('fs')
const path = require('path')

const HERE = __dirname
const DATA = path.join(HERE, 'data')
const CONTENT = path.join(DATA, 'content-v3')
const LINKS = path.join(DATA, 'concept-links')
fs.mkdirSync(LINKS, { recursive: true })

const journal = process.argv[2]
const N = parseInt(process.argv[3] || '4', 10)

// ── 1. salvage completed link maps from journal ─────────────────────────────
let salvaged = 0
if (journal && fs.existsSync(journal)) {
  for (const line of fs.readFileSync(journal, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue
    let o; try { o = JSON.parse(line) } catch { continue }
    const r = o.result
    if (o.type === 'result' && r && r.conceptId && Array.isArray(r.subtopicFormulas)) {
      const f = path.join(LINKS, `${r.conceptId}.json`)
      if (!fs.existsSync(f)) {
        fs.writeFileSync(f, JSON.stringify({ conceptId: r.conceptId, subtopicFormulas: r.subtopicFormulas }, null, 1))
        salvaged++
      }
    }
  }
}
console.log(`Salvaged ${salvaged} completed link maps from journal -> concept-links/`)

// ── 2. compute pending (content doc missing) and shard ──────────────────────
const list = JSON.parse(fs.readFileSync(path.join(DATA, 'concept-author-list.json'), 'utf8'))
const haveContent = new Set(fs.existsSync(CONTENT) ? fs.readdirSync(CONTENT).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')) : [])
const pending = list.filter(c => !haveContent.has(c))
console.log(`Pending concepts (no content doc): ${pending.length}`)

const template = fs.readFileSync(path.join(HERE, 'wf-v3-sheets.js'), 'utf8')
const per = Math.ceil(pending.length / N)
let launched = []
for (let s = 0; s < N; s++) {
  const slice = pending.slice(s * per, s * per + per)
  if (!slice.length) break
  const out = template
    .replace(/const TODO = CONCEPTS.*/, `const TODO = ${JSON.stringify(slice)}`)
    .replace(/name: 'v3-formula-sheets'/, `name: 'v3-sheets-s${s + 1}'`)
    .replace(/description: 'Author a formula-sheet[^']*'/, `description: 'Phase2 shard ${s + 1}/${N}: author formula sheets for ${slice.length} concepts'`)
  const file = path.join(HERE, `wf-v3-sheet-s${s + 1}.js`)
  fs.writeFileSync(file, out)
  launched.push({ shard: s + 1, count: slice.length, file: path.basename(file), ids: slice })
  console.log(`  shard ${s + 1}: ${slice.length} concepts -> ${path.basename(file)}`)
}
fs.writeFileSync(path.join(DATA, 'sheet-shards.json'), JSON.stringify(launched, null, 1))
