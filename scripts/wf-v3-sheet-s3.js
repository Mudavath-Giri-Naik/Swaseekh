export const meta = {
  name: 'v3-sheets-s3',
  description: 'Phase2 shard 3/4: author formula sheets for 10 concepts',
  phases: [{ title: 'Author', detail: 'one agent per concept' }],
}

const ROOT = 'e:/Swaseekh-main/Swaseekh-main/scripts/data'
const CONCEPTS = ["con_001","con_002","con_003","con_004","con_005","con_006","con_007","con_008","con_009","con_013","con_014","con_015","con_016","con_017","con_018","con_019","con_021","con_022","con_023","con_024","con_025","con_026","con_027","con_028","con_029","con_030","con_031","con_032","con_033","con_034","con_035","con_036","con_037","con_038","con_039","con_040","con_041","con_042","con_043","con_044","con_045","con_046","con_047","con_048","con_049","con_050","con_051","con_052","con_053","con_054","con_055","con_056","con_057","con_058","con_059","con_060","con_061","con_062","con_063","con_064","con_065","con_066","con_067","con_068","con_069","con_070","con_071","con_072","con_073","con_074","con_075","con_076","con_077","con_078","con_079","con_080","con_081","con_082"]

const SCHEMA = {
  type: 'object',
  required: ['conceptId', 'formulaCount', 'subtopicFormulas'],
  properties: {
    conceptId: { type: 'string' },
    conceptTitle: { type: 'string' },
    formulaCount: { type: 'number' },
    theoryBased: { type: 'boolean' },
    subtopicFormulas: {
      type: 'array',
      description: 'one entry per subtopic in the task file; the formulaIds from THIS sheet that questions of that subtopic use',
      items: {
        type: 'object',
        required: ['subtopic', 'formulaIds'],
        properties: {
          subtopic: { type: 'string' },
          formulaIds: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
}

function prompt(conceptId) {
  return `You are authoring a GATE Computer-Science "formula sheet" content document for ONE concept, for a study app. The sheet renders as colored cards of formulas; each formula can show how many questions use it.

STEP 1 — Read your task file (Read tool): ${ROOT}/concept-tasks/${conceptId}.json
It contains: conceptId, conceptTitle, subject, topic, subtopics (the question-subtopics routed to this concept), subtopicCounts, questionCount, and sampleQuestions (real question stems). Study the sample questions to know which formulas/results the questions actually need.

STEP 2 — Author the content document. SHAPE (match exactly):
{
  "_id": "${conceptId}",
  "conceptId": "${conceptId}",
  "conceptTitle": "<the conceptTitle>",
  "reference": "GATE CS — <subject> / <topic>",
  "decisionGuide": { "title": "Which result do I use?", "map": [ {"condition":"<short cue>","use":"<latex of the formula to use>"}, ... 2-5 rows ] },
  "groups": [
    {
      "groupId": "<kebab-id>",
      "groupTitle": "<short group name>",
      "formulas": [
        {
          "formulaId": "${conceptId}-<kebab-slug>",
          "name": "<formula / result / rule name>",
          "latex": "<valid KaTeX, e.g. T(n) = 2T(n/2) + O(n) \\Rightarrow O(n \\log n)>",
          "plain": "<plain-ASCII version>",
          "whenToUse": "<one line: when this applies>",
          "terms": [ {"symbol":"n","means":"input size"}, ... ],
          "trap": "<the classic GATE trap/pitfall>",
          "reference": "<subject/topic ref>"
        }
      ]
    }
  ]
}

RULES:
- EVERY formulaId MUST start with "${conceptId}-" (so it is globally unique across the app). kebab-case after the prefix.
- Author 8-30 entries total across 2-8 groups, covering the key formulas, results, theorems, identities, and standard facts a student needs for THIS concept and its subtopics. Base coverage on the sample questions.
- THEORY-HEAVY concepts (e.g. ER Model, Lexical Analysis, OSI stack, Process states): there may be few real equations. That is fine — author the entries as KEY RESULTS / DEFINITIONS / RULES (e.g. "ACID properties", "Chomsky hierarchy containment", "Pumping lemma condition"). Put them in a group titled "Key Results & Definitions" and write latex as a clean notation or short statement. Set "theoryBased": true in your return when the concept is mostly definitional.
- latex must be valid KaTeX (escape backslashes properly in JSON). plain must be readable ASCII.

STEP 3 — Write the document with the Write tool to: ${ROOT}/content-v3/${conceptId}.json  (valid JSON, the object above).

STEP 4 — Build the subtopic->formula link map: for EACH subtopic listed in the task file's "subtopics", choose the array of formulaIds (from THIS sheet) that questions of that subtopic most use (1-4 ids each; if a subtopic is purely conceptual, still link the closest 1-2 key-result formulaIds so the question is connected to the sheet). Cover every subtopic.

STEP 5 — Write that link map with the Write tool to: ${ROOT}/concept-links/${conceptId}.json
as: { "conceptId": "${conceptId}", "subtopicFormulas": [ {"subtopic":"...","formulaIds":["${conceptId}-..."]}, ... ] }

STEP 6 — Return the conceptId, conceptTitle, formulaCount, theoryBased (bool), and the same subtopicFormulas array.`
}

const TODO = ["con_065","con_066","con_067","con_068","con_069","con_070","con_071","con_072","con_073","con_074"]
phase('Author')
const results = await parallel(TODO.map((cid) => () =>
  agent(prompt(cid), { label: `sheet:${cid}`, phase: 'Author', schema: SCHEMA, model: 'sonnet' })
))
const clean = results.filter(Boolean)
const totalFormulas = clean.reduce((n, r) => n + (r.formulaCount || 0), 0)
log(`Authored ${clean.length}/${CONCEPTS.length} concept sheets; ${totalFormulas} formulas total`)
return { authored: clean.length, totalFormulas, maps: clean }
