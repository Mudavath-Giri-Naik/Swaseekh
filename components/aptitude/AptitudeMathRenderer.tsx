"use client"

import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface Props {
  math: string
  block?: boolean
  className?: string
}

export function AptitudeMathRenderer({ math, block = false, className = '' }: Props) {
  if (!math || math.trim() === '') return null

  try {
    if (block) {
      return (
        <div className={`my-2 overflow-x-auto ${className}`}>
          <BlockMath math={math} />
        </div>
      )
    }
    return <InlineMath math={math} />
  } catch {
    // Fallback: render as plain text if LaTeX parsing fails
    return <code className={`font-mono text-sm ${className}`}>{math}</code>
  }
}

/** Renders mixed text that may contain $...$ inline math and $$...$$ block math */
export function AptitudeMixedContent({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null

  // Split on $$...$$ first (block), then $...$ (inline)
  const blockParts = text.split(/(\\$\\$[\s\S]*?\\$\\$)/g)

  return (
    <span className={className}>
      {blockParts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim()
          return (
            <div key={i} className="my-2 overflow-x-auto">
              <BlockMath math={math} />
            </div>
          )
        }
        // Split on $...$ inline math
        const inlineParts = part.split(/(\$[^$]+\$)/g)
        return (
          <span key={i}>
            {inlineParts.map((seg, j) => {
              if (seg.startsWith('$') && seg.endsWith('$') && seg.length > 2) {
                const math = seg.slice(1, -1)
                return (
                  <span key={j} className="inline-block align-middle">
                    <InlineMath math={math} />
                  </span>
                )
              }
              return <span key={j}>{seg}</span>
            })}
          </span>
        )
      })}
    </span>
  )
}
