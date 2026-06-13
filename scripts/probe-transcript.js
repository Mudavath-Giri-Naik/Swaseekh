// Probe the transcript structure: for each line, report role, byte size, and the
// content-block types present, so we can locate the attached PDF's content.
const fs = require('fs')
const readline = require('readline')
const TRANSCRIPT = 'C:\\Users\\SRINUVASRAO\\.claude\\projects\\e--Swaseekh-main-Swaseekh-main\\1635a6c4-3f49-410f-9ce8-40fa70d49ad9.jsonl'

function describe(content) {
  if (typeof content === 'string') return [`string(${content.length})`]
  if (!Array.isArray(content)) return [typeof content]
  return content.map((c) => {
    if (typeof c === 'string') return `str(${c.length})`
    if (!c || !c.type) return 'unknown'
    let extra = ''
    if (c.type === 'text') extra = `(${(c.text || '').length})`
    else if (c.type === 'document' || c.type === 'image') {
      const src = c.source || {}
      extra = `[${src.type || '?'}/${src.media_type || '?'} data=${src.data ? src.data.length : 0}]`
    } else if (c.type === 'tool_result') {
      const inner = c.content
      const len = typeof inner === 'string' ? inner.length : Array.isArray(inner) ? inner.reduce((s, x) => s + ((x && x.text) ? x.text.length : 0), 0) : 0
      extra = `(toolres ${len})`
    } else if (c.type === 'tool_use') extra = `(${c.name})`
    return `${c.type}${extra}`
  })
}

async function main() {
  const rl = readline.createInterface({ input: fs.createReadStream(TRANSCRIPT, { encoding: 'utf8' }), crlfDelay: Infinity })
  let n = 0
  for await (const line of rl) {
    n++
    if (!line.trim()) continue
    let obj
    try { obj = JSON.parse(line) } catch { console.log(`${n}: <unparseable ${line.length}B>`); continue }
    const msg = obj.message || obj
    const role = (msg && msg.role) || obj.type || '?'
    const types = describe(msg && msg.content)
    const kb = (Buffer.byteLength(line, 'utf8') / 1024).toFixed(0)
    // only print sizable lines or those with document/image blocks
    const hasDoc = types.some((t) => /document|image/.test(t))
    if (Number(kb) > 50 || hasDoc) console.log(`L${n} [${role}] ${kb}KB :: ${types.join(', ').slice(0, 300)}`)
  }
}
main().catch((e) => { console.error(e); process.exit(1) })
