/**
 * SVG math post-processing utilities.
 *
 * Question diagrams (the `understand.visual_svg` blob) ship with `<text>`
 * elements whose content is plain-ASCII math like "1/(x(x+1)) = 1/x - 1/(x+1)".
 * Rendered as raw SVG text those expressions look flat and ugly. This module
 * walks the rendered SVG, detects math-looking text nodes, and replaces each
 * with a `<foreignObject>` containing KaTeX-rendered HTML — so fractions
 * stack, exponents superscript, etc.
 */

import katex from 'katex'

/* ─── ASCII → LaTeX converter ───────────────────────────────────────────── */

/** Convert a plain-ASCII math expression to a best-effort LaTeX string. */
export function asciiMathToTeX(input: string): string {
  let s = input

  // Repeatedly replace fraction patterns until stable so nested cases
  // like `1/(x(x+1))` resolve in two passes.
  let prev: string | null = null
  let guard = 6
  while (prev !== s && guard-- > 0) {
    prev = s
    // (paren)/(paren)  — both sides parenthesised
    s = s.replace(
      /\(([^()]+(?:\([^()]*\)[^()]*)*)\)\s*\/\s*\(([^()]+(?:\([^()]*\)[^()]*)*)\)/g,
      '\\frac{$1}{$2}'
    )
    // word|num/(paren)
    s = s.replace(
      /(\w+)\s*\/\s*\(([^()]+(?:\([^()]*\)[^()]*)*)\)/g,
      '\\frac{$1}{$2}'
    )
    // (paren)/word|num
    s = s.replace(
      /\(([^()]+(?:\([^()]*\)[^()]*)*)\)\s*\/\s*(\w+)/g,
      '\\frac{$1}{$2}'
    )
    // word/word | num/num
    s = s.replace(/(\w+)\s*\/\s*(\w+)/g, '\\frac{$1}{$2}')
  }

  // Superscripts: x^2 → x^{2}, x^abc → x^{abc}
  s = s.replace(/(\w+)\s*\^\s*(\w+|\([^()]+\))/g, (_m, base, exp) => {
    const stripped =
      typeof exp === 'string' && exp.startsWith('(') && exp.endsWith(')')
        ? exp.slice(1, -1)
        : exp
    return `${base}^{${stripped}}`
  })

  // Subscripts: x_2 → x_{2}
  s = s.replace(/(\w+)\s*_\s*(\w+)/g, '$1_{$2}')

  // Multiplication: 3*x → 3 \cdot x  (only between alnum tokens)
  s = s.replace(/(\w)\s*\*\s*(\w)/g, '$1 \\cdot $2')

  // Common comparators / ops
  s = s.replace(/<=/g, '\\leq ')
  s = s.replace(/>=/g, '\\geq ')
  s = s.replace(/!=/g, '\\neq ')
  s = s.replace(/\.\.\./g, '\\dots ')
  s = s.replace(/->/g, '\\to ')

  // Math identifiers → LaTeX operators / Greek letters.
  // Use word boundaries so we don't mangle variable names like "sums".
  // Order matters: longer names first.
  const IDENT: Record<string, string> = {
    // Big operators
    sum: '\\sum',
    prod: '\\prod',
    int: '\\int',
    lim: '\\lim',
    max: '\\max',
    min: '\\min',
    // Trig / log
    sin: '\\sin',
    cos: '\\cos',
    tan: '\\tan',
    cot: '\\cot',
    sec: '\\sec',
    csc: '\\csc',
    log: '\\log',
    ln: '\\ln',
    exp: '\\exp',
    sqrt: '\\sqrt',
    mod: '\\bmod ',
    // Symbols
    infty: '\\infty',
    infinity: '\\infty',
    // Greek
    alpha: '\\alpha',
    beta: '\\beta',
    gamma: '\\gamma',
    delta: '\\delta',
    epsilon: '\\epsilon',
    theta: '\\theta',
    lambda: '\\lambda',
    mu: '\\mu',
    pi: '\\pi',
    rho: '\\rho',
    sigma: '\\sigma',
    tau: '\\tau',
    phi: '\\phi',
    psi: '\\psi',
    omega: '\\omega',
  }
  // Replace identifiers that appear as standalone words. Negative
  // lookbehind/lookahead protects pieces of larger identifiers like
  // "summary" or "summed".
  for (const [word, latex] of Object.entries(IDENT)) {
    const re = new RegExp(`(?<![A-Za-z\\\\])${word}(?![A-Za-z])`, 'g')
    s = s.replace(re, latex)
  }

  return s
}

