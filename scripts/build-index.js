// Build the master question index + workflow task lists from the pdftotext layer.
// A question-header line starts with "<ch>.<sec>.<q>" and contains "GATE" (the source).
// Subtopic is taken from the section header "<ch>.<sec>  <Subtopic> (count)".
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const DATA = path.join(__dirname, 'data')
const PDF = path.join(DATA, 'volume1.pdf')

const CHAP = {
  1: { subject: 'Discrete Mathematics', topic: 'Combinatorics' },
  2: { subject: 'Discrete Mathematics', topic: 'Graph Theory' },
  3: { subject: 'Discrete Mathematics', topic: 'Mathematical Logic' },
  4: { subject: 'Discrete Mathematics', topic: 'Set Theory & Algebra' },
  5: { subject: 'Engineering Mathematics', topic: 'Calculus' },
  6: { subject: 'Engineering Mathematics', topic: 'Linear Algebra' },
  7: { subject: 'Engineering Mathematics', topic: 'Probability' },
  8: { subject: 'General Aptitude', topic: 'Analytical Aptitude' },
  9: { subject: 'General Aptitude', topic: 'Quantitative Aptitude' },
  10: { subject: 'General Aptitude', topic: 'Spatial Aptitude' },
  11: { subject: 'General Aptitude', topic: 'Verbal Aptitude' },
}
const SUBTOPIC_FIX = {
  'Combinatory': 'Combinatorics',
  'Countable Uncountable Set': 'Countable/Uncountable Set',
}
// Fallback subtopic per topic (for section .0 / untitled groups). Must be an approved name.
const FALLBACK_SUB = {
  'Combinatorics': 'Combinatorics', 'Graph Theory': 'Counting', 'Mathematical Logic': 'Logical Reasoning',
  'Set Theory & Algebra': 'Set Theory', 'Calculus': 'Limits', 'Linear Algebra': 'Matrix',
  'Probability': 'Probability', 'Analytical Aptitude': 'Logical Reasoning',
  'Quantitative Aptitude': 'Numerical Computation', 'Spatial Aptitude': 'Patterns in Two Dimensions',
  'Verbal Aptitude': 'Verbal Reasoning',
}
// Answer-key page ranges per chapter.
const KEY_PAGES = {
  1: [14], 2: [30], 3: [47], 4: [79, 80], 5: [92], 6: [114, 115], 7: [136, 137],
  8: [170, 171], 9: [279, 280, 281], 10: [300], 11: [371, 372, 373],
}

function inferType(tags) {
  const t = tags.toLowerCase()
  if (t.includes('multiple-selects')) return 'MSQ'
  if (t.includes('numerical-answers')) return 'NAT'
  if (t.includes('descriptive') || t.includes('proof') || t.includes('fill-in')) return 'NAT'
  return 'MCQ'
}
function inferMarks(tags) { const t = tags.toLowerCase(); if (t.includes('two-marks')) return 2; if (t.includes('one-mark')) return 1; return 2 }
function inferDiff(tags) { const t = tags.toLowerCase(); if (t.includes('easy')) return 'easy'; if (t.includes('hard') || t.includes('difficult')) return 'hard'; return 'medium' }
function yearFrom(s) { const m = s.match(/(19|20)\d{2}/); return m ? parseInt(m[0], 10) : null }

