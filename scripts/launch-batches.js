// Launches the authoring workflow in batches, passing data inline.
// Each batch gets its slice of tasks as direct args - no agent file loading.
// Run: node scripts/launch-batches.js
// Then monitor: node scripts/import-results.js  (polls for completion)

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const D = path.join(__dirname, 'data')
const raw = JSON.parse(fs.readFileSync(path.join(D, 'agent-tasks.json'), 'utf8'))
const { tasks, registry } = raw

const BATCH_SIZE = 35
console.log(`Total tasks: ${tasks.length}, registry: ${registry.length} formulas`)
console.log(`Will create ${Math.ceil(tasks.length / BATCH_SIZE)} batch args files`)

// Write per-batch args files (small enough to pass to workflow)
const batchFiles = []
for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
  const batch = tasks.slice(i, Math.min(i + BATCH_SIZE, tasks.length))
  const argObj = { tasks: batch, registry }
  const fname = path.join(D, `batch-args-${i}.json`)
  fs.writeFileSync(fname, JSON.stringify(argObj))
  batchFiles.push({ fname, start: i, end: i + batch.length - 1, count: batch.length })
  console.log(`  batch ${i}: ${batch.length} tasks, ${Math.round(fs.statSync(fname).size/1024)}KB`)
}

fs.writeFileSync(path.join(D, 'batch-files.json'), JSON.stringify(batchFiles))
console.log(`\nBatch args files written. Run workflow for each batch.`)