/* ─── Inline math detector ──────────────────────────────────────────────── */

/**
 * Splits a mixed text + math string into alternating text/math parts.
 *
 * Detects math fragments like:
 *   - `f(x)`, `C(n,r)`, `g(x+1)`     — identifier + balanced parens
 *   - `1/x`, `1/(x+1)`, `(a)/(b)`     — fractions
 *   - `x^2`, `2^n`, `x^{n+1}`         — superscripts
 *   - `x_1`, `a_n`, `x_{n+1}`         — subscripts
 *   - `sum_{x=1}^{99}` and similar    — sub+super in one token
 *   - `|A|`, `|A intersect B|`        — absolute-value / set-card bars
 *
 * Surrounding English text stays as text. Used by `SmartText` to render
 * inline math via KaTeX without italicising plain words.
 */
export type InlinePart = { type: 'text' | 'math'; content: string }

export function splitInlineMath(input: string): InlinePart[] {
  if (!input) return []
  // Union of math-fragment patterns. Order matters: longer/specific first.
  const PATTERNS: string[] = [
    // sub+super combined: word_{...}^{...} or word_{...}^word
    /[A-Za-z]+_\{[^{}]+\}\^\{[^{}]+\}/.source,
    /[A-Za-z]+_\{[^{}]+\}\^[A-Za-z0-9]+/.source,
    /[A-Za-z]+_[A-Za-z0-9]+\^\{[^{}]+\}/.source,
    // word^{...} or word_{...}
    /[A-Za-z0-9]+\^\{[^{}]+\}/.source,
    /[A-Za-z0-9]+_\{[^{}]+\}/.source,
    // word^word or word_word
    /[A-Za-z0-9]+\^[A-Za-z0-9]+/.source,
    /[A-Za-z]+_[A-Za-z0-9]+/.source,
    // Identifier followed by balanced parens — f(x), C(n,r), g(x+1)
    /[A-Za-z]+\([^()]*(?:\([^()]*\)[^()]*)*\)/.source,
    // Fractions: (paren)/(paren), word/(paren), (paren)/word, word/word
    /\([^()]*(?:\([^()]*\)[^()]*)*\)\s*\/\s*\([^()]*(?:\([^()]*\)[^()]*)*\)/.source,
    /[A-Za-z0-9]+\s*\/\s*\([^()]*(?:\([^()]*\)[^()]*)*\)/.source,
    /\([^()]*(?:\([^()]*\)[^()]*)*\)\s*\/\s*[A-Za-z0-9]+/.source,
    /[A-Za-z0-9]+\s*\/\s*[A-Za-z0-9]+/.source,
    // Absolute value / cardinality bars
    /\|[^|]{1,40}\|/.source,
  ]
  const combined = new RegExp(PATTERNS.join('|'), 'g')

  const parts: InlinePart[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = combined.exec(input)) !== null) {
    if (m.index > last) {
      parts.push({ type: 'text', content: input.slice(last, m.index) })
    }
    parts.push({ type: 'math', content: m[0] })
    last = combined.lastIndex
  }
  if (last < input.length) {
    parts.push({ type: 'text', content: input.slice(last) })
  }
  return parts
}

/* ─── Mixed text + math → LaTeX with \text{} preserved ─────────────────── */

/**
 * For SVG text-node content like "split: 1/(x(x+1)) = 1/x - 1/(x+1)",
 * return a LaTeX string that keeps the prose ("split:") in upright
 * `\text{…}` (so it doesn't render in italic-serif math typography)
 * and only italicises the genuine math fragments. Keeps numeric and
 * comparison operators (=, +, -, *) outside `\text{}` so KaTeX still
 * spaces them as math.
 */
