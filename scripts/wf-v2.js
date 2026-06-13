export const meta = {
  name: 'gate-v2-author',
  description: 'Author volume2 (core-CS) GATE questions: one Sonnet agent per PDF page reads the page image and writes a complete question JSON file',
  phases: [
    { title: 'Author', detail: 'one agent per PDF page → writes auto-v2/page-NNNN.json', model: 'sonnet' },
  ],
}

// args.pages = array of page numbers to author (each has a tasks-v2/page-NNNN.json + pages-v2 image)
let _A = args
if (typeof _A === 'string') { try { _A = JSON.parse(_A) } catch { _A = {} } }
const pages = (_A && (Array.isArray(_A) ? _A : _A.pages)) || []
const ROOT = 'e:/Swaseekh-main/Swaseekh-main/scripts/data'
const pad = (n) => String(n).padStart(4, '0')

const SUMMARY_SCHEMA = {
  type: 'object',
  required: ['page', 'count', 'wrote'],
  properties: {
    page: { type: 'number' },
    count: { type: 'number' },
    wrote: { type: 'boolean' },
    note: { type: 'string' },
  },
}

function makePrompt(p) {
  const pp = pad(p)
  const taskFile = `${ROOT}/tasks-v2/page-${pp}.json`
  const img = `${ROOT}/pages-v2/page-${pp}.png`
  const imgNext = `${ROOT}/pages-v2/page-${pad(p + 1)}.png`
  const outFile = `${ROOT}/auto-v2/page-${pp}.json`

  return `You are authoring GATE Computer-Science question documents for a live MongoDB study app (Swaseekh). Quality and completeness are critical — these are real previous-year GATE CS questions students will study.

## STEP 1 — Read your task list (authoritative qid + metadata + OFFICIAL ANSWER):
Read this JSON file: ${taskFile}
It lists every qid you MUST author for this page, with reliable fields: subject, topic, subtopic, year, type, marks, difficulty, a (rough, OCR-mangled) prose hint, and — critically — "answer_official".

## ⚠️ GROUND TRUTH: "answer_official" is the OFFICIAL GATE answer key for that qid.
- When answer_official is present (e.g. "C", "A;C", "6", "75", "1500", a range like "3 to 5"), your authored "answer" MUST agree with it, and your worked solution MUST correctly derive THAT result. Do not contradict it. If your own first instinct differs, trust the official key and find the reasoning that reaches it (re-examine the figure/options in the image — you likely misread something).
- "A;C" means it is an MSQ with BOTH A and C correct — set meta.type="MSQ" and answer="A, C".
- "N/A" means descriptive/proof (no single answer) — author a full model solution. "X" means the question was excluded/marked-to-all — give the technically correct value and note it. "" (empty) means no key was available — solve it yourself carefully.
- For NAT, match the official numeric value exactly (use the given number/range).

## STEP 2 — Read the page image (THE SOURCE OF TRUTH for exact text/figures/code/options):
Read image: ${img}
If a listed question's text or options clearly continue onto the next page, also read: ${imgNext}
The prose hint from STEP 1 is often missing math symbols/variables/figures — TRUST THE IMAGE for the real question text, code, diagrams, tables and answer options.

## STEP 3 — Author EVERY qid in the task list as one complete question document.
Solve each question yourself (you are an expert in GATE CS: Algorithms, OS, DBMS, CN, COA, Compilers, Digital Logic, TOC, Data Structures, C programming) and produce the correct answer + a clear worked solution.

## MATH / NOTATION: Plain ASCII (the app auto-converts to LaTeX)
fractions a/b or (a+b)/(c+d) | powers x^2, 2^(n-1) | subscripts a_n | sqrt(n), sum_{i=1}^{n}, log_2(n), C(n,r) | <= >= != -> | Theta(n), O(n log n), Omega(n) | pi theta alpha beta lambda sigma omega phi | In SVG text use &gt; for > and &amp; for &. For C code / pseudocode put it verbatim inside the question string (use \\n for line breaks); preserve exact operators.

## EXACT DOCUMENT SHAPE (every field required unless marked optional):
{
  "meta": { "exam": "GATE <year>", "year": <number>, "marks": <1 or 2>, "difficulty": "easy|medium|hard", "type": "MCQ|MSQ|NAT", "subject": "<from task>", "topic": "<from task>", "subtopic": "<from task>" },
  "question": "<exact question text; include MCQ options inline as 'A. ... B. ... C. ... D. ...'; include code/tables verbatim>",
  "answer": "<MCQ: 'B. <option text>' | MSQ: 'A, C' | NAT: the number or range>",
  "to_find": "<one short line: what the question asks for>",
  "understand": {
    "plain": "<2-4 sentences explaining the question in simple words a beginner understands>",
    "keywords": [ { "term": "<key term>", "explain": "<what it means>", "example": "<tiny example>" }, ... (min 2) ],
    "visual_svg": "<an SVG diagram for graph/tree/automaton/circuit/K-map/timeline/memory-layout questions, using the style block below; else \\"\\">",
    "visual_alt": "<short text description of the figure or concept (always required)>"
  },
  "given": {
    "aim": "<the goal of the problem in one line>",
    "terms": [ { "term": "<symbol/quantity/given fact>", "meaning": "<what it is>", "example": "<tiny example>", "connects": "<how it feeds the solution>" }, ... (min 3) ],
    "plan": "<the strategy to solve, 1-3 sentences>"
  },
  "solution": {
    "steps": [ { "step": 1, "title": "<step title>", "formula_raw": "<relation/expression used, or \\"\\">", "apply": "<the actual work/derivation for this step>", "note": "<insight or caution>" }, ... (min 2) ],
    "result": "<final answer restated clearly, matching 'answer'>"
  },
  "formula_ids_used": [],
  "formula_note": "<1-2 lines naming the key idea/algorithm/property used (e.g. 'Master theorem for divide-and-conquer recurrences')>"
}

## SVG style block (paste as the first child of <svg ...> when you draw one):
<style>.bg{fill:var(--cell-bg,#F1EFE8);stroke:var(--cell-line,#B4B2A9);stroke-width:2;}.hi{fill:var(--hi-bg,#CECBF6);stroke:var(--hi-line,#7F77DD);stroke-width:3;}.ok{fill:var(--ok,#1D9E75);}.no{fill:var(--no,#D85A30);}.ink{fill:var(--color-text-primary,#2C2C2A);}.mut{fill:var(--mut,#5F5E5A);}.big{font-size:26px;font-weight:700;}.lbl{font-size:18px;font-weight:600;}.sub{font-size:14px;}.tag{font-size:14px;font-weight:600;}text{font-family:system-ui,-apple-system,Segoe UI,sans-serif;}</style>

## RULES
- meta.subject/topic/subtopic: copy EXACTLY from the task file (do not invent new names).
- meta.type: MCQ if it has A/B/C/D options; MSQ if "one or more"/multiple correct; NAT if numeric/blank answer.
- formula_ids_used MUST be [] (empty). Put any key formula/algorithm name in formula_note instead.
- given.terms >= 3, understand.keywords >= 2, solution.steps >= 2.
- Author ALL questions listed in the task file — do not skip any. If the image is unreadable for one, still author it from the prose hint and your GATE expertise, and set note accordingly.

## STEP 4 — Write the output file (use the Write tool):
Write to: ${outFile}
Content: a single JSON object exactly like: { "page": ${p}, "questions": [ <one document per qid, in qid order> ] }
Make sure it is strict, valid JSON (double-quoted keys/strings, no trailing commas, no comments).

## STEP 5 — Return your summary via StructuredOutput:
{ "page": ${p}, "count": <number of questions you wrote>, "wrote": true, "note": "<any issues, or 'ok'>" }`
}

phase('Author')

const results = await parallel(
  pages.map((p) => () => agent(makePrompt(p), { label: `p${p}`, phase: 'Author', schema: SUMMARY_SCHEMA, model: 'sonnet' }))
)

const ok = results.filter(Boolean)
const wrote = ok.filter((r) => r && r.wrote).length
const totalQ = ok.reduce((s, r) => s + (r && r.count || 0), 0)
log(`Done: ${wrote}/${pages.length} pages wrote, ${totalQ} questions authored`)
return { pages: pages.length, wrote, totalQ, results: ok }
