// Deterministic option parser for the mock-tests build.
//
// The GATE questions in the DB carry their MCQ/MSQ options *embedded* inside
// the `question` text (e.g. "A. 2\nB. 3\n..."), and `answer` holds the correct
// choice(s) as text ("A. 2", "A, C", numeric for NAT). This script structures
// those into options[] / correctOptions[] / stem WITHOUT mutating question/answer.
//
// Output:
//   scripts/data/mock/auto.json            high-confidence proposals
//   scripts/data/mock/review/shard-NN.json shards of low-confidence items for agents
//   scripts/data/mock/stats.json           summary
//
// Re-runnable; pure read of DB.

const fs = require('fs')
const path = require('path')
const { connect, mongoose } = require('../db')

const OUT_DIR = path.join(__dirname, '..', 'data', 'mock')
const REVIEW_DIR = path.join(OUT_DIR, 'review')

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/**
 * Marker-progression scan: find option markers A,B,C,... in order, where each
 * marker can be "A." / "A)" / "(A)" / "A:" preceded by start-of-string or
 * whitespace. Works for same-line ("A. 3  B. 1"), multi-line, and
 * options-after-a-block layouts uniformly. Returns null if no A,B run found.
 */
function extractOptions(text, { lower = false } = {}) {
  if (!text) return null
  const positions = []
  let searchFrom = 0
  for (const K of KEYS) {
    const k = lower ? K.toLowerCase() : K
    // (start|whitespace) ( optional "(" ) KEY ( . ) ) : ) followed by space/newline
    const re = new RegExp(`(^|[\\s])\\(?${k}[\\.\\)\\:]\\s`, 'g')
    re.lastIndex = searchFrom
    const m = re.exec(text)
    if (!m) break
    const markerStart = m.index + m[1].length
    positions.push({ key: K, markerStart, contentStart: re.lastIndex })
    searchFrom = re.lastIndex
  }
  if (positions.length < 2) return null
  const opts = []
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i]
    const end = i + 1 < positions.length ? positions[i + 1].markerStart : text.length
    let val = text.slice(p.contentStart, end).trim()
    // collapse internal newlines/extra spaces inside an option to single spaces,
    // but keep latex blocks intact (they don't use raw newlines meaningfully here)
    val = val.replace(/\s*\n\s*/g, ' ').replace(/[ \t]{2,}/g, ' ').trim()
    opts.push({ key: p.key, text: val })
  }
  const stem = text.slice(0, positions[0].markerStart).trim()
  return { opts, stem }
}

function parseOptions(text) {
  // Prefer uppercase markers; fall back to lowercase only if uppercase fails.
  let r = extractOptions(text, { lower: false })
  if (!r) r = extractOptions(text, { lower: true })
  return r
}

/** Map the free-text answer to option key(s). */
function mapAnswer(answer, opts) {
  if (!answer) return { keys: [], method: 'empty', excluded: false }
  const a = answer.trim()
  // Excluded / bonus questions in official keys are marked "X"
  const excluded = /^x[\.\)\s]/i.test(a) || /excluded|marked as bonus|bonus in the official/i.test(a)

  // Multi-letter answer like "A, C" or "A and C" or "B, C, D"
  const upperTokens = a.match(/\b([A-H])\b/g) || []
  const leadMulti = a.match(/^\(?([A-H])[\.\)\:,\s]+\(?([A-H])\b/)
  if (leadMulti) {
    const keys = [...new Set((a.match(/^[\sA-H,()\.and ]+/i)?.[0] || a)
      .split(/[^A-H]+/).filter((x) => /^[A-H]$/.test(x)))]
    if (keys.length >= 2) return { keys, method: 'multi-letter', excluded }
  }
  // Leading single letter: "A. 2", "C. P = Q", "(B)"
  const lead = a.match(/^\(?([A-H])[\.\)\:]/)
  if (lead) return { keys: [lead[1]], method: 'lead-letter', excluded }
  // Bare single letter
  if (/^\(?[A-H]\)?$/.test(a)) return { keys: [a.replace(/[()]/g, '')], method: 'bare-letter', excluded }
  // Exact value match against an option's text
  if (opts) {
    for (const o of opts) {
      if (o.text && a.toLowerCase() === o.text.toLowerCase()) return { keys: [o.key], method: 'value-match', excluded }
    }
    // startsWith value match (answer = option text + extra)
    for (const o of opts) {
      if (o.text && o.text.length > 3 && a.toLowerCase().startsWith(o.text.toLowerCase())) {
        return { keys: [o.key], method: 'value-prefix', excluded }
      }
    }
  }
  return { keys: [], method: 'unmapped', excluded }
}

function looksNumeric(s) {
  if (!s) return false
  const t = s.trim()
  // pure number, range "12 to 14", fraction "4/11", with units stripped
  return /^[-+]?\.?\d/.test(t) && t.length <= 24 && /^[-+0-9.,/ to–-]+$/i.test(t)
}

