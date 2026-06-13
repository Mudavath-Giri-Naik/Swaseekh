// Repair the few auto-v2 files that are invalid JSON:
//  - strip a leading UTF-8 BOM
//  - escape stray backslashes that are not part of a valid JSON escape
//    (valid escapes: \\  \"  \/  \b \f \n \r \t \uXXXX)
// Re-parses after repair; only overwrites when the repair yields valid JSON.
const fs = require('fs')
const path = require('path')

const AUTO = path.join(__dirname, 'data', 'auto-v2')
const files = process.argv.slice(2)
if (!files.length) { console.log('usage: node scripts/repair-json.js page-0274.json ...'); process.exit(0) }

const validEscape = new Set(['\\', '"', '/', 'b', 'f', 'n', 'r', 't', 'u'])

function repair(raw) {
  // 1. strip BOM (any leading U+FEFF)
  raw = raw.replace(/^﻿/, '')
  // 2. walk the string; escape any backslash not introducing a valid escape
  let out = ''
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (c === '\\') {
      const next = raw[i + 1]
      if (next !== undefined && validEscape.has(next)) { out += c + next; i++ }
      else out += '\\\\' // lone/invalid backslash -> escape it
    } else {
      out += c
    }
  }
  return out
}

for (const f of files) {
  const fp = path.join(AUTO, f)
  let raw; try { raw = fs.readFileSync(fp, 'utf8') } catch { console.log(f + ': not found'); continue }
  const fixed = repair(raw)
  try { JSON.parse(fixed); fs.writeFileSync(fp, fixed); console.log(f + ': REPAIRED ✓') }
  catch (e) { console.log(f + ': STILL BAD -> ' + e.message.slice(0, 90)) }
}
