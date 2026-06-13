export const meta = {
  name: 'gate-bank-author2',
  description: 'Author all remaining GATE question docs - agents return JSON, orchestrator writes files',
  phases: [
    { title: 'Author', detail: 'agents return JSON data; orchestrator writes page-N.json files' },
  ],
}

const ROOT = 'e:/Swaseekh-main/Swaseekh-main'
const D = `${ROOT}/scripts/data`

const GUIDE = `
You are authoring premium GATE question documents for a live MongoDB study app.
Your ENTIRE response must be a single valid JSON object - nothing else, no prose before or after.

## MATH CONVENTION
Use plain ASCII math (no LaTeX dollar signs):
  fractions: a/b or (a+b)/(c+d)
  powers: x^2, 2^(n-1), a^{n+1}
  subscripts: a_n, x_{n+1}
  sqrt(x), sum_{i=1}^{n}, prod, int, C(n,r), P(n,r)
  comparisons: <= >= != ->
  Greek: pi, theta, alpha, beta, lambda, sigma, omega, phi, delta, epsilon, mu
Inside SVG <text> nodes: escape > as &gt; and & as &amp;

## OUTPUT FORMAT (single JSON object, no markdown wrapping)
{
  "questions": [
    {
      "meta": {"exam":"GATE YEAR","year":YYYY,"marks":1or2,"difficulty":"easy/medium/hard","type":"MCQ/NAT/MSQ","subject":"...","topic":"...","subtopic":"..."},
      "question": "full question text with all options A. B. C. D. inline",
      "answer": "B. option text  OR  42  OR  A, C",
      "to_find": "short phrase",
      "understand": {
        "plain": "2-4 sentence explanation",
        "keywords": [{"term":"...","explain":"...","example":"..."},{"term":"...","explain":"...","example":"..."}],
        "visual_svg": "<svg ...>...</svg>  OR EMPTY STRING for text-only questions",
        "visual_alt": "one sentence describing the visual or idea"
      },
      "given": {
        "aim": "goal in one sentence",
        "terms": [
          {"term":"...","meaning":"...","example":"...","connects":"..."},
          {"term":"...","meaning":"...","example":"...","connects":"..."},
          {"term":"...","meaning":"...","example":"...","connects":"..."}
        ],
        "plan": "1-2 sentence strategy"
      },
      "solution": {
        "steps": [
          {"step":1,"title":"...","formula_id":"id-or-empty-string","formula_raw":"...","apply":"...","note":"..."},
          {"step":2,"title":"...","formula_id":"id-or-empty-string","formula_raw":"...","apply":"...","note":"..."}
        ],
        "result": "final answer matching the answer field"
      },
      "formula_ids_used": ["id1","id2"],
      "formula_note": "one sentence on key formula/idea"
    }
  ],
  "formulas": [
    {
      "formulaId": "kebab-case-id",
      "name": "Human Name",
      "latex": "LaTeX string",
      "plain": "ASCII plain text",
      "whenToUse": "...",
      "terms": [{"symbol":"...","means":"..."}],
      "trap": "...",
      "reference": "..."
    }
  ]
}

## RULES
- type: if options A/B/C/D present → MCQ; "which is/are" true (multiple) → MSQ; blank/numeric → NAT; proof/descriptive → NAT
- exam = "GATE YEAR" (e.g. "GATE 2015")
- difficulty: easy/medium/hard only
- given.terms: minimum 3 entries
- keywords: minimum 2 entries
- steps: minimum 2 entries
- formula_id: use existing IDs from the registry when applicable; define new ones in "formulas"; use "" if no formula applies
- formulas array: only NEW formulas not in the registry; empty array [] if none needed
- SVG style block to use (copy verbatim):
  <style>.bg{fill:var(--cell-bg,#F1EFE8);stroke:var(--cell-line,#B4B2A9);stroke-width:2;}.hi{fill:var(--hi-bg,#CECBF6);stroke:var(--hi-line,#7F77DD);stroke-width:3;}.ok{fill:var(--ok,#1D9E75);}.no{fill:var(--no,#D85A30);}.ink{fill:var(--color-text-primary,#2C2C2A);}.mut{fill:var(--mut,#5F5E5A);}.big{font-size:26px;font-weight:700;}.lbl{font-size:18px;font-weight:600;}.sub{font-size:14px;}.tag{font-size:14px;font-weight:600;}text{font-family:system-ui,-apple-system,Segoe UI,sans-serif;}</style>
- answer key values: "N/A" = proof/descriptive (write the correct statement); "X" = excluded (compute correct answer, note exclusion in formula_note); "65 : 65" range = use center value
- Every field must be non-empty except visual_svg (can be "")
`