async function main() {
  fs.mkdirSync(REVIEW_DIR, { recursive: true })
  await connect()
  const db = mongoose.connection.db
  const Q = db.collection('questions')

  const docs = await Q.find(
    {},
    { projection: { id: 1, _id: 1, 'meta.type': 1, 'meta.year': 1, 'meta.subject': 1, 'meta.marks': 1, question: 1, answer: 1 } }
  ).toArray()

  const auto = []
  const review = []
  const stats = { total: docs.length, nat: 0, choice: 0, autoOk: 0, review: 0, excluded: 0, natFromMcq: 0, optCountDist: {} }

  for (const d of docs) {
    const type = d.meta?.type || 'MCQ'
    const isChoiceType = type === 'MCQ' || type === 'MSQ'

    if (!isChoiceType) {
      // NAT (or other): no options, numeric/text answer kept as-is.
      stats.nat++
      auto.push({ id: d.id, isNat: true, options: [], correctOptions: [], stem: (d.question || '').trim(), excluded: false })
      continue
    }

    stats.choice++
    const parsed = parseOptions(d.question)

    if (!parsed || parsed.opts.length < 2) {
      // No options found. If answer is numeric, it's a NAT mislabeled as MCQ.
      if (looksNumeric(d.answer)) {
        stats.natFromMcq++
        auto.push({ id: d.id, isNat: true, options: [], correctOptions: [], stem: (d.question || '').trim(), excluded: false, note: 'NAT mislabeled as choice (no options, numeric answer)' })
        continue
      }
      // Otherwise needs human/agent review (subjective, descriptive, table-only, etc.)
      review.push(reviewRec(d, parsed, 'no-options-parsed'))
      continue
    }

    const optCount = parsed.opts.length
    stats.optCountDist[optCount] = (stats.optCountDist[optCount] || 0) + 1
    const m = mapAnswer(d.answer, parsed.opts)

    // Sanity flags that demand review
    const longOpt = parsed.opts.some((o) => o.text.length > 280)
    const emptyOpt = parsed.opts.some((o) => !o.text)
    const emptyStem = !parsed.stem
    const tooFew = optCount < 4 // GATE MCQ/MSQ are almost always 4; fewer => suspect parse
    const badAnswer = m.keys.length === 0
    const msqSingle = type === 'MSQ' && m.keys.length < 1

    if (m.excluded) stats.excluded++

    if (badAnswer || longOpt || emptyOpt || emptyStem || tooFew || msqSingle) {
      review.push(reviewRec(d, parsed, [
        badAnswer && 'answer-unmapped',
        longOpt && 'long-option',
        emptyOpt && 'empty-option',
        emptyStem && 'empty-stem',
        tooFew && `only-${optCount}-options`,
      ].filter(Boolean).join(','), m))
      continue
    }

    stats.autoOk++
    auto.push({
      id: d.id,
      isNat: false,
      options: parsed.opts,
      correctOptions: m.keys,
      stem: parsed.stem,
      excluded: m.excluded,
    })
  }

  stats.review = review.length

  // Write auto proposals
  fs.writeFileSync(path.join(OUT_DIR, 'auto.json'), JSON.stringify(auto))
  // Shard review items (~14 per shard) for the agent swarm
  const SHARD = 14
  // clear old shards
  for (const f of fs.existsSync(REVIEW_DIR) ? fs.readdirSync(REVIEW_DIR) : []) {
    if (/^shard-\d+\.json$/.test(f)) fs.unlinkSync(path.join(REVIEW_DIR, f))
  }
  let shardCount = 0
  for (let i = 0; i < review.length; i += SHARD) {
    const slice = review.slice(i, i + SHARD)
    const n = String(shardCount).padStart(2, '0')
    fs.writeFileSync(path.join(REVIEW_DIR, `shard-${n}.json`), JSON.stringify(slice, null, 2))
    shardCount++
  }
  stats.shardCount = shardCount
  stats.shardSize = SHARD
  fs.writeFileSync(path.join(OUT_DIR, 'stats.json'), JSON.stringify(stats, null, 2))

  console.log(JSON.stringify(stats, null, 2))
  console.log(`\nWrote auto.json (${auto.length}), ${shardCount} review shards in ${REVIEW_DIR}`)
  await mongoose.disconnect()
}

function reviewRec(d, parsed, reason, m) {
  return {
    id: d.id,
    type: d.meta?.type,
    year: d.meta?.year,
    subject: d.meta?.subject,
    marks: d.meta?.marks,
    reason,
    question: d.question,
    answer: d.answer,
    parserGuess: parsed ? { stem: parsed.stem, options: parsed.opts, correctOptions: m?.keys || [] } : null,
  }
}

main().catch((e) => { console.error('PARSE ERROR:', e); process.exit(1) })
