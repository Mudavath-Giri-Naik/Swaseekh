// Build the volume2 question index + answer map + page-task list.
// Volume2 = core CS subjects (Algorithms, COA, Compiler, Networks, DBMS,
// Digital Logic, OS, Data Structures, Programming in C, Theory of Computation).
// Mirrors build-index.js but with volume2's chapter map and an answer-key parser.
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const DATA = path.join(__dirname, 'data')
const PDF = path.join(DATA, 'volume2.pdf')

// subject per chapter (matches the 226 already-authored auto-v2 files).
// topic and subtopic are both set to the section name (e.g. "Cache Memory").
const CHAP_SUBJECT = {
  1: 'Algorithms',
  2: 'Computer Organization & Architecture',
  3: 'Compiler Design',
  4: 'Computer Networks',
  5: 'Databases',
  6: 'Digital Logic',
  7: 'Operating System',
  8: 'Data Structures',
  9: 'Programming in C',
  10: 'Theory of Computation',
}
// Expected per-chapter totals (from the volume2 table of contents).
const EXPECTED = { 1: 334, 2: 238, 3: 234, 4: 215, 5: 284, 6: 303, 7: 335, 8: 236, 9: 127, 10: 286 }
// Chapter body start pages (1-based) and answer-key start pages (from TOC).
const CHAP_START = { 1: 7, 2: 93, 3: 156, 4: 221, 5: 273, 6: 360, 7: 433, 8: 524, 9: 581, 10: 625 }
const KEY_START = { 1: 90, 2: 153, 3: 218, 4: 271, 5: 358, 6: 431, 7: 521, 8: 579, 9: 624, 10: 694 }

function inferType(tags, ans) {
  const t = (tags || '').toLowerCase()
  if (t.includes('multiple-selects')) return 'MSQ'
  if (t.includes('numerical-answers')) return 'NAT'
  if (ans) {
    if (/;/.test(ans)) return 'MSQ'
    if (/^[A-Z]$/.test(ans)) return 'MCQ'
    if (/^\d/.test(ans) || /:/.test(ans) || / to /.test(ans)) return 'NAT'
  }
  if (t.includes('descriptive') || t.includes('proof') || t.includes('fill-in')) return 'NAT'
  return 'MCQ'
}
function inferMarks(tags) { const t = (tags || '').toLowerCase(); if (t.includes('two-marks')) return 2; if (t.includes('one-mark')) return 1; return 2 }
function inferDiff(tags) { const t = (tags || '').toLowerCase(); if (t.includes('easy')) return 'easy'; if (t.includes('hard') || t.includes('difficult')) return 'hard'; return 'medium' }
function yearFrom(s) { const m = String(s).match(/(19|20)\d{2}/); return m ? parseInt(m[0], 10) : null }

