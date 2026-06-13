// Direct authoring runner - runs as a Node.js process.
// For each task: reads page PNG as base64, calls Claude API directly, writes result.
// This bypasses the Workflow tool entirely.
// Usage: node scripts/run-authoring.js [startIdx] [endIdx]

const fs = require('fs')
const path = require('path')
const https = require('https')

const D = path.join(__dirname, 'data')

// Load all data
const { tasks, registry } = JSON.parse(fs.readFileSync(path.join(D, 'agent-tasks.json'), 'utf8'))
const regText = registry.join('\n')

// Load .env.local for API key
function loadEnv() {
  const raw = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
loadEnv()

const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API
if (!API_KEY) {
  // Try to extract from .env.local directly
  const raw = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  const m = raw.match(/ANTHROPIC_API_KEY\s*=\s*"?([^"\n]+)"?/)
  if (m) process.env.ANTHROPIC_API_KEY = m[1].trim()
}

const startIdx = parseInt(process.argv[2] || '0', 10)
const endIdx = parseInt(process.argv[3] || String(tasks.length), 10)

console.log(`Authoring tasks ${startIdx}..${endIdx-1} (${endIdx-startIdx} pages)`)
console.log(`API key: ${process.env.ANTHROPIC_API_KEY ? 'found ('+process.env.ANTHROPIC_API_KEY.slice(0,10)+'...)' : 'NOT FOUND'}`)

function makePrompt(task) {
  const qlines = task.qMetas.map(q =>
    `${q.qid}: subject="${q.subject}" topic="${q.topic}" subtopic="${q.subtopic}" year=${q.year} type=${q.type} marks=${q.marks} difficulty=${q.difficulty} answer="${q.answer}"\n  prose: "${q.prose}"`
  ).join('\n')

  return `Author ${task.qids.length} GATE questions from page ${task.page} of a GATE CS question bank PDF. Return a JSON object ONLY.

## MATH: Plain ASCII (app auto-converts): fractions a/b, powers x^2, subscripts a_n, sqrt(n), sum_{i=1}^{n}, C(n,r), P(n,r), <= >= != ->, pi theta alpha beta lambda sigma omega phi delta mu. SVG text: &gt; for > and &amp; for &

## FIELD RULES:
- meta.type: MCQ (A/B/C/D options), MSQ (multiple correct), NAT (numeric)
- meta.difficulty: easy/medium/hard
- meta.exam: "GATE YEAR" e.g. "GATE 2018"
- answer: MCQ→"B. text", MSQ→"A, C", NAT→number; "N/A"=state correct result; "X"=correct value+note exclusion
- given.terms: min 3 items (term/meaning/example/connects)
- keywords: min 2 items (term/explain/example)
- steps: min 2 items (step number/title/formula_id/formula_raw/apply/note)
- formula_id: use "" if no standard formula applies
- visual_svg: required for Graph Theory/geometry/figures; "" for text-only questions
- SVG style to use: <style>.bg{fill:var(--cell-bg,#F1EFE8);stroke:var(--cell-line,#B4B2A9);stroke-width:2;}.hi{fill:var(--hi-bg,#CECBF6);stroke:var(--hi-line,#7F77DD);stroke-width:3;}.ok{fill:var(--ok,#1D9E75);}.no{fill:var(--no,#D85A30);}.ink{fill:var(--color-text-primary,#2C2C2A);}.mut{fill:var(--mut,#5F5E5A);}.big{font-size:26px;font-weight:700;}.lbl{font-size:18px;font-weight:600;}.sub{font-size:14px;}.tag{font-size:14px;font-weight:600;}text{font-family:system-ui,-apple-system,Segoe UI,sans-serif;}</style>

## FORMULA REGISTRY (reuse these IDs when applicable):
${regText}

## TASK - Author these ${task.qids.length} questions from page ${task.page}:
${qlines}

## REQUIRED OUTPUT FORMAT (JSON object, no markdown):
{
  "page": ${task.page},
  "questions": [
    {
      "meta": {"exam":"GATE YEAR","year":YYYY,"marks":1or2,"difficulty":"easy/medium/hard","type":"MCQ/NAT/MSQ","subject":"...","topic":"...","subtopic":"..."},
      "question": "full question with options A. B. C. D. inline",
      "answer": "final answer",
      "to_find": "short phrase",
      "understand": {"plain":"2-4 sentences","keywords":[{"term":"","explain":"","example":""},...],"visual_svg":"<svg...> or empty","visual_alt":"one sentence"},
      "given": {"aim":"goal","terms":[{"term":"","meaning":"","example":"","connects":""},...],"plan":"strategy"},
      "solution": {"steps":[{"step":1,"title":"","formula_id":"","formula_raw":"","apply":"","note":""},...],"result":""},
      "formula_ids_used": [],
      "formula_note": "one sentence"
    }
  ],
  "formulas": []
}`
}

