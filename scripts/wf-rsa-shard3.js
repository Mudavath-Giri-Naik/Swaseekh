export const meta = {
  name: 'rsa-extract',
  description: 'Extract RS Aggarwal Quantitative Aptitude questions into structured JSON (missing chunks only)',
  phases: [{ title: 'Extract', detail: 'one agent per remaining chunk -> writes JSON file' }],
}

// Only the chunks still missing an output file are embedded here.
const SEL = [{"id":109,"ch":11,"slug":"percentage","name":"Percentage","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c109-ch11-ex-16.txt"},{"id":167,"ch":18,"slug":"time-and-distance","name":"Time and Distance","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c167-ch18-ex-2.txt"},{"id":192,"ch":23,"slug":"compound-interest","name":"Compound Interest","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c192-ch23-ex-0.txt"},{"id":224,"ch":25,"slug":"volume-and-surface-area","name":"Volume and Surface Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c224-ch25-ex-4.txt"},{"id":232,"ch":25,"slug":"volume-and-surface-area","name":"Volume and Surface Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c232-ch25-ex-12.txt"},{"id":238,"ch":28,"slug":"clocks","name":"Clocks","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c238-ch28-solved-0.txt"},{"id":244,"ch":29,"slug":"stocks-and-shares","name":"Stocks and Shares","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c244-ch29-ex-1.txt"},{"id":251,"ch":31,"slug":"probability","name":"Probability","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c251-ch31-ex-0.txt"},{"id":255,"ch":32,"slug":"true-discount","name":"True Discount","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c255-ch32-ex-0.txt"},{"id":259,"ch":34,"slug":"heights-and-distances","name":"Heights and Distances","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c259-ch34-solved-0.txt"},{"id":263,"ch":35,"slug":"odd-man-out-and-series","name":"Odd Man Out and Series","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c263-ch35-ex-2.txt"},{"id":267,"ch":36,"slug":"tabulation","name":"Tabulation (Data Interpretation)","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c267-ch36-ex-0.txt"},{"id":271,"ch":38,"slug":"pie-chart","name":"Pie Chart (Data Interpretation)","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c271-ch38-solved-0.txt"},{"id":275,"ch":39,"slug":"line-graphs","name":"Line Graphs (Data Interpretation)","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c275-ch39-ex-1.txt"}]

const OUT = 'e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/out'
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
    '  "correctAnswer": "<exact option string e.g. \"B) 740\", or plain answer>",',
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
  ].join('\n')
}

if (SEL.length === 0) { log('Nothing to do — all chunks complete.'); return { attempted: 0, returned: 0 } }
log('Processing ' + SEL.length + ' remaining chunks (16 concurrent).')
const res = await parallel(SEL.map(c => () =>
  agent(promptFor(c), { label: 'c'+pad(c.id)+'-ch'+c.ch+'-'+c.type, phase: 'Extract', model: 'sonnet', agentType: 'general-purpose' })
))
log('Done: ' + res.filter(Boolean).length + '/' + SEL.length)
return { attempted: SEL.length, returned: res.filter(Boolean).length, summaries: res.filter(Boolean) }