const SCHEMA = {
  type: 'object',
  properties: {
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
          understand: { type: 'object', required: ['plain','keywords','visual_alt'], properties: { plain: { type: 'string' }, keywords: { type: 'array', minItems: 2 }, visual_svg: { type: 'string' }, visual_alt: { type: 'string' } } },
          given: { type: 'object', required: ['aim','terms','plan'], properties: { aim: { type: 'string' }, terms: { type: 'array', minItems: 3 }, plan: { type: 'string' } } },
          solution: { type: 'object', required: ['steps','result'], properties: { steps: { type: 'array', minItems: 2 }, result: { type: 'string' } } },
          formula_ids_used: { type: 'array' },
          formula_note: { type: 'string' }
        }
      }
    },
    formulas: { type: 'array' }
  },
  required: ['questions','formulas']
}

function authorPrompt(taskIndex, task, qMetas, answers, registry) {
  const qlist = qMetas.map(q => `  ${q.qid}: subject="${q.subject}" topic="${q.topic}" subtopic="${q.subtopic}" year=${q.year} type=${q.type} marks=${q.marks} difficulty=${q.difficulty} prose="${q.prose}"`).join('\n')
  const alist = qMetas.map(q => `  ${q.qid}: "${answers[q.qid] || 'N/A'}"`).join('\n')
  const regSample = registry.slice(0, 40).map(f => `  ${f.id}: ${f.name}`).join('\n')
  return `${GUIDE}

## YOUR TASK: Task index ${taskIndex}, PDF page ${task.page}

Question IDs to author:
${qlist}

Authoritative answers (from official key):
${alist}

Formula registry (existing IDs you can reuse - first 40 shown):
${regSample}
... plus ${Math.max(0, registry.length - 40)} more. Use these IDs when they fit: ${registry.map(f=>f.id).join(', ')}

Read the page image at: ${D}/pages/page-${String(task.page).padStart(4,'0')}.png
Also read the next page: ${D}/pages/page-${String(task.page+1).padStart(4,'0')}.png

Author ALL ${task.qids.length} questions listed above. Return ONLY the JSON object.`
}

// Load supporting data
const fs = require('fs')
const tasks = JSON.parse(fs.readFileSync(`${D}/tasks.json`, 'utf8'))
const index = JSON.parse(fs.readFileSync(`${D}/index.json`, 'utf8'))
const indexMap = {}
for (const q of index) indexMap[q.qid] = q

const registry = JSON.parse(fs.readFileSync(`${D}/formula-registry.json`, 'utf8'))

// Load all answer files
const answers = {}
for (let c = 2; c <= 11; c++) {
  try {
    const a = JSON.parse(fs.readFileSync(`${D}/answers/ch${c}.json`, 'utf8'))
    Object.assign(answers, a)
  } catch {}
}

const nAuthor = args && args.nAuthor != null ? args.nAuthor : tasks.length
const batchSize = 16

phase('Author')

for (let start = 0; start < nAuthor; start += batchSize) {
  const end = Math.min(start + batchSize, nAuthor)
  const wave = tasks.slice(start, end)

  const results = await parallel(wave.map((task, wi) => () => {
    const i = start + wi
    const outPath = `${D}/auto/page-${task.page}.json`
    // Skip if already done
    const qMetas = task.qids.map(qid => indexMap[qid]).filter(Boolean)
    const prompt = authorPrompt(i, task, qMetas, answers, registry)
    return agent(prompt, { label: `p${task.page}`, phase: 'Author', schema: SCHEMA })
      .then(data => {
        if (!data) return `null page-${task.page}`
        // Orchestrator writes the file — no agent file I/O needed
        const fs = require('fs')
        fs.writeFileSync(outPath, JSON.stringify(data))
        return `ok page-${task.page}: ${(data.questions||[]).length}q ${(data.formulas||[]).length}f`
      })
  }))

  const ok = results.filter(r => r && String(r).startsWith('ok')).length
  const skipped = results.filter(r => r && String(r).startsWith('skip')).length
  log(`tasks ${start}-${end-1}: ${ok} authored, ${skipped} skipped, ${results.filter(Boolean).length}/${end-start} done`)
}

return `authored ${nAuthor} tasks`