const qidRe = /^\s*(\d{1,2})\.(\d{1,3})\.(\d{1,3})\b(.*)$/
const secRe = /^\s*(\d{1,2})\.(\d{1,3})\s+([A-Za-z][A-Za-z0-9 &/'\-]+?)\s*\((\d+)\)\s*$/
const tagLineRe = /(one-mark|two-marks|numerical-answers|multiple-selects|descriptive|proof|normal|easy|difficult|^gate|^gatecse|^gateit)/i
const ansPairRe = /(\d{1,2}\.\d{1,3}\.\d{1,3})\s+(N\/A|X|[A-Z](?:;[A-Z])*|\d+(?:\s*:\s*\d+)?|\d*\.\d+)(?=\s|$)/g

function main() {
  const txt = execSync(`pdftotext -layout "${PDF}" -`, { maxBuffer: 1 << 30 }).toString()
  const pages = txt.split('\f')

  // ── Section subtopic map ────────────────────────────────────────────────
  const sectionSub = {}
  for (const pg of pages) for (const line of pg.split(/\r?\n/)) {
    const m = line.match(secRe)
    if (m) { sectionSub[`${m[1]}.${m[2]}`] = m[3].trim().replace(/\s+/g, ' ') }
  }

  // ── Answer-key map: scan each chapter's answer-key page range ───────────
  const ansMap = {}
  for (let c = 1; c <= 10; c++) {
    const lo = KEY_START[c]
    const hi = CHAP_START[c + 1] ? CHAP_START[c + 1] - 1 : pages.length
    for (let p = lo; p <= hi; p++) {
      const pg = pages[p - 1]; if (!pg) continue
      const idx = pg.search(/Answer Keys/)
      const blob = idx >= 0 ? pg.slice(idx) : pg
      let m; ansPairRe.lastIndex = 0
      while ((m = ansPairRe.exec(blob))) {
        const qid = m[1]; let a = m[2].replace(/\s*:\s*/, ':').trim()
        if (/^(\d+):(\d+)$/.test(a)) { const [x, y] = a.split(':'); a = x === y ? x : `${x} to ${y}` }
        if (!ansMap[qid]) ansMap[qid] = a
      }
    }
  }

  // ── Question headers ────────────────────────────────────────────────────
  const items = []
  for (let p = 0; p < pages.length; p++) {
    const pageNum = p + 1
    if (pageNum <= 6) continue // TOC / contributors / front matter
    const lines = pages[p].split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(qidRe)
      if (!m) continue
      const rest = m[4] || ''
      if (!/GATE/i.test(rest)) continue
      if (secRe.test(lines[i])) continue
      const chN = parseInt(m[1], 10)
      if (!CHAP_SUBJECT[chN]) continue
      const sec = parseInt(m[2], 10)
      const qid = `${m[1]}.${m[2]}.${m[3]}`
      let subtopic = sectionSub[`${m[1]}.${m[2]}`]
      if (!subtopic) {
        const sm = rest.match(/^\s*(.+?):\s*GATE/i)
        if (sm) subtopic = sm[1].trim().replace(/\s+/g, ' ')
      }
      if (!subtopic) subtopic = CHAP_SUBJECT[chN]
      const srcM = rest.match(/GATE.*$/i)
      const source = srcM ? srcM[0].replace(/\s*\|\s*Question:.*$/i, '').trim() : 'GATE'
      let prose = [], tags = ''
      for (let j = i + 1; j < lines.length && j < i + 16; j++) {
        const L = lines[j].trim()
        if (!L) continue
        if (qidRe.test(lines[j]) && /GATE/i.test(lines[j])) break
        if (tagLineRe.test(L)) { tags = L; break }
        prose.push(L)
      }
      const ans = ansMap[qid] || null
      items.push({
        qid, chapter: chN, section: sec,
        subject: CHAP_SUBJECT[chN], topic: subtopic, subtopic,
        source, year: yearFrom(rest) || yearFrom(tags), type: inferType(tags, ans), marks: inferMarks(tags), difficulty: inferDiff(tags),
        answer_key: ans, page: pageNum, prose: prose.join(' ').replace(/\s+/g, ' ').slice(0, 300),
      })
    }
  }

  const seen = new Set(); const uniq = []
  for (const it of items) { if (seen.has(it.qid)) continue; seen.add(it.qid); uniq.push(it) }

  fs.writeFileSync(path.join(DATA, 'index-v2.json'), JSON.stringify(uniq))

  const byPage = {}
  for (const it of uniq) (byPage[it.page] = byPage[it.page] || []).push(it.qid)
  const tasks = Object.keys(byPage).map(Number).sort((a, b) => a - b).map((page) => ({
    page, chapter: uniq.find((x) => x.page === page).chapter, qids: byPage[page],
  }))
  fs.writeFileSync(path.join(DATA, 'tasks-v2.json'), JSON.stringify(tasks))

  const byChap = {}; for (const it of uniq) byChap[it.chapter] = (byChap[it.chapter] || 0) + 1
  const withAns = uniq.filter((x) => x.answer_key).length
  console.log(`Indexed ${uniq.length} questions; ${tasks.length} page-tasks; answers found for ${withAns}/${uniq.length}`)
  let totExp = 0
  for (let c = 1; c <= 10; c++) {
    totExp += EXPECTED[c]
    const got = byChap[c] || 0
    console.log(`  Ch${c} ${CHAP_SUBJECT[c].slice(0, 30).padEnd(30)} ${got} / ${EXPECTED[c]} ${got === EXPECTED[c] ? 'OK' : 'diff ' + (got - EXPECTED[c])}`)
  }
  console.log(`TOTAL indexed ${uniq.length} / expected ${totExp} (diff ${uniq.length - totExp})`)
}
main()
