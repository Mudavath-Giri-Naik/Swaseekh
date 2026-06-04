'use client'

/**
 * FormulaBadge — pastel formula chip with a hover-card preview that shows
 * the formula's name + rendered LaTeX. Used in the questions table, list
 * cards, and the question detail page so colors + hover behavior stay
 * consistent everywhere a formula is referenced.
 */

import Link from 'next/link'
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { formulaBadgePalette } from '@/lib/formula-palette'

export interface FormulaInfo {
  /** Display name, e.g. "Product Rule" */
  name?: string
  /** KaTeX-compatible math string */
  latex?: string
  /** Fallback plain-text formula when LaTeX is missing or fails */
  plain?: string
}

interface Props {
  formulaId: string
  /** Final display name for the chip text */
  name: string
  /** Extra meta to render inside the hover popup (latex / plain) */
  info?: FormulaInfo
  /** Optional: mark as the primary formula for this question (subtle ring) */
  primary?: boolean
  /** Optional: ring outline when this badge matches an active selection */
  selected?: boolean
  /** Click handler. Either pass `onClick` (table inline filter) or `href`
   *  (detail page navigates to /gate/questions?formula=...). */
  onClick?: (e: React.MouseEvent) => void
  href?: string
  /** Visual size tweak — defaults to the small table-row size */
  size?: 'sm' | 'md'
}

export default function FormulaBadge({
  formulaId,
  name,
  info,
  primary = false,
  selected = false,
  onClick,
  href,
  size = 'sm',
}: Props) {
  const palette = formulaBadgePalette(formulaId)

  const sizeClass =
    size === 'md'
      ? 'px-2.5 py-1 text-[12px]'
      : 'px-2.5 py-0.5 text-[11px]'

  // Primary formula gets a subtly bolder font (no ring/border — keeps
  // the chip clean in dark mode where any outline reads as a white line).
  const className = `inline-flex items-center rounded-full transition-colors
    ${sizeClass}
    ${palette.bg} ${palette.text} ${palette.hover}
    ${primary ? 'font-bold' : 'font-medium'}
    ${selected ? 'outline outline-2 outline-offset-1 outline-violet-400' : ''}
  `.replace(/\s+/g, ' ').trim()

  const Trigger = href ? (
    <Link
      href={href}
      className={className}
      onClick={onClick}
    >
      {name}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {name}
    </button>
  )

  return (
    <HoverCard openDelay={80} closeDelay={120}>
      <HoverCardTrigger asChild>{Trigger}</HoverCardTrigger>
      <HoverCardContent
        className="w-auto min-w-[14rem] max-w-sm"
        side="top"
      >
        <div className={`text-[12px] font-semibold uppercase tracking-wider ${palette.text}`}>
          {info?.name ?? name}
        </div>
        <div className="mt-1.5 overflow-x-auto rounded-md bg-slate-50 px-3 py-2 text-center text-[15px] text-slate-900">
          {info?.latex ? (
            <InlineMath math={info.latex} />
          ) : (
            <span className="font-mono text-[13px] text-slate-700">
              {info?.plain ?? '—'}
            </span>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
