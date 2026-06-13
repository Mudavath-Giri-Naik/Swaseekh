export const meta = {
  name: 'gate-v2-author-s3',
  description: 'Author volume2 shard 3/4 (pages idx 116..173) into auto-v2/ JSON',
  phases: [{ title: 'Author', detail: 'one Sonnet agent per page', model: 'sonnet' }],
}

const ROOT = 'e:/Swaseekh-main/Swaseekh-main/scripts/data'
const pad = (n) => String(n).padStart(4, '0')

// All remaining volume2 pages needing authoring (from remaining-pages-v2.json).
const PAGES = [216,245,266,270,274,275,278,279,283,286,287,289,290,291,294,295,297,298,299,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,576,577,578,579,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,615,616,617,618,619,620,621,622,623,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694]

// Smoke test: process only the first 8. Change to PAGES for the full run.
const TODO = PAGES.slice(116, 174)

function buildPrompt(page) {
  const p = pad(page)
  return `You are authoring GATE Computer-Science previous-year questions into a strict JSON schema for a study app. Work for ONE page only.

STEP 1 - Read your two inputs (use the Read tool):
  - Hint file (question list + OFFICIAL answer keys): ${ROOT}/hints-v2/page-${p}.json
  - Page image (the real questions, with code/figures/math): ${ROOT}/pages-v2/page-${p}.png
  If the last question on the image is cut off, also Read ${ROOT}/pages-v2/page-${pad(page + 1)}.png to finish it.

STEP 2 - Author EXACTLY one question object per qid listed in the hint file (same order, same count = hint.count). The image is the source of truth for the question text, options, code, and figures; the hint gives you qid, subtopic, year, type, marks, and the OFFICIAL answer_key. Use answer_key to state the correct answer. If answer_key is "N/A" or "X", it is a descriptive/proof question - write the correct answer from your own expert CS knowledge.

SCHEMA - each question object MUST have exactly these keys:
{
  "meta": { "exam": "<e.g. GATE CSE 2019 | Set 1>", "year": <int>, "marks": <1 or 2>, "difficulty": "easy|medium|hard", "type": "NAT|MCQ|MSQ", "subject": "<hint.subject>", "topic": "<the qid's subtopic>", "subtopic": "<the qid's subtopic>" },
  "question": "<full question text. Transcribe code/relations/tables faithfully as PLAIN ASCII (no LaTeX, no unicode math symbols - write <=, >=, !=, ->, sum, theta, O(n log n), etc.). For MCQ/MSQ append options inline as: A. ...  B. ...  C. ...  D. ...>",
  "answer": "<the correct answer stated fully. For MCQ give the letter AND the option's text, e.g. 'C. 14'. For MSQ list all correct letters. For NAT give the value/range from answer_key.>",
  "to_find": "<one line: what the question asks for>",
  "understand": {
    "plain": "<2-4 sentence plain-English explanation of the idea and how to approach it>",
    "keywords": [ {"term":"...","explain":"...","example":"..."}, {"term":"...","explain":"...","example":"..."}, {"term":"...","explain":"...","example":"..."} ],
    "visual_svg": "<a clean, correct inline SVG illustrating the concept (tree/graph/circuit/automaton/table/timeline). Use viewBox, system-ui fonts, and CSS vars with fallbacks like fill:var(--color-text-primary,#2C2C2A). Self-contained and valid. If a diagram truly adds nothing, use an empty string.>",
    "visual_alt": "<one sentence describing the visual / the key takeaway>"
  },
  "given": {
    "aim": "<what we aim to compute/prove>",
    "terms": [ {"term":"...","meaning":"...","example":"...","connects":"..."}, {"term":"...","meaning":"...","example":"...","connects":"..."} ],
    "plan": "<the solution plan in one or two sentences>"
  },
  "solution": {
    "steps": [ {"step":1,"title":"...","formula_id":"","formula_raw":"<relevant relation in ASCII, or empty>","apply":"<the actual work for this step>","note":"<short insight or trap>"} ],
    "result": "<final result, consistent with answer>"
  },
  "formula_ids_used": [],
  "formula_note": "<1-2 sentences naming the key principle/technique used>"
}

HARD RULES (these cause rejection if broken):
  - "formula_ids_used" MUST be [] (empty array) and EVERY step's "formula_id" MUST be "" (empty string). Put any relation in "formula_raw" instead.
  - All required fields non-empty: question, answer, to_find, formula_note; meta.* all 8; understand.plain, understand.visual_alt, >=2 keywords each with term/explain/example; given.aim, given.plan, >=2 terms each with term/meaning/example/connects; solution.result and >=2 steps each with numeric step, title, apply.
  - type exactly one of NAT, MCQ, MSQ; difficulty exactly easy, medium, or hard.
  - Math/code as plain ASCII only. No markdown fences inside JSON strings. Escape quotes/newlines properly.
  - Author solid, correct, exam-accurate solutions - these are real GATE questions with known answers.

STEP 3 - Write the result with the Write tool to: ${ROOT}/auto-v2/page-${p}.json
The file content MUST be valid JSON of the form: { "questions": [ {..}, {..}, ... ] } with one object per qid, in order.

Return ONLY a one-line status: "page ${page}: wrote N questions".`
}

phase('Author')
const results = await parallel(TODO.map((page) => () =>
  agent(buildPrompt(page), { label: `author:p${page}`, phase: 'Author', model: 'sonnet' })
))
const ok = results.filter(Boolean).length
log(`Authoring batch done: ${ok}/${TODO.length} agents returned`)
return { attempted: TODO.length, returned: ok }
