export const meta = {
  name: 'rsa-extract',
  description: 'Extract RS Aggarwal Quantitative Aptitude questions into structured JSON (missing chunks only)',
  phases: [{ title: 'Extract', detail: 'one agent per remaining chunk -> writes JSON file' }],
}

// Only the chunks still missing an output file are embedded here.
const SEL = [{"id":89,"ch":10,"slug":"logarithms","name":"Logarithms","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c089-ch10-ex-3.txt"},{"id":154,"ch":16,"slug":"pipes-and-cisterns","name":"Pipes and Cisterns","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c154-ch16-ex-1.txt"},{"id":172,"ch":18,"slug":"time-and-distance","name":"Time and Distance","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c172-ch18-ex-7.txt"},{"id":213,"ch":24,"slug":"area","name":"Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c213-ch24-ex-14.txt"},{"id":228,"ch":25,"slug":"volume-and-surface-area","name":"Volume and Surface Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c228-ch25-ex-8.txt"},{"id":234,"ch":25,"slug":"volume-and-surface-area","name":"Volume and Surface Area","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c234-ch25-ex-14.txt"},{"id":242,"ch":29,"slug":"stocks-and-shares","name":"Stocks and Shares","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c242-ch29-solved-0.txt"},{"id":248,"ch":30,"slug":"permutations-combinations","name":"Permutations and Combinations","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c248-ch30-ex-1.txt"},{"id":253,"ch":31,"slug":"probability","name":"Probability","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c253-ch31-ex-2.txt"},{"id":257,"ch":33,"slug":"bankers-discount","name":"Banker's Discount","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c257-ch33-solved-0.txt"},{"id":261,"ch":35,"slug":"odd-man-out-and-series","name":"Odd Man Out and Series","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c261-ch35-ex-0.txt"},{"id":265,"ch":35,"slug":"odd-man-out-and-series","name":"Odd Man Out and Series","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c265-ch35-ex-4.txt"},{"id":269,"ch":37,"slug":"bar-graphs","name":"Bar Graphs (Data Interpretation)","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c269-ch37-ex-0.txt"},{"id":273,"ch":38,"slug":"pie-chart","name":"Pie Chart (Data Interpretation)","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c273-ch38-ex-1.txt"}]

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
