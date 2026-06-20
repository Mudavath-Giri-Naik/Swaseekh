// Generates the Workflow script for RS Aggarwal extraction.
// Embeds ONLY chunks that do not yet have a valid output file (re-runnable until complete).
// Selection is baked into the script (NOT via args, which don't reach background workflows).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'

const RSA = 'e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa'
const OUTDIR = `${RSA}/out`
mkdirSync(OUTDIR, { recursive: true })
const MANIFEST = process.env.MANIFEST || `${RSA}/chunk-manifest.json`
const chunks = JSON.parse(readFileSync(MANIFEST, 'utf-8'))

// Build set of completed chunk ids (file exists AND parses to a JSON array)
const done = new Set()
for (const f of readdirSync(OUTDIR)) {
  const m = f.match(/^c(\d+)\.json$/); if (!m) continue
  try { let t = readFileSync(`${OUTDIR}/${f}`, 'utf-8').trim(); if (t.startsWith('```')) t = t.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/, '').trim(); if (Array.isArray(JSON.parse(t))) done.add(parseInt(m[1])) } catch {}
}

// Sharding: split remaining chunks into SHARD_TOTAL disjoint groups; emit group SHARD_IDX.
const SHARD_TOTAL = process.env.SHARD_TOTAL ? parseInt(process.env.SHARD_TOTAL) : 1
const SHARD_IDX = process.env.SHARD_IDX ? parseInt(process.env.SHARD_IDX) : 0
const remaining = chunks.filter(c => !done.has(c.chunkId))
const slim = remaining
  .filter((c, i) => i % SHARD_TOTAL === SHARD_IDX)   // round-robin disjoint split
  .map(c => ({ id: c.chunkId, ch: c.chapter, slug: c.slug, name: c.name, type: c.type, file: c.file.replace(/\\/g, '/') }))
const OUTFILE = `e:/Swaseekh-main/Swaseekh-main/scripts/wf-rsa-shard${SHARD_IDX}.js`

const SCRIPT = `export const meta = {
  name: 'rsa-extract',
  description: 'Extract RS Aggarwal Quantitative Aptitude questions into structured JSON (missing chunks only)',
  phases: [{ title: 'Extract', detail: 'one agent per remaining chunk -> writes JSON file' }],
}

// Only the chunks still missing an output file are embedded here.
const SEL = ${JSON.stringify(slim)}

const OUT = '${OUTDIR}'
function pad(n){ return String(n).padStart(3,'0') }

function promptFor(c){
  const outFile = OUT + '/c' + pad(c.id) + '.json'
  return [
    'You extract Quantitative Aptitude questions from R.S. Aggarwal for a study app. Be exhaustive and accurate.',
    '',
    'STEP 0: If a valid JSON file already exists at ' + outFile + ', reply "c' + pad(c.id) + ': skip" and STOP (do nothing else).',
    '',
    'STEP 1: Read the chunk file fully: ' + c.file,
    '(If Read truncates, call Read again with offset until you have the whole file.)',
    '',
    'CONTEXT: Chapter ' + c.ch + ' = "' + c.name + '". Section type = ' + c.type + '.',
    c.type === 'solved'
      ? 'SOLVED EXAMPLES: each "Ex. N." has an inline "Sol." with the full worked solution and final answer.'
      : 'EXERCISE MCQs: file has QUESTIONS (numbered, options a-d), ANSWER KEY (correct letter per number), and DETAILED SOLUTIONS (per number). Link them by number.',
    '',
    'STEP 2: For EVERY genuine question output one JSON object. SKIP non-questions (headers, theory, "Directions:" preambles though DO extract the sub-questions under them, stray list items).',
    'Each object MUST have exactly:',
    '{',
    '  "sourceQNum": <number|null>,',
    '  "questionText": "<LaTeX math in $...$; fix garbled fractions/symbols>",',
    '  "questionType": "mcq"|"integer"|"fill",',
    '  "options": ["A) ...","B) ...","C) ...","D) ..."]|null,',
    '  "correctAnswer": "<exact option string e.g. \\"B) 740\\", or plain answer>",',
    '  "difficulty": "easy"|"medium"|"hard",',
    '  "solution": { "steps":[{"stepNumber":1,"explanation":"...","formula":null,"formulaExpression":"<LaTeX|>","calculation":"...","result":"..."}], "shortcut":"", "commonMistake":"", "timeToSolve":"" },',
    '  "modelName": "<short question-TYPE label, reused across similar Qs>",',
    '  "formulas": [{"title":"<short name>","expression":"<LaTeX>"}],',
    '  "tags": ["<2-4 keywords>"]',
    '}',
    '',
    'RULES: correctAnswer from ANSWER KEY (trust solution if it conflicts). 2-5 real solution steps. Render ALL math as LaTeX, reconstructing split fractions. If a question needs a missing figure but the data is in text, still extract; else skip. Never invent.',
    '',
    'STEP 3: Write a JSON ARRAY to: ' + outFile,
    'Write ONLY raw JSON (no code fences). If zero questions, write [].',
    'STEP 4: Reply "c' + pad(c.id) + ': <N> questions".',
  ].join('\\n')
}

if (SEL.length === 0) { log('Nothing to do — all chunks complete.'); return { attempted: 0, returned: 0 } }
log('Processing ' + SEL.length + ' remaining chunks (16 concurrent).')
const res = await parallel(SEL.map(c => () =>
  agent(promptFor(c), { label: 'c'+pad(c.id)+'-ch'+c.ch+'-'+c.type, phase: 'Extract', model: 'sonnet', agentType: 'general-purpose' })
))
log('Done: ' + res.filter(Boolean).length + '/' + SEL.length)
return { attempted: SEL.length, returned: res.filter(Boolean).length, summaries: res.filter(Boolean) }
`

writeFileSync(OUTFILE, SCRIPT)
console.log(`Done: ${done.size}/276 | remaining: ${remaining.length} | shard ${SHARD_IDX}/${SHARD_TOTAL} embeds ${slim.length} -> ${OUTFILE}`)
