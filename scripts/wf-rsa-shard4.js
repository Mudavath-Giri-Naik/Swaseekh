export const meta = {
  name: 'rsa-extract',
  description: 'Extract RS Aggarwal Quantitative Aptitude questions into structured JSON (missing chunks only)',
  phases: [{ title: 'Extract', detail: 'one agent per remaining chunk -> writes JSON file' }],
}

// Only the chunks still missing an output file are embedded here.
const SEL = [{"id":107,"ch":11,"slug":"percentage","name":"Percentage","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c107-ch11-ex-14.txt"},{"id":131,"ch":13,"slug":"ratio-and-proportion","name":"Ratio and Proportion","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c131-ch13-ex-1.txt"},{"id":145,"ch":14,"slug":"partnership","name":"Partnership","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c145-ch14-ex-2.txt"},{"id":154,"ch":16,"slug":"pipes-and-cisterns","name":"Pipes and Cisterns","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c154-ch16-ex-1.txt"},{"id":159,"ch":17,"slug":"time-and-work","name":"Time and Work","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c159-ch17-ex-2.txt"},{"id":164,"ch":18,"slug":"time-and-distance","name":"Time and Distance","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c164-ch18-solved-1.txt"},{"id":169,"ch":18,"slug":"time-and-distance","name":"Time and Distance","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c169-ch18-ex-4.txt"},{"id":174,"ch":19,"slug":"boats-and-streams","name":"Boats and Streams","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c174-ch19-solved-0.txt"},{"id":179,"ch":20,"slug":"problems-on-trains","name":"Problems on Trains","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c179-ch20-ex-1.txt"},{"id":184,"ch":21,"slug":"alligation-or-mixture","name":"Alligation or Mixture","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c184-ch21-ex-1.txt"},{"id":189,"ch":22,"slug":"simple-interest","name":"Simple Interest","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c189-ch22-ex-3.txt"},{"id":194,"ch":23,"slug":"compound-interest","name":"Compound Interest","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c194-ch23-ex-2.txt"},{"id":199,"ch":24,"slug":"area","name":"Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c199-ch24-ex-0.txt"},{"id":204,"ch":24,"slug":"area","name":"Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c204-ch24-ex-5.txt"},{"id":209,"ch":24,"slug":"area","name":"Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c209-ch24-ex-10.txt"},{"id":214,"ch":24,"slug":"area","name":"Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c214-ch24-ex-15.txt"},{"id":219,"ch":25,"slug":"volume-and-surface-area","name":"Volume and Surface Area","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c219-ch25-solved-1.txt"},{"id":224,"ch":25,"slug":"volume-and-surface-area","name":"Volume and Surface Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c224-ch25-ex-4.txt"},{"id":229,"ch":25,"slug":"volume-and-surface-area","name":"Volume and Surface Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c229-ch25-ex-9.txt"},{"id":234,"ch":25,"slug":"volume-and-surface-area","name":"Volume and Surface Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c234-ch25-ex-14.txt"},{"id":239,"ch":28,"slug":"clocks","name":"Clocks","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c239-ch28-ex-0.txt"},{"id":244,"ch":29,"slug":"stocks-and-shares","name":"Stocks and Shares","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c244-ch29-ex-1.txt"},{"id":249,"ch":30,"slug":"permutations-combinations","name":"Permutations and Combinations","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c249-ch30-ex-2.txt"},{"id":254,"ch":32,"slug":"true-discount","name":"True Discount","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c254-ch32-solved-0.txt"},{"id":259,"ch":34,"slug":"heights-and-distances","name":"Heights and Distances","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c259-ch34-solved-0.txt"},{"id":264,"ch":35,"slug":"odd-man-out-and-series","name":"Odd Man Out and Series","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c264-ch35-ex-3.txt"},{"id":269,"ch":37,"slug":"bar-graphs","name":"Bar Graphs (Data Interpretation)","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c269-ch37-ex-0.txt"},{"id":274,"ch":39,"slug":"line-graphs","name":"Line Graphs (Data Interpretation)","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c274-ch39-ex-0.txt"}]

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
