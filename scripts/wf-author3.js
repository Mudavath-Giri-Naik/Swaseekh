export const meta = {
  name: 'gate-bank-author3',
  description: 'Author all remaining GATE question docs - return all JSON for main loop to write',
  phases: [
    { title: 'Author', detail: 'agents return structured JSON; collected by orchestrator' },
  ],
}

const ROOT = 'e:/Swaseekh-main/Swaseekh-main'
const D = `${ROOT}/scripts/data`

const GUIDE = `
You are authoring premium GATE question documents for a live MongoDB study app.
Return ONLY structured JSON via StructuredOutput. No prose, no markdown.

## MATH CONVENTION
Plain ASCII math only (the app auto-converts to LaTeX):
  fractions: a/b or (a+b)/(c+d)
  powers: x^2, 2^(n-1), n^{k+1}
  subscripts: a_n, x_{n+1}
  sqrt(n), sum_{i=1}^{n}, prod_{i=1}^{n}, int, C(n,r), P(n,r)
  comparisons: <= >= != ->
  Greek letters spelled out: pi, theta, alpha, beta, lambda, sigma, omega, phi, delta, epsilon, mu, gamma
  Inside SVG text nodes: use &gt; for > and &amp; for &

## FIELD RULES
- meta.type: MCQ (options A/B/C/D shown), MSQ (select all that apply, multiple correct), NAT (numeric/blank)
- meta.difficulty: easy / medium / hard
- meta.exam: "GATE YEAR" e.g. "GATE 2018"
- answer: for MCQ use "A. text" or "D. text"; for MSQ use "A, C" or "B and D"; for NAT use the number
- answer key "N/A" = proof question: answer = correct result stated concisely
- answer key "X" = excluded question: answer = correct computed value; note exclusion in formula_note
- answer key "65 : 65" or range = NAT: use the center value
- formula_id: reuse a known ID from the registry; use "" if no standard formula applies
- visual_svg: REQUIRED for graph theory, geometry, circuits, figures, trees, Venn diagrams; "" for pure-text
- Every field non-empty except visual_svg (may be "")

## SVG STYLE (copy this exact style block)
<style>.bg{fill:var(--cell-bg,#F1EFE8);stroke:var(--cell-line,#B4B2A9);stroke-width:2;}.hi{fill:var(--hi-bg,#CECBF6);stroke:var(--hi-line,#7F77DD);stroke-width:3;}.ok{fill:var(--ok,#1D9E75);}.no{fill:var(--no,#D85A30);}.ink{fill:var(--color-text-primary,#2C2C2A);}.mut{fill:var(--mut,#5F5E5A);}.big{font-size:26px;font-weight:700;}.lbl{font-size:18px;font-weight:600;}.sub{font-size:14px;}.tag{font-size:14px;font-weight:600;}text{font-family:system-ui,-apple-system,Segoe UI,sans-serif;}</style>
Graph nodes: <circle cx="X" cy="Y" r="15" class="bg"/>
Graph edges: <line x1="X1" y1="Y1" x2="X2" y2="Y2" stroke="#B4B2A9" stroke-width="2.5"/>

## FORMULA REGISTRY (known IDs you may reuse)
`