export function mixedAsciiToTeX(input: string): string {
  if (!input) return ''
  const parts = splitInlineMath(input)
  if (parts.length === 0 || !parts.some((p) => p.type === 'math')) {
    // Pure prose — wrap in \textsf{} so KaTeX renders it upright and
    // sans-serif (matches typical SVG diagram labels).
    return wrapProse(input)
  }

  // Join with the empty string so KaTeX doesn't insert extra whitespace
  // between groups. Spaces that should print are already kept inside the
  // prose `\textsf{…}` wrappers by `wrapProse`.
  return parts
    .map((p) => (p.type === 'math' ? asciiMathToTeX(p.content) : wrapProse(p.content)))
    .join('')
}

/** Escape characters that have special meaning inside a `\text{}` group. */
function escapeTextForTeX(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/[{}]/g, (m) => `\\${m}`)
    .replace(/[#&_$%~^]/g, (m) => `\\${m}`)
}

/**
 * Wrap a prose run for LaTeX. Whitespace-only segments are passed
 * through unchanged (KaTeX collapses them anyway). Real prose is wrapped
 * in `\textsf{…}` so internal spaces print, and so the text renders in
 * sans-serif rather than italic-serif math typography.
 */
function wrapProse(text: string): string {
  if (!text) return ''
  if (/^\s*$/.test(text)) return ' ' // preserve as a single space separator
  // Force a non-collapsing space at the start and end so adjacent math
  // fragments don't bump straight into the prose glyphs.
  const leadSpace = /^\s/.test(text) ? '\\ ' : ''
  const trailSpace = /\s$/.test(text) ? '\\ ' : ''
  const trimmed = text.replace(/^\s+|\s+$/g, '')
  if (!trimmed) return ' '
  return `${leadSpace}\\textsf{${escapeTextForTeX(trimmed)}}${trailSpace}`
}

/* ─── Detection heuristic ───────────────────────────────────────────────── */

/**
 * Return true when a text string is *predominantly* math and worth
 * routing through KaTeX. Pure prose, mixed prose+math, or short labels
 * are left as native SVG text so the original layout doesn't break.
 *
 * Heuristics:
 *   - Must contain at least one math marker (/, ^, _, =, function call,
 *     LaTeX escape, etc.).
 *   - Letters + spaces must be < 50% of the string. (Above that, the
 *     label is mostly English prose; rendering it through KaTeX risks
 *     overflow / line-break ugliness, so we leave it alone.)
 *   - Skip very short or pure-letter labels.
 */
export function looksLikeMath(text: string): boolean {
  if (!text) return false
  const t = text.trim()
  if (t.length < 2) return false
  if (/^[A-Za-z\s]+$/.test(t)) return false

  const hasMathMarker = /[\/^_=]|\d\s*\(|\\\w|\bC\(|\bP\(/.test(t)
  if (!hasMathMarker) return false

  // Prose ratio guard — bail if mostly letters/spaces (real prose).
  const letters = (t.match(/[A-Za-z\s]/g)?.length ?? 0)
  const proseRatio = letters / t.length
  if (proseRatio > 0.5) return false

  return true
}

/* ─── SVG enhancement ───────────────────────────────────────────────────── */

/**
 * Replace mathy `<text>` nodes inside an SVG root with KaTeX-rendered
 * `<foreignObject>` blocks. Safe to call multiple times — already-replaced
 * nodes carry a `data-math-enhanced` attribute and are skipped.
 */
export function enhanceSvgMath(root: HTMLElement): void {
  const svgs = root.querySelectorAll('svg')
  svgs.forEach((svg) => {
    // Ensure overflow is visible so big foreignObjects (fractions stack
    // taller than the original text) aren't clipped at the viewBox.
    svg.setAttribute('overflow', 'visible')

    const texts = Array.from(svg.querySelectorAll('text'))
    texts.forEach((text) => {
      if (text.getAttribute('data-math-enhanced') === 'true') return
      const content = text.textContent ?? ''
      if (!looksLikeMath(content)) return

      // Convert to LaTeX — `mixedAsciiToTeX` keeps prose in `\text{}` so
      // labels like "split:" don't render in italic-serif math font.
      let tex: string
      try {
        tex = mixedAsciiToTeX(content)
      } catch {
        return
      }

      // Render
      let html: string
      try {
        html = katex.renderToString(tex, {
          throwOnError: false,
          displayMode: false,
          output: 'html',
          strict: false,
        })
      } catch {
        return
      }

      // Measure the existing text so we can position the replacement
      let bbox: DOMRect | { x: number; y: number; width: number; height: number }
      try {
        bbox = (text as SVGGraphicsElement).getBBox()
      } catch {
        return
      }

      // Pick up the original text's font-size in SVG user units so the
      // KaTeX replacement renders at the same visual scale.
      let fontPx = 16
      try {
        const fs = parseFloat(getComputedStyle(text).fontSize)
        if (!Number.isNaN(fs) && fs > 0) fontPx = fs
      } catch {
        // ignore — keep default
      }

      // Detect prose-heavy labels (mostly letters / spaces with only a
      // sprinkling of math). For these we shrink the font and allow the
      // content to wrap onto multiple lines so it never overflows the
      // diagram horizontally.
      const letterCount = (content.match(/[A-Za-z\s]/g)?.length ?? 0)
      const proseRatio = letterCount / Math.max(1, content.length)
      const isProseHeavy = proseRatio > 0.6 && content.length > 25
      if (isProseHeavy) {
        fontPx = Math.max(11, fontPx * 0.78)
      }

      // Inflate the box generously. KaTeX-rendered math is often wider
      // than the original ASCII (e.g. `1/(x(x+1))` → stacked fraction
      // can be ~1.5× wider) and ~2× taller. For prose-heavy labels we
      // also grow vertically to accommodate ~3 wrapped lines.
      const padX = Math.max(40, bbox.width * 0.8)
      const wrapLines = isProseHeavy
        ? Math.max(2, Math.ceil(content.length / 45))
        : 1
      const padY = Math.max(fontPx * 1.5, bbox.height * 1.8) * wrapLines
      const x = bbox.x - padX
      const y = bbox.y - padY
      const w = bbox.width + padX * 2
      const h = bbox.height + padY * 2

      // Build foreignObject
      const NS = 'http://www.w3.org/2000/svg'
      const XHTML = 'http://www.w3.org/1999/xhtml'
      const fo = document.createElementNS(NS, 'foreignObject')
      fo.setAttribute('x', String(x))
      fo.setAttribute('y', String(y))
      fo.setAttribute('width', String(w))
      fo.setAttribute('height', String(h))
      fo.setAttribute('overflow', 'visible')

      const wrapper = document.createElementNS(XHTML, 'div') as HTMLDivElement
      // KaTeX HTML needs the katex.css we already load globally on pages
      // that import it. Use the original text's font-size as the base so
      // KaTeX matches the diagram labels. `white-space:normal` lets long
      // prose wrap onto multiple lines; KaTeX math nodes are inline-block
      // so fractions / superscripts stay whole.
      wrapper.setAttribute(
        'style',
        `display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:inherit;line-height:1.25;font-size:${fontPx}px;overflow:visible;white-space:${
          isProseHeavy ? 'normal' : 'nowrap'
        };text-align:center;`
      )
      wrapper.innerHTML = html
      const katexEl = wrapper.firstElementChild as HTMLElement | null
      if (katexEl) {
        // KaTeX renders ~5% smaller than the declared font-size; bump
        // it slightly so it reads at parity with the surrounding labels.
        katexEl.style.fontSize = '1.05em'
        katexEl.style.whiteSpace = isProseHeavy ? 'normal' : 'nowrap'
        katexEl.style.maxWidth = '100%'
      }
      fo.appendChild(wrapper)

      // Insert before the old text, hide the original (don't remove —
      // keeps screen-reader / aria text accessible).
      text.parentNode?.insertBefore(fo, text)
      text.setAttribute('visibility', 'hidden')
      text.setAttribute('data-math-enhanced', 'true')
    })
  })
}
