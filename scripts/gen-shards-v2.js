// Generate N shard workflow scripts from wf-v2-author.js by replacing the TODO slice.
// Each shard processes a disjoint contiguous slice of PAGES so 4 workflows can run
// in parallel (up to 10 agents each => ~40 concurrent).
const fs = require('fs')
const path = require('path')

const HERE = __dirname
const template = fs.readFileSync(path.join(HERE, 'wf-v2-author.js'), 'utf8')
const pages = JSON.parse(fs.readFileSync(path.join(HERE, 'data', 'remaining-pages-v2.json'), 'utf8'))
const N = parseInt(process.argv[2] || '4', 10)
const total = pages.length
const per = Math.ceil(total / N)

for (let s = 0; s < N; s++) {
  const lo = s * per
  const hi = Math.min(total, lo + per)
  if (lo >= total) break
  let out = template
    .replace(/const TODO = PAGES\.slice\([^)]*\)/, `const TODO = PAGES.slice(${lo}, ${hi})`)
    .replace(/name: 'gate-v2-author'/, `name: 'gate-v2-author-s${s + 1}'`)
    .replace(/description: 'Author remaining volume2[^']*'/, `description: 'Author volume2 shard ${s + 1}/${N} (pages idx ${lo}..${hi - 1}) into auto-v2/ JSON'`)
  const file = path.join(HERE, `wf-v2-shard${s + 1}.js`)
  fs.writeFileSync(file, out)
  console.log(`shard${s + 1}: pages[${lo}..${hi - 1}] = ${hi - lo} pages -> ${path.basename(file)}`)
}
