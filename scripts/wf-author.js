export const meta = {
  name: 'gate-bank-author',
  description: 'Author all remaining GATE question docs (Ch2-11) from rendered PDF pages into JSON files',
  phases: [
    { title: 'Keys', detail: 'read answer-key page images -> answers/ch<c>.json' },
    { title: 'Author', detail: 'one agent per PDF page: read page image, author gold-standard docs -> auto/page-<n>.json' },
  ],
}

const ROOT = 'e:/Swaseekh-main/Swaseekh-main'
const D = `${ROOT}/scripts/data`

// ---- Shared authoring guide embedded in every Author agent prompt ----
const GUIDE = `
You are authoring premium GATE question documents for a live MongoDB study app. Match an existing
"gold standard" exactly in depth, tone, and structure. Output is DATA written to a file, not prose.

## MATH CONVENTION (critical)
Do NOT use LaTeX dollar delimiters. Use plain ASCII math everywhere (the app converts ASCII to LaTeX):
  fractions a/b or (a+b)/(c) ; powers x^2 or 2^(n-1) ; subscripts a_n or x_{n+1} ;
  sqrt(...) ; sum_{i=1}^{n} ; prod ; int ; <= >= != -> ; C(n,r) for combinations ; P(n,r) ;
  multiplication with * or the word x ; mod ; pi, theta, alpha, lambda, infty for symbols.
Inside SVG <text>, escape > as &gt;, < as &lt;, & as &amp;.

## DOCUMENT SHAPE (one object per question)
{
 "meta": {"exam","year","marks","difficulty","type","subject","topic","subtopic"},
 "question": "<full question text incl. all options A./B./C./D. inline, math in ASCII>",
 "answer": "<final answer; MCQ: 'B. <text>'; MSQ: 'A, C'; NAT: the number/range; proof: short result>",
 "to_find": "<one short phrase of what is asked>",
 "understand": {
   "plain": "<2-4 sentence student-friendly explanation of the idea/approach>",
   "keywords": [{"term","explain","example"}, ...2-3...],
   "visual_svg": "<an SVG diagram (see STYLE) when the question has a graph/geometry/figure/process; else ''>",
   "visual_alt": "<one-sentence plain description of the visual/idea>"
 },
 "given": {
   "aim": "<the goal in one sentence>",
   "terms": [{"term","meaning","example","connects"}, ...3-4 variables/entities...],
   "plan": "<the solving strategy in 1-2 sentences>"
 },
 "solution": {
   "steps": [{"step":1,"title","formula_id","formula_raw","apply","note"}, ...2-4 steps...],
   "result": "<final result, matching answer>"
 },
 "formula_ids_used": ["<ids used in steps>"],
 "formula_note": "<1 sentence: which formula/idea is key and why>"
}

## META RULES
Use the provided subject/topic/subtopic/year/type/marks/difficulty for each qid EXACTLY (do not rename
subtopic). exam = "GATE <year>". Only correct 'type' if the page clearly shows otherwise (options A-D present => MCQ;
"which is/are" multiple-select => MSQ; numeric/blank answer => NAT). difficulty: keep provided.

## ANSWER RULES
The authoritative final answer is in answers/ch<chapter>.json (key = qid). Use it verbatim as the basis:
 - "N/A" in the key => a descriptive/proof question: set answer to a concise correct statement of the result.
 - "X" => question excluded by official key: compute the genuinely correct value, set answer to that value and
   add to formula_note that the official key marks it excluded.
 - ranges like "65 : 65" or "197.9 : 198.1" => NAT acceptance range; use the central value (e.g. 198) in answer.
 - "A;C" => MSQ; render as "A, C" (or "A and C").
Your worked solution MUST arrive at this answer. If the page text is unreadable/figure-only and you cannot solve,
still produce a best-effort doc consistent with the key answer and note the uncertainty in formula_note.

## SVG STYLE (reuse this exact <style>; keep viewBox ~ 0 0 W H; ASCII math in <text>; it is auto-rendered)
<style>.bg{fill:var(--cell-bg,#F1EFE8);stroke:var(--cell-line,#B4B2A9);stroke-width:2;}.hi{fill:var(--hi-bg,#CECBF6);stroke:var(--hi-line,#7F77DD);stroke-width:3;}.ok{fill:var(--ok,#1D9E75);}.no{fill:var(--no,#D85A30);}.ink{fill:var(--color-text-primary,#2C2C2A);}.mut{fill:var(--mut,#5F5E5A);}.big{font-size:26px;font-weight:700;}.lbl{font-size:18px;font-weight:600;}.sub{font-size:14px;}.tag{font-size:14px;font-weight:600;}text{font-family:system-ui,-apple-system,Segoe UI,sans-serif;}</style>
For graphs: <circle> nodes + <line class='edge' stroke='#B4B2A9' stroke-width='2.5'/> edges. Keep it clean and correct.
Always provide visual_svg for Graph Theory, geometry, figures, circuits, trees, Venn diagrams, charts, spatial
patterns. For pure-text questions (logic, verbal, most aptitude) set visual_svg to '' and rely on visual_alt.

## FORMULAS
Read ${D.replace(/\\/g, '/')}/formula-registry.json — REUSE an existing formula id whenever one fits (put it in
formula_id and formula_ids_used). If you need a formula not in the registry, DEFINE it in this file's "formulas"
array with shape {"formulaId","name","latex","plain","whenToUse","terms":[{"symbol","means"}],"trap","reference"}
and use that id. Use kebab-case ids (e.g. "derivative-power-rule"). Every formula_id you reference MUST be either
in the registry or defined in some "formulas" array. Steps that are pure arithmetic/logic may use formula_id "".
Reuse the same new id across questions (define it once is enough, but defining again is harmless).

## QUALITY
Every field non-empty (except visual_svg which may be ''). given.terms >= 3. keywords >= 2. steps >= 2.
Tone: warm, precise, student-facing. No placeholders. Valid JSON only.
`

