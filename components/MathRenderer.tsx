'use client'

import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface MathRendererProps {
  text: string
  className?: string
}

/**
 * Parses a string containing LaTeX delimiters ($ for inline, $$ for display)
 * and renders math expressions using react-katex.
 */
export default function MathRenderer({ text, className = '' }: MathRendererProps) {
  if (!text) return null

  const parts = parseLatex(text)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === 'display-math') {
          return (
            <BlockMath
              key={i}
              math={part.content}
              errorColor="#cc0000"
              renderError={(error) => (
                <span className="text-red-500 text-xs" title={error.message}>
                  [Math Error]
                </span>
              )}
            />
          )
        }
        if (part.type === 'inline-math') {
          return (
            <InlineMath
              key={i}
              math={part.content}
              errorColor="#cc0000"
              renderError={(error) => (
                <span className="text-red-500 text-xs" title={error.message}>
                  [Math Error]
                </span>
              )}
            />
          )
        }
        return <span key={i}>{part.content}</span>
      })}
    </span>
  )
}

/* ─── Parser ────────────────────────────────────────────────────────────── */

interface LatexPart {
  type: 'text' | 'inline-math' | 'display-math'
  content: string
}

function parseLatex(text: string): LatexPart[] {
  const parts: LatexPart[] = []
  // Regex: 
  // 1: $$...$$ (display)
  // 2: \begin{...}...\end{...} (display)
  // 3: The environment name for the \end tag backreference
  // 4: $...$ (inline)
  const regex = /\$\$([\s\S]+?)\$\$|(\\begin\{([a-zA-Z*]+)\}[\s\S]+?\\end\{\3\})|\$([^$]+?)\$/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }

    if (match[1] !== undefined) {
      // Display math: $$...$$
      parts.push({ type: 'display-math', content: match[1].trim() })
    } else if (match[2] !== undefined) {
      // Display math: \begin{...}...\end{...}
      parts.push({ type: 'display-math', content: match[2].trim() })
    } else if (match[4] !== undefined) {
      // Inline math: $...$
      parts.push({ type: 'inline-math', content: match[4].trim() })
    }

    lastIndex = regex.lastIndex
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return parts
}