const qidRe = /^\s*(\d{1,2})\.(\d{1,3})\.(\d{1,3})\b(.*)$/
const secRe = /^\s*(\d{1,2})\.(\d{1,3})\s+([A-Za-z][A-Za-z0-9 &/'\-]+?)\s*\((\d+)\)\s*$/
const tagLineRe = /(one-mark|two-marks|numerical-answers|multiple-selects|descriptive|proof|normal|easy|difficult|^gate|^gatecse|^gateit)/i

function main() {
  const txt = execSync(`pdftotext -layout "${PDF}" -`, { maxBuffer: 1 << 30 }).toString()
  const pages = txt.split('\f')
  const sectionSub = {} // "ch.sec" -> subtopic
  // first pass: section headers (TOC + body; body overrides but identical)
  for (const pg of pages) for (const line of pg.split(/\r?\n/)) {
    const m = line.match(secRe)
    if (m) { let s = m[3].trim().replace(/\s+/g, ' '); sectionSub[`${m[1]}.${m[2]}`] = SUBTOPIC_FIX[s] || s }
  }

  const items = []
  for (let p = 0; p < pages.length; p++) {
    const pageNum = p + 1
    if (pageNum <= 5) continue // skip TOC/front matter
    const lines = pages[p].split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(qidRe)
      if (!m) continue
      const rest = m[4] || ''
      if (!/GATE/i.test(rest)) continue // header lines carry the GATE source; answer-key lines do not
      if (secRe.test(lines[i])) continue
      const chN = parseInt(m[1], 10)
      if (!CHAP[chN]) continue
      const sec = parseInt(m[2], 10)
      const qid = `${m[1]}.${m[2]}.${m[3]}`
      // subtopic: from the source there may be "Subtopic: GATE...". Prefer section map.
      let subtopic = sectionSub[`${m[1]}.${m[2]}`]
      if (!subtopic) {
        const sm = rest.match(/^\s*(.+?):\s*GATE/i)
        if (sm) { let s = sm[1].trim().replace(/\s+/g, ' '); subtopic = SUBTOPIC_FIX[s] || s }
      }
      if (!subtopic) subtopic = FALLBACK_SUB[CHAP[chN].topic]
      // source = from "GATE" to end (or to "| Question"/": GA")
      const srcM = rest.match(/GATE.*$/i)
      const source = srcM ? srcM[0].replace(/\s*\|\s*(GA\s+)?Question:.*$/i, '').replace(/:\s*GA-?.*$/i, '').trim() : 'GATE'
      // prose + tags from following lines
      let prose = [], tags = ''
      for (let j = i + 1; j < lines.length && j < i + 16; j++) {
        const L = lines[j].trim()
        if (!L) continue
        if (qidRe.test(lines[j]) && /GATE/i.test(lines[j])) break
        if (tagLineRe.test(L)) { tags = L; break }
        prose.push(L)
      }
      items.push({
        qid, chapter: chN, section: sec,
        subject: CHAP[chN].subject, topic: CHAP[chN].topic, subtopic,
        source, year: yearFrom(rest), type: inferType(tags), marks: inferMarks(tags), difficulty: inferDiff(tags),
        page: pageNum, prose: prose.join(' ').replace(/\s+/g, ' ').slice(0, 300),
      })
    }
  }

  // de-dup any accidental double-captured qids (keep first)
  const seen = new Set(); const uniq = []
  for (const it of items) { if (seen.has(it.qid)) continue; seen.add(it.qid); uniq.push(it) }

  fs.writeFileSync(path.join(DATA, 'index.json'), JSON.stringify(uniq))
  // Already-inserted work to exclude from authoring tasks:
  //   - all of Chapter 1 (50/50 verified: 36 pre-existing + 14 authored)
  //   - the 7 Chapter-2 questions already inserted
  const DONE = new Set(['2.1.1', '2.1.2', '2.1.3', '2.2.1', '2.2.2', '2.2.3', '2.2.4'])
  const skip = (it) => it.chapter === 1 || DONE.has(it.qid)
  // group into page tasks (excluding done)
  const byPage = {}
  for (const it of uniq) { if (skip(it)) continue; (byPage[it.page] = byPage[it.page] || []).push(it.qid) }
  const tasks = Object.keys(byPage).map(Number).sort((a, b) => a - b).map((page) => ({
    page, chapter: uniq.find((x) => x.page === page).chapter, qids: byPage[page],
  }))
  fs.writeFileSync(path.join(DATA, 'tasks.json'), JSON.stringify(tasks))
  // key tasks
  const keytasks = Object.keys(KEY_PAGES).map((c) => ({ chapter: Number(c), pages: KEY_PAGES[c] }))
  fs.writeFileSync(path.join(DATA, 'keytasks.json'), JSON.stringify(keytasks))

  const byChap = {}; for (const it of uniq) byChap[it.chapter] = (byChap[it.chapter] || 0) + 1
  console.log(`Indexed ${uniq.length} questions; ${tasks.length} page-tasks; ${keytasks.length} key-tasks`)
  const exp = { 1: 50, 2: 83, 3: 77, 4: 171, 5: 63, 6: 102, 7: 107, 8: 139, 9: 494, 10: 49, 11: 376 }
  for (let c = 1; c <= 11; c++) console.log(`  Ch${c}: ${byChap[c] || 0} / ${exp[c]} ${(byChap[c] || 0) === exp[c] ? 'OK' : 'diff ' + ((byChap[c] || 0) - exp[c])}`)
}
main()
