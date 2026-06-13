// Reconcile authored auto-v2 questions against the official answer keys parsed
// from the PDF (index-v2.json answer_key). For each page file we map authored
// questions -> qids by position (agents authored in qid order), embed the qid,
// and compare the authored answer's leading token to the official key.
// Outputs:
//   - rewrites each auto-v2 file with q.qid + q.answer_official embedded
//   - scripts/data/v2-mismatches.json  (pages needing a correction pass)
//   - scripts/data/v2-countmismatch.json (pages where #authored != #qids)
//   node scripts/reconcile-v2.js          (rewrite + report)
//   node scripts/reconcile-v2.js --report  (report only, no rewrite)
const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, 'data')
const AUTO = path.join(DATA, 'auto-v2')
const TASKS = path.join(DATA, 'tasks-v2')
const REPORT_ONLY = process.argv.includes('--report')

const idx = JSON.parse(fs.readFileSync(path.join(DATA, 'index-v2.json'), 'utf8'))
const byQid = {}
for (const it of idx) byQid[it.qid] = it

const pad = (n) => String(n).padStart(4, '0')

// leading answer token: MCQ letter, MSQ letters, or NAT number
function authoredToken(ans, type) {
  const s = String(ans || '').trim()
  if (type === 'MCQ') { const m = s.match(/^\(?([A-D])\b/i); return m ? m[1].toUpperCase() : null }
  if (type === 'MSQ') {
    const letters = (s.match(/\b[A-D]\b/gi) || []).map(x => x.toUpperCase())
    return letters.length ? [...new Set(letters)].sort().join(',') : null
  }
  // NAT: first number (int or decimal, optional range)
  const m = s.match(/-?\d+(?:\.\d+)?/); return m ? m[0] : null
}
function officialToken(ans, type) {
  const s = String(ans || '').trim()
  if (s === 'N/A' || s === 'X' || s === '') return null
  if (type === 'MSQ' || /;/.test(s)) return s.replace(/;/g, ',').split(',').map(x => x.trim().toUpperCase()).sort().join(',')
  if (/^[A-D]$/i.test(s)) return s.toUpperCase()
  const m = s.match(/-?\d+(?:\.\d+)?/); return m ? m[0] : s
}
function natClose(a, b) {
  const x = parseFloat(a), y = parseFloat(b)
  if (Number.isNaN(x) || Number.isNaN(y)) return false
  return Math.abs(x - y) < 1e-6 || (Math.abs(x - y) / (Math.abs(y) || 1) < 0.001)
}

function main() {
  const files = fs.readdirSync(AUTO).filter(f => /^page-\d+\.json$/.test(f)).sort()
  let totalQ = 0, verifiable = 0, matched = 0, mismatched = 0, countMismatch = 0, unverifiable = 0
  const mismatches = []
  const countMismatchPages = []

  for (const f of files) {
    const page = parseInt(f.match(/\d+/)[0], 10)
    let obj; try { obj = JSON.parse(fs.readFileSync(path.join(AUTO, f), 'utf8')) } catch { continue }
    const qs = obj.questions || []
    const taskFile = path.join(TASKS, `page-${pad(page)}.json`)
    if (!fs.existsSync(taskFile)) continue
    const task = JSON.parse(fs.readFileSync(taskFile, 'utf8'))
    const qids = (task.qids || []).map(q => q.qid)

    if (qs.length !== qids.length) {
      countMismatch++
      countMismatchPages.push({ page, authored: qs.length, expected: qids.length, qids })
      // still embed what we can by position up to min length
    }
    const n = Math.min(qs.length, qids.length)
    for (let i = 0; i < n; i++) {
      const q = qs[i], qid = qids[i]
      q.qid = qid
      const info = byQid[qid]
      const official = info && info.answer_key
      q.answer_official = official || ''
      totalQ++
      const type = q.meta && q.meta.type
      const at = authoredToken(q.answer, type)
      const ot = officialToken(official, type)
      // Verifiable only when BOTH the authored answer and the official key yield a
      // concrete token. N/A / X / descriptive / missing-key cases are unverifiable.
      if (at === null || ot === null) { unverifiable++; continue }
      verifiable++
      let ok = (type === 'NAT') ? (natClose(at, ot) || at === ot) : at === ot
      if (ok) matched++
      else {
        mismatched++
        mismatches.push({ page, qid, type, authored: String(q.answer).slice(0, 60), authoredToken: at, official, officialToken: ot })
      }
    }
    if (!REPORT_ONLY) fs.writeFileSync(path.join(AUTO, f), JSON.stringify(obj, null, 1))
  }

  // group mismatch pages for a correction workflow
  const mismatchPages = [...new Set(mismatches.map(m => m.page))].sort((a, b) => a - b)
  if (!REPORT_ONLY) {
    fs.writeFileSync(path.join(DATA, 'v2-mismatches.json'), JSON.stringify({ mismatchPages, mismatches }, null, 1))
    fs.writeFileSync(path.join(DATA, 'v2-countmismatch.json'), JSON.stringify(countMismatchPages, null, 1))
  }

  console.log(`Pages: ${files.length} | authored Qs: ${totalQ}`)
  console.log(`Verifiable (both tokens concrete): ${verifiable} | matched: ${matched} | MISMATCH: ${mismatched} | unverifiable (N/A/X/no-key/descriptive): ${unverifiable}`)
  console.log(`Answer-accuracy on verifiable: ${verifiable ? (100 * matched / verifiable).toFixed(1) : 0}%`)
  console.log(`Count-mismatch pages (#authored != #qids): ${countMismatch}`)
  console.log(`Pages needing correction (have >=1 verifiable mismatch): ${mismatchPages.length}`)
  console.log('First 25 mismatches:')
  mismatches.slice(0, 25).forEach(m => console.log(`  p${m.page} ${m.qid} [${m.type}] authored="${m.authoredToken}" official="${m.officialToken}"`))
}
main()