function authorPrompt(i) {
  return `${GUIDE}

## YOUR TASK
1. Read ${D.replace(/\\/g, '/')}/tasks.json and take the entry at index ${i} (0-based). It has {page, chapter, qids}.
2. If ${D.replace(/\\/g, '/')}/auto/page-<page>.json already exists and parses as JSON with a "questions" array whose
   length equals your qids count, STOP and return "skip <page>" (already done).
3. Read the page image ${D.replace(/\\/g, '/')}/pages/page-<page>.png (zero-padded to 4 digits, e.g. page-0042.png)
   AND the next page image page-<page+1>.png (for questions whose options/figure continue). These images are the
   GROUND TRUTH for question text, options, and figures.
4. Read ${D.replace(/\\/g, '/')}/index.json and filter to your qids to get each question's meta + prose hint.
5. Read ${D.replace(/\\/g, '/')}/answers/ch<chapter>.json for the authoritative answer of each qid.
6. Author one complete document per qid (follow the guide). Collect any new formula definitions.
7. Write ${D.replace(/\\/g, '/')}/auto/page-<page>.json containing exactly:
   {"questions":[<one doc per qid, in qid order>], "formulas":[<new formula defs, possibly empty>]}
   Write valid JSON (use your Write tool). Do not include _id or id fields.
8. Return a one-line summary: "page <page>: authored <N> docs, <M> new formulas".
Author EVERY qid in your task (do not skip any). This is going into production; be accurate and complete.`
}

function keyPrompt(chapter) {
  return `If ${D.replace(/\\/g, '/')}/answers/ch${chapter}.json already exists and parses as a non-empty JSON object,
STOP and return "skip ch${chapter}".
Read ${D.replace(/\\/g, '/')}/keytasks.json, find the entry with chapter == ${chapter}; it lists answer-key page numbers.
Read each of those page images ${D.replace(/\\/g, '/')}/pages/page-<p>.png (zero-padded 4 digits). They contain a
compact "Answer Keys" table mapping question ids (like ${chapter}.3.5) to answers (a letter A/B/C/D, a number, a
range like "65 : 65", "N/A", "X", or multi like "A;C"). Transcribe EVERY ${chapter}.x.y entry you can see.
Write ${D.replace(/\\/g, '/')}/answers/ch${chapter}.json as a single JSON object {"<qid>":"<answer>", ...} covering all
entries for chapter ${chapter}. Preserve answers verbatim (keep "N/A","X", ranges, "A;C"). Return "ch${chapter}: <count> answers".`
}

// ---- Orchestration ----
const nAuthor = (args && args.nAuthor) || 349
const keyChapters = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

phase('Keys')
await parallel(keyChapters.map((c) => () =>
  agent(keyPrompt(c), { label: `keys:ch${c}`, phase: 'Keys' })
))

phase('Author')
// Single barrier-free fan-out: the runtime caps concurrency (~14) and queues the
// rest, so all nAuthor tasks complete with no per-batch stragglers blocking progress.
const tasks = []
for (let i = 0; i < nAuthor; i++) tasks.push(i)
const results = await parallel(tasks.map((i) => () =>
  agent(authorPrompt(i), { label: `author:#${i}`, phase: 'Author' })
))

return { authored: results.filter(Boolean).length, total: nAuthor }
