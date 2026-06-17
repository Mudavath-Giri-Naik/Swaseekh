const { connect, mongoose } = require('./db')

// Try to split embedded options "A. ... B. ... C. ... D. ..." from question text.
function parseOptions(text) {
  if (!text) return null
  // Find option markers at line start: A. / A) / (A) / A : etc. for A-F
  const lines = text.split(/\r?\n/)
  const opts = []
  let started = false
  let stemLines = []
  const re = /^\s*\(?([A-Fa-f])[\.\)\:]\s+(.*)$/
  for (const ln of lines) {
    const m = ln.match(re)
    if (m) { opts.push({ key: m[1].toUpperCase(), text: m[2].trim() }); started = true }
    else if (started && opts.length && ln.trim()) {
      // continuation of previous option
      opts[opts.length-1].text += ' ' + ln.trim()
    } else if (!started) {
      stemLines.push(ln)
    }
  }
  // Validate: keys should be a contiguous run starting at A, length 2-6
  const keys = opts.map(o=>o.key)
  const expected = ['A','B','C','D','E','F'].slice(0, opts.length)
  const valid = opts.length >= 2 && opts.length <= 6 && keys.join('') === expected.join('')
  return { opts, valid, stem: stemLines.join('\n').trim(), count: opts.length }
}

function mapAnswer(answer, opts) {
  if (!answer) return { keys: [], method: 'empty' }
  const a = answer.trim()
  // multi: "A, B" or "B, C"
  const letterList = a.match(/\b([A-F])\b/gi)
  // If answer begins with letter+punct: "A. 2"
  const lead = a.match(/^\(?([A-F])[\.\)\:]?\b/i)
  if (lead) {
    // could still be multi
    const multi = a.match(/^([A-F])\s*,\s*([A-F])/i)
    if (multi) return { keys: [...new Set(a.split(/[,\s]+/).filter(x=>/^[A-F]$/i.test(x)).map(x=>x.toUpperCase()))], method: 'multi-letter' }
    return { keys: [lead[1].toUpperCase()], method: 'lead-letter' }
  }
  // match by option text value
  for (const o of opts) {
    if (o.text && a.toLowerCase() === o.text.toLowerCase()) return { keys: [o.key], method: 'value-match' }
  }
  return { keys: [], method: 'unmapped' }
}

async function main() {
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')
  const cur = Q.find({ 'meta.type': { $in: ['MCQ','MSQ'] } }, { projection: { id:1, 'meta.type':1, 'meta.year':1, question:1, answer:1 } })
  let total=0, parsed=0, invalid=0, ansOk=0, ansBad=0
  const failures = []
  const ansFail = []
  for await (const d of cur) {
    total++
    const p = parseOptions(d.question)
    if (p && p.valid) {
      parsed++
      const m = mapAnswer(d.answer, p.opts)
      if (m.keys.length) ansOk++; else { ansBad++; if (ansFail.length<15) ansFail.push({id:d.id, type:d.meta.type, answer:d.answer, opts:p.opts.map(o=>o.key+':'+o.text.slice(0,20)) }) }
    } else {
      invalid++
      if (failures.length<15) failures.push({ id:d.id, type:d.meta?.type, year:d.meta?.year, count:p?.count, q:(d.question||'').slice(0,200), answer:d.answer })
    }
  }
  console.log(`MCQ/MSQ total: ${total}`)
  console.log(`options parsed OK (valid A..N run): ${parsed}`)
  console.log(`options FAILED to parse cleanly: ${invalid}`)
  console.log(`of parsed, answer mapped to key(s): ${ansOk}`)
  console.log(`of parsed, answer NOT mapped: ${ansBad}`)
  console.log('\n=== sample OPTION-PARSE failures ===')
  failures.forEach(f=>console.log(JSON.stringify(f).slice(0,500)))
  console.log('\n=== sample ANSWER-MAP failures ===')
  ansFail.forEach(f=>console.log(JSON.stringify(f).slice(0,400)))
  await mongoose.disconnect()
}
main().catch(e=>{console.error(e.message);process.exit(1)})
