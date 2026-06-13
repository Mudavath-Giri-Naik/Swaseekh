// Decode the base64 application/pdf attachment from line 3 of the transcript
// to scripts/data/volume1.pdf.
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const TRANSCRIPT = 'C:\\Users\\SRINUVASRAO\\.claude\\projects\\e--Swaseekh-main-Swaseekh-main\\1635a6c4-3f49-410f-9ce8-40fa70d49ad9.jsonl'
const OUT = path.join(__dirname, 'data', 'volume1.pdf')

async function main() {
  const rl = readline.createInterface({ input: fs.createReadStream(TRANSCRIPT, { encoding: 'utf8' }), crlfDelay: Infinity })
  let n = 0
  for await (const line of rl) {
    n++
    if (n !== 3) continue
    const obj = JSON.parse(line)
    const content = obj.message.content
    for (const c of content) {
      if (c.type === 'document' && c.source && c.source.type === 'base64') {
        const buf = Buffer.from(c.source.data, 'base64')
        fs.writeFileSync(OUT, buf)
        console.log(`Wrote ${OUT}  (${(buf.length / 1024 / 1024).toFixed(2)} MB), media_type=${c.source.media_type}`)
        return
      }
    }
    break
  }
  console.log('No base64 document found on line 3')
}
main().catch((e) => { console.error(e); process.exit(1) })
