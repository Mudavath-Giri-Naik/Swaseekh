export const meta = {
  name: 'gate-bank-final',
  description: 'Author remaining GATE questions using Sonnet - data pre-loaded, agents return structured JSON',
  phases: [
    { title: 'Author', detail: 'one agent per PDF page, returns structured question JSON' },
  ],
}

// args.tasksJson = JSON string of { tasks, registry } from agent-tasks.json
// Passed in by the launcher after reading the file locally.
const { tasks, registry } = JSON.parse(args.tasksJson)
const regText = registry.join('\n')

const PAGE_SCHEMA = {
  type: 'object',
  required: ['page', 'questions', 'formulas'],
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
  }
}

function makePrompt(task) {
  const qlines = task.qMetas.map(q =>
    `  ${q.qid}: subject="${q.subject}" topic="${q.topic}" subtopic="${q.subtopic}" year=${q.year} type=${q.type} marks=${q.marks} difficulty=${q.difficulty} answer="${q.answer}"\n    prose: "${q.prose}"`
  ).join('\n')

  return `You are authoring GATE question documents for a live MongoDB study app. Return structured JSON only via StructuredOutput.

## MATH: Plain ASCII (app auto-converts to LaTeX)
fractions: a/b or (a+b)/(c+d) | powers: x^2, 2^(n-1) | subscripts: a_n | sqrt(n), sum_{i=1}^{n}, C(n,r), P(n,r) | <= >= != -> | pi theta alpha beta lambda sigma omega phi delta mu gamma | SVG text: use &gt; for > and &amp; for &

## meta.type: MCQ (A/B/C/D options) | MSQ (multiple correct) | NAT (numeric/blank)
## meta.difficulty: easy/medium/hard only | meta.exam: "GATE YEAR"
## answer: MCQ→"B. text"; MSQ→"A, C"; NAT→number; "N/A"→state correct result; "X"→correct value + note exclusion
## given.terms: min 3 | keywords: min 2 | steps: min 2 | formula_id: "" if none applies
## visual_svg: REQUIRED for Graph Theory/geometry/figures/trees; "" for pure text questions
## SVG style: <style>.bg{fill:var(--cell-bg,#F1EFE8);stroke:var(--cell-line,#B4B2A9);stroke-width:2;}.hi{fill:var(--hi-bg,#CECBF6);stroke:var(--hi-line,#7F77DD);stroke-width:3;}.ok{fill:var(--ok,#1D9E75);}.no{fill:var(--no,#D85A30);}.ink{fill:var(--color-text-primary,#2C2C2A);}.mut{fill:var(--mut,#5F5E5A);}.big{font-size:26px;font-weight:700;}.lbl{font-size:18px;font-weight:600;}.sub{font-size:14px;}.tag{font-size:14px;font-weight:600;}text{font-family:system-ui,-apple-system,Segoe UI,sans-serif;}</style>

## FORMULA REGISTRY (reuse these IDs when they fit):
${regText}

## YOUR TASK - Page ${task.page}, author ${task.qids.length} questions:
${qlines}

Read PDF page: ${task.imgPath}
Read next page: ${task.imgPathNext}
(These images show exact question text, options, figures)

The "page" field in your response MUST be ${task.page}.
Author ALL ${task.qids.length} questions. Any new formulas not in the registry go in the "formulas" array.`
}

phase('Author')

const BATCH = 14
const allResults = []

for (let start = 0; start < tasks.length; start += BATCH) {
  const wave = tasks.slice(start, Math.min(start + BATCH, tasks.length))
  const results = await parallel(wave.map(task => () =>
    agent(makePrompt(task), { label: `p${task.page}`, phase: 'Author', schema: PAGE_SCHEMA, model: 'sonnet' })
  ))
  allResults.push(...results.filter(Boolean))
  log(`${allResults.length}/${tasks.length} pages done`)
}

return allResults