const PAGE_SCHEMA = {
  type: 'object',
  properties: {
    page: { type: 'number' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        required: ['meta','question','answer','to_find','understand','given','solution','formula_ids_used','formula_note'],
        properties: {
          meta: { type: 'object', required: ['exam','year','marks','difficulty','type','subject','topic','subtopic'] },
          question: { type: 'string', minLength: 5 },
          answer: { type: 'string', minLength: 1 },
          to_find: { type: 'string', minLength: 1 },
          understand: {
            type: 'object',
            required: ['plain','keywords','visual_alt'],
            properties: {
              plain: { type: 'string', minLength: 10 },
              keywords: { type: 'array', minItems: 2, items: { type: 'object', required: ['term','explain','example'] } },
              visual_svg: { type: 'string' },
              visual_alt: { type: 'string', minLength: 5 }
            }
          },
          given: {
            type: 'object',
            required: ['aim','terms','plan'],
            properties: {
              aim: { type: 'string', minLength: 5 },
              terms: { type: 'array', minItems: 3, items: { type: 'object', required: ['term','meaning','example','connects'] } },
              plan: { type: 'string', minLength: 10 }
            }
          },
          solution: {
            type: 'object',
            required: ['steps','result'],
            properties: {
              steps: { type: 'array', minItems: 2, items: { type: 'object', required: ['step','title','formula_raw','apply','note'], properties: { step: { type: 'number' }, formula_id: { type: 'string' }, formula_raw: { type: 'string' }, apply: { type: 'string' }, note: { type: 'string' }, title: { type: 'string' } } } },
              result: { type: 'string', minLength: 1 }
            }
          },
          formula_ids_used: { type: 'array', items: { type: 'string' } },
          formula_note: { type: 'string', minLength: 5 }
        }
      }
    },
    formulas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['formulaId','name','plain'],
        properties: {
          formulaId: { type: 'string' },
          name: { type: 'string' },
          latex: { type: 'string' },
          plain: { type: 'string' },
          whenToUse: { type: 'string' },
          terms: { type: 'array' },
          trap: { type: 'string' },
          reference: { type: 'string' }
        }
      }
    }
  },
  required: ['page','questions','formulas']
}

// --- Load data files via agent reads ---
const tasksData = await agent(
  `Read the file ${D}/tasks.json and return its contents as a JSON string. Return only the raw JSON, nothing else.`,
  { label: 'load-tasks' }
)
const indexData = await agent(
  `Read the file ${D}/index.json and return its contents as a JSON string. Return only the raw JSON, nothing else.`,
  { label: 'load-index' }
)
const registryData = await agent(
  `Read the file ${D}/formula-registry.json and return its contents as a JSON string. Return only the raw JSON, nothing else.`,
  { label: 'load-registry' }
)

// Load answer files
const answerLoads = await parallel([2,3,4,5,6,7,8,9,10,11].map(c => () =>
  agent(`Read the file ${D}/answers/ch${c}.json and return its contents as a JSON string. Return only the raw JSON, nothing else.`, { label: `load-ans-ch${c}` })
))

const tasks = JSON.parse(tasksData)
const index = JSON.parse(indexData)
const registry = JSON.parse(registryData)
const indexMap = {}
for (const q of index) indexMap[q.qid] = q
const answers = {}
for (const a of answerLoads.filter(Boolean)) { try { Object.assign(answers, JSON.parse(a)) } catch {} }

const regList = registry.map(f => `${f.id}: ${f.name} (${f.plain||f.id})`).join('\n')

const nAuthor = (args && args.nAuthor != null) ? args.nAuthor : tasks.length
const batchSize = 14

phase('Author')
const allResults = []

for (let start = 0; start < nAuthor; start += batchSize) {
  const end = Math.min(start + batchSize, nAuthor)
  const wave = tasks.slice(start, end)

  const waveResults = await parallel(wave.map((task, wi) => () => {
    const i = start + wi
    const qMetas = task.qids.map(qid => indexMap[qid]).filter(Boolean)
    const qlist = qMetas.map(q =>
      `${q.qid}: subject="${q.subject}" topic="${q.topic}" subtopic="${q.subtopic}" year=${q.year} type=${q.type} marks=${q.marks} difficulty=${q.difficulty}\n  prose hint: "${q.prose}"`
    ).join('\n')
    const alist = qMetas.map(q => `${q.qid}: "${answers[q.qid] || 'N/A'}"`).join('\n')

    const prompt = `${GUIDE}
${regList}

## YOUR TASK
Page: ${task.page}
Author these ${task.qids.length} questions:
${qlist}

Official answers:
${alist}

Read PDF page image: ${D}/pages/page-${String(task.page).padStart(4,'0')}.png
Also read next page: ${D}/pages/page-${String(task.page+1).padStart(4,'0')}.png
These images show the exact question text, options, and any figures.

Author ALL ${task.qids.length} questions. The "page" field in your response must be ${task.page}.`

    return agent(prompt, { label: `p${task.page}`, phase: 'Author', schema: PAGE_SCHEMA, model: 'sonnet' })
  }))

  allResults.push(...waveResults.filter(Boolean))
  log(`Batches ${start}-${end-1} complete. ${allResults.length} pages authored so far.`)
}

return allResults
