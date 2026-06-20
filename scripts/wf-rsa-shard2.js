export const meta = {
  name: 'rsa-extract',
  description: 'Extract RS Aggarwal Quantitative Aptitude questions into structured JSON (missing chunks only)',
  phases: [{ title: 'Extract', detail: 'one agent per remaining chunk -> writes JSON file' }],
}

// Only the chunks still missing an output file are embedded here.
const SEL = [{"id":108,"ch":11,"slug":"percentage","name":"Percentage","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c108-ch11-ex-15.txt"},{"id":159,"ch":17,"slug":"time-and-work","name":"Time and Work","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c159-ch17-ex-2.txt"},{"id":180,"ch":20,"slug":"problems-on-trains","name":"Problems on Trains","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c180-ch20-ex-2.txt"},{"id":217,"ch":24,"slug":"area","name":"Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c217-ch24-ex-18.txt"},{"id":229,"ch":25,"slug":"volume-and-surface-area","name":"Volume and Surface Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c229-ch25-ex-9.txt"},{"id":237,"ch":27,"slug":"calendar","name":"Calendar","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c237-ch27-ex-0.txt"},{"id":243,"ch":29,"slug":"stocks-and-shares","name":"Stocks and Shares","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c243-ch29-ex-0.txt"},{"id":249,"ch":30,"slug":"permutations-combinations","name":"Permutations and Combinations","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c249-ch30-ex-2.txt"},{"id":254,"ch":32,"slug":"true-discount","name":"True Discount","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c254-ch32-solved-0.txt"},{"id":258,"ch":33,"slug":"bankers-discount","name":"Banker's Discount","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c258-ch33-ex-0.txt"},{"id":262,"ch":35,"slug":"odd-man-out-and-series","name":"Odd Man Out and Series","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c262-ch35-ex-1.txt"},{"id":266,"ch":36,"slug":"tabulation","name":"Tabulation (Data Interpretation)","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c266-ch36-solved-0.txt"},{"id":270,"ch":37,"slug":"bar-graphs","name":"Bar Graphs (Data Interpretation)","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c270-ch37-ex-1.txt"},{"id":274,"ch":39,"slug":"line-graphs","name":"Line Graphs (Data Interpretation)","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c274-ch39-ex-0.txt"}]

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