function callClaude(imgBase64, imgBase64Next, prompt) {
  return new Promise((resolve, reject) => {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) { reject(new Error('No API key')); return }

    const messages = [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imgBase64 } },
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imgBase64Next } },
        { type: 'text', text: prompt }
      ]
    }]

    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages
    })

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) { reject(new Error(parsed.error.message)); return }
          const text = parsed.content && parsed.content[0] && parsed.content[0].text
          resolve(text)
        } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function extractJSON(text) {
  // Find the first { and last } to extract the JSON object
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try { return JSON.parse(text.slice(start, end + 1)) } catch { return null }
}

async function processTask(task) {
  const outPath = path.join(D, 'auto', `page-${task.page}.json`)

  // Skip if already done with correct count
  if (fs.existsSync(outPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'))
      if (existing.questions && existing.questions.length === task.qids.length) {
        return { page: task.page, status: 'skip', count: existing.questions.length }
      }
    } catch {}
  }

  const imgPath = task.imgPath
  const imgPathNext = task.imgPathNext

  if (!fs.existsSync(imgPath)) {
    return { page: task.page, status: 'no-image', count: 0 }
  }

  const imgBase64 = fs.readFileSync(imgPath).toString('base64')
  const imgBase64Next = fs.existsSync(imgPathNext) ? fs.readFileSync(imgPathNext).toString('base64') : imgBase64

  const prompt = makePrompt(task)

  try {
    const text = await callClaude(imgBase64, imgBase64Next, prompt)
    const obj = extractJSON(text)
    if (!obj || !obj.questions) {
      fs.writeFileSync(outPath + '.raw', text || '')
      return { page: task.page, status: 'bad-json', count: 0 }
    }
    obj.page = task.page
    fs.writeFileSync(outPath, JSON.stringify(obj))
    return { page: task.page, status: 'ok', count: obj.questions.length, formulas: (obj.formulas||[]).length }
  } catch (e) {
    return { page: task.page, status: 'error', error: e.message }
  }
}

async function main() {
  const batch = tasks.slice(startIdx, endIdx)
  console.log(`Processing ${batch.length} tasks...`)

  // Process concurrently in groups of 5
  const CONCURRENCY = 5
  let done = 0

  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, Math.min(i + CONCURRENCY, batch.length))
    const results = await Promise.allSettled(chunk.map(t => processTask(t)))
    for (const r of results) {
      done++
      if (r.status === 'fulfilled') {
        const v = r.value
        console.log(`[${done}/${batch.length}] page-${v.page}: ${v.status} ${v.count || ''}${v.error ? ' ERR:'+v.error.slice(0,80) : ''}`)
      } else {
        console.log(`[${done}/${batch.length}] REJECTED: ${r.reason}`)
      }
    }
    // Small delay to avoid rate limits
    if (i + CONCURRENCY < batch.length) await new Promise(r => setTimeout(r, 2000))
  }

  console.log('\nDone. Summary:')
  const autoFiles = fs.readdirSync(path.join(D, 'auto')).filter(f => f.endsWith('.json')).length
  console.log(`auto/ files: ${autoFiles} / ${tasks.length}`)
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
