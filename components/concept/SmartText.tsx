'use client'

/**
 * SmartText / AsciiMath — render plain-ASCII math (from DB content)
 * with KaTeX. SmartText splits prose at math-looking fragments so the
 * surrounding English text stays as text and only the fragments get
 * routed through KaTeX. AsciiMath assumes the whole input is math.
 */

import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'
import MathRenderer from '@/components/MathRenderer'
import { asciiMathToTeX, splitInlineMath } from '@/lib/svg-math'

export function AsciiMath({ text }: { text: string }) {
  if (!text) return null
  // If the string already uses $...$ delimiters, let MathRenderer handle it.
  if (/\$.+\$/.test(text)) return <MathRenderer text={text} />

  const tex = asciiMathToTeX(text)
  return (
    <span className="cc-ascii-math">
      <InlineMath
        math={tex}
        errorColor="#475569"
        renderError={() => (
          <span className="italic text-slate-700">{text}</span>
        )}
      />
      <style jsx>{`
        .cc-ascii-math :global(.katex) {
          font-size: 1.05em;
          white-space: normal;
        }
      `}</style>
    </span>
  )
}

export function SmartText({ text }: { text: string }) {
  if (!text) return null
  if (/\$.+\$/.test(text)) return <MathRenderer text={text} />

  const parts = splitInlineMath(text)
  if (parts.length === 0 || !parts.some((p) => p.type === 'math')) {
    return <span>{text}</span>
  }
  return (
    <span>
      {parts.map((p, i) =>
        p.type === 'math' ? (
          <AsciiMath key={i} text={p.content} />
        ) : (
          <span key={i}>{p.content}</span>
        )
      )}
    </span>
  )
}
