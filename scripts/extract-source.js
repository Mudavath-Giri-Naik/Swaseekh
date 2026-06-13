// Extract the original user message(s) (which contain the pasted PDF question bank)
// from the session transcript, writing the prose to scripts/data/source-pdf.txt.
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const TRANSCRIPT = 'C:\\Users\\SRINUVASRAO\\.claude\\projects\\e--Swaseekh-main-Swaseekh-main\\1635a6c4-3f49-410f-9ce8-40fa70d49ad9.jsonl'
const OUT = path.join(__dirname, 'data', 'source-pdf.txt')

function textFromContent(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map((c) => (typeof c === 'string' ? c : c && c.type === 'text' ? c.text : '')).join('\n')
  }
  return ''
}

async function main() {
  const rl = readline.createInterface({ input: fs.createReadStream(TRANSCRIPT, { encoding: 'utf8' }), crlfDelay: Infinity })
  const chunks = []
  let lineNo = 0
  for await (const line of rl) {
    lineNo++
    if (!line.trim()) continue
    let obj
    try { obj = JSON.parse(line) } catch { continue }
    const msg = obj.message || obj
    const role = msg && msg.role
    if (role !== 'user') continue
    // skip tool_result-only user turns and system reminders
    const txt = textFromContent(msg.content)
    if (!txt) continue
    // We want the big initial paste — keep any user text over 2000 chars.
    if (txt.length > 2000) {
      chunks.push(`\n\n========== USER MESSAGE @ line ${lineNo} (len ${txt.length}) ==========\n\n` + txt)
    }
  }
  fs.writeFileSync(OUT, chunks.join('\n'))
  const stat = fs.statSync(OUT)
  console.log(`Wrote ${OUT}  (${(stat.size / 1024).toFixed(1)} KB, ${chunks.length} large user message(s))`)
}

main().catch((e) => { console.error(e); process.exit(1) })
