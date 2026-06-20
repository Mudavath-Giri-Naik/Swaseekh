export const meta = {
  name: 'rsa-extract',
  description: 'Extract RS Aggarwal Quantitative Aptitude questions into structured JSON (missing chunks only)',
  phases: [{ title: 'Extract', detail: 'one agent per remaining chunk -> writes JSON file' }],
}

// Only the chunks still missing an output file are embedded here.
const SEL = [{"id":276,"ch":1,"slug":"number-system","name":"Number System","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c276-ch01-solved-0.txt"},{"id":277,"ch":1,"slug":"number-system","name":"Number System","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c277-ch01-solved-1.txt"},{"id":278,"ch":1,"slug":"number-system","name":"Number System","type":"solved","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c278-ch01-solved-2.txt"},{"id":279,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c279-ch01-ex-0.txt"},{"id":280,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c280-ch01-ex-1.txt"},{"id":281,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c281-ch01-ex-2.txt"},{"id":282,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c282-ch01-ex-3.txt"},{"id":283,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c283-ch01-ex-4.txt"},{"id":284,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c284-ch01-ex-5.txt"},{"id":285,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c285-ch01-ex-6.txt"},{"id":286,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c286-ch01-ex-7.txt"},{"id":287,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c287-ch01-ex-8.txt"},{"id":288,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c288-ch01-ex-9.txt"},{"id":289,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c289-ch01-ex-10.txt"},{"id":290,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c290-ch01-ex-11.txt"},{"id":291,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c291-ch01-ex-12.txt"},{"id":292,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c292-ch01-ex-13.txt"},{"id":293,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c293-ch01-ex-14.txt"},{"id":294,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c294-ch01-ex-15.txt"},{"id":295,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c295-ch01-ex-16.txt"},{"id":296,"ch":1,"slug":"number-system","name":"Number System","type":"exercise","file":"e:/Swaseekh-main/Swaseekh-main/scripts/data/rsa/chunks/c296-ch01-ex-17.txt"}]

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
