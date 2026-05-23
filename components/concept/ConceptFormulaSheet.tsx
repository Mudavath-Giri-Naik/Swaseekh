'use client'

/**
 * ConceptFormulaSheet — notebook-style formula sheet renderer.
 *
 * Design rules (matches the reference notebook image):
 *  - Single graph-paper "page" — everything flows on it; no separate cards
 *  - Headings (page title, group titles, sub-section labels) get a pastel
 *    highlighter swash behind them, color cycles per group
 *  - Formula expressions get a thin border box only (no bg fill)
 *  - List items use a small star bullet (★) / arrow (→) for affordance
 *  - Body stays on Inter; handwriting font (Caveat) is for headings only
 *  - Tap-to-expand reveals term symbols (KaTeX) + the GATE trap inline
 *
 * Math: latex/symbol render via KaTeX; on parse failure we fall back to
 * the formula's plain string.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, AlertTriangle, MessageSquareText } from 'lucide-react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

/* ─── Types ────────────────────────────────────────────────────────── */

interface Term {
  symbol?: string
  means?: string
}
interface Formula {
  formulaId?: string
  name?: string
  latex?: string
  plain?: string
  whenToUse?: string
  terms?: Term[]
  trap?: string
  reference?: string
}
interface Group {
  groupId?: string
  groupTitle?: string
  formulas?: Formula[]
}
interface DecisionGuide {
  title?: string
  questions?: string[]
  map?: { condition?: string; use?: string }[]
}

export interface FormulaSheetDoc {
  conceptTitle?: string
  reference?: string
  decisionGuide?: DecisionGuide
  groups?: Group[]
}

interface Props {
  content: FormulaSheetDoc
  backHref?: string
  backLabel?: string
  /** If true, strip the page chrome (back link, page bg, big title). */
  inline?: boolean
  /** Map of { [formulaId]: questionCount } — when supplied, shows
   *  a question-count badge on each formula card. */
  questionCounts?: Record<string, number>
}

/* ─── Highlighter palette — blue family only, cycles per group ──────── */

const HIGHLIGHT = [
  '#bae6fd', // sky-200 (light)
  '#93c5fd', // blue-300 (medium)
  '#a5f3fc', // cyan-200
  '#bfdbfe', // blue-200
  '#c7d2fe', // indigo-200
  '#7dd3fc', // sky-300 (medium-dark)
]

/* ─── Component ────────────────────────────────────────────────────── */

export default function ConceptFormulaSheet({
  content,
  backHref = '/gate',
  backLabel = 'Back to syllabus',
  inline = false,
  questionCounts: externalCounts,
}: Props) {
  const { conceptTitle, reference, decisionGuide, groups } = content
  const groupList = groups ?? []
  const totalFormulas = groupList.reduce(
    (sum, g) => sum + (g.formulas?.length ?? 0),
    0
  )

  // If external counts weren't provided, try to fetch them from the API
  // by finding formula IDs in the content and querying the endpoint.
  const [fetchedCounts, setFetchedCounts] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    // Only fetch if external counts weren't provided
    if (externalCounts) return

    // Collect all formula IDs from the content
    const formulaIds: string[] = []
    for (const group of groupList) {
      for (const f of group.formulas ?? []) {
        if (f.formulaId) formulaIds.push(f.formulaId)
      }
    }

    if (formulaIds.length === 0) return

    // Fetch counts from the API (no conceptId filter — get all questions)
    fetch('/api/formulas/question-counts')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setFetchedCounts(data))
      .catch(() => setFetchedCounts({}))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalCounts])

  const questionCounts = externalCounts ?? fetchedCounts ?? {}

  const Body = (
    <>
      {!inline && (
        <header className="mt-4 text-center">
          <h1
            className="text-balance text-[1.85rem] font-bold leading-[1.05] text-sky-700 sm:text-[2.2rem]"
            style={{ fontFamily: 'var(--font-handwriting), Caveat, cursive' }}
          >
            ✦ {conceptTitle || 'Untitled concept'} ✦
          </h1>
          {reference && (
            <p className="mt-1 text-[10.5px] italic text-slate-400 sm:text-[11px]">
              {reference}
            </p>
          )}
        </header>
      )}

      {/* Top counts strip */}
      <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {groupList.length} group{groupList.length !== 1 ? 's' : ''} ·{' '}
        {totalFormulas} formula{totalFormulas !== 1 ? 's' : ''}
      </p>

      {decisionGuide && <DecisionGuidePanel guide={decisionGuide} />}

      {groupList.map((group, gIdx) => (
        <GroupSection
          key={group.groupId ?? gIdx}
          group={group}
          colourIndex={gIdx}
          groupIndex={gIdx + 1}
          totalGroups={groupList.length}
          questionCounts={questionCounts}
        />
      ))}

      {!inline && reference && (
        <p className="mt-7 border-t border-slate-200 pt-3 text-center text-[10.5px] italic text-slate-400">
          {reference}
        </p>
      )}
    </>
  )

  // ─── Inline mode: a single bordered notebook box, graph-paper inside ──
  if (inline) {
    return (
      <div className="cc-sheet-inline mt-2">
        <div className="notebook-bg rounded-2xl border-2 border-sky-300/70 p-3 shadow-[0_2px_10px_-4px_rgba(56,132,226,0.18)] sm:p-4">
          {Body}
        </div>
        <FormulaSheetStyles />
      </div>
    )
  }

  // ─── Full-page mode: white outside, bordered notebook box inside ─────
  return (
    <div className="min-h-screen bg-white">
      <article className="mx-auto max-w-[760px] px-3 py-3 sm:px-5 sm:py-5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        <div className="notebook-bg mt-3 rounded-2xl border-2 border-sky-300/70 p-4 shadow-[0_4px_18px_-6px_rgba(56,132,226,0.22)] sm:p-5">
          {Body}
        </div>
      </article>
      <FormulaSheetStyles />
    </div>
  )
}

/* ─── Decision-guide panel ──────────────────────────────────────────── */

function DecisionGuidePanel({ guide }: { guide: DecisionGuide }) {
  const { title, questions, map } = guide
  return (
    <section className="mt-3">
      <HighlightedHeading color="#7dd3fc" extraIcon="⭐">
        {title || 'Decision guide'}
      </HighlightedHeading>

      {questions && questions.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-slate-700 sm:text-[13px]">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="font-bold text-sky-700">Q{i + 1}.</span>
              <span className="flex-1">{q}</span>
            </li>
          ))}
        </ul>
      )}

      {map && map.length > 0 && (
        <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {map.map((row, i) => (
            <div
              key={i}
              className="flex items-baseline gap-1.5 text-[12.5px] sm:text-[13px]"
            >
              <span aria-hidden className="text-sky-500">★</span>
              <span className="flex-1 text-slate-700">{row.condition}</span>
              <span aria-hidden className="text-slate-400">→</span>
              <span className="inline-block max-w-full overflow-hidden rounded-md border border-sky-300/70 bg-white/60 px-1.5 py-0.5">
                {row.use ? <SafeMath latex={row.use} inline /> : null}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ─── Group section ────────────────────────────────────────────────── */

function GroupSection({
  group,
  colourIndex,
  groupIndex,
  totalGroups,
  questionCounts,
}: {
  group: Group
  colourIndex: number
  groupIndex: number
  totalGroups: number
  questionCounts: Record<string, number>
}) {
  const color = HIGHLIGHT[colourIndex % HIGHLIGHT.length]
  const formulas = group.formulas ?? []
  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <HighlightedHeading color={color}>
          {groupIndex}. {group.groupTitle ?? 'Group'}
        </HighlightedHeading>
        <span className="text-[10.5px] font-medium text-slate-500 sm:text-[11px]">
          {groupIndex} / {totalGroups} · {formulas.length} formula
          {formulas.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="mt-1.5 grid gap-x-5 gap-y-2 sm:grid-cols-2">
        {formulas.map((f, fIdx) => (
          <FormulaRow
            key={f.formulaId ?? fIdx}
            formula={f}
            number={fIdx + 1}
            total={formulas.length}
            questionCount={f.formulaId ? (questionCounts[f.formulaId] ?? 0) : 0}
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Formula row — flows on the page, no card background ──────────── */

function FormulaRow({
  formula,
  number,
  total,
  questionCount,
}: {
  formula: Formula
  number: number
  total: number
  questionCount: number
}) {
  const [open, setOpen] = useState(false)
  const hasExtras =
    (formula.terms && formula.terms.length > 0) || !!formula.trap

  const hasQuestions = questionCount > 0
  const countLabel = `${questionCount} question${questionCount !== 1 ? 's' : ''}`

  return (
    <div data-formula-id={formula.formulaId ?? undefined} className="py-0.5">
      <button
        type="button"
        onClick={() => hasExtras && setOpen((v) => !v)}
        disabled={!hasExtras}
        aria-expanded={open}
        className="block w-full text-left"
      >
        {/* Name row: star bullet + number + name + question count badge */}
        <div className="flex items-baseline gap-1.5">
          <span aria-hidden className="text-sky-500">★</span>
          <span
            className="flex-1 text-[14px] font-semibold leading-tight text-slate-800 sm:text-[15px]"
            style={{ fontFamily: 'var(--font-handwriting), Caveat, cursive' }}
          >
            {number}. {formula.name}
          </span>
          <span className="shrink-0 text-[10px] font-medium text-slate-400">
            {number}/{total}
          </span>
        </div>

        {/* Formula expression — thin blue-tinted full-width frame.
            Uses overflow-hidden so wide formulas never show a scrollbar;
            we rely on the smaller KaTeX font size (set globally below)
            to ensure formulas fit inside the column. */}
        {formula.latex && (
          <div className="cc-formula-frame mt-1 block w-full overflow-hidden rounded-md border border-sky-300/70 bg-white/50 px-2 py-1 text-center">
            <SafeMath latex={formula.latex} fallback={formula.plain} />
          </div>
        )}

        {/* When-to-use line */}
        {formula.whenToUse && (
          <div className="mt-1 flex items-start gap-1 pl-4 text-[11.5px] leading-[1.45] text-slate-600 sm:text-[12px]">
            <span aria-hidden className="mt-px text-slate-400">→</span>
            <span className="flex-1">{formula.whenToUse}</span>
          </div>
        )}

        {/* Question count badge — clickable, navigates to /gate/questions?formula=X */}
        {formula.formulaId && (
          <div className="mt-1 pl-4">
            <Link
              href={`/gate/questions?formula=${encodeURIComponent(formula.formulaId)}`}
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold transition-all
                ${hasQuestions
                  ? 'border border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-400 hover:shadow-sm'
                  : 'border border-slate-200 bg-slate-50 text-slate-400 cursor-default'
                }
              `}
              title={hasQuestions ? `View ${countLabel} using this formula` : 'No linked questions yet'}
            >
              <MessageSquareText className={`h-3 w-3 ${hasQuestions ? 'text-violet-500' : 'text-slate-300'}`} />
              {countLabel}
            </Link>
          </div>
        )}

        {/* Expand affordance — tiny, only when there are details */}
        {hasExtras && (
          <div className="mt-0.5 flex items-center gap-0.5 pl-4 text-[10.5px] font-medium text-slate-400">
            <ChevronDown
              className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
            />
            <span>{open ? 'hide' : 'tap for terms'}</span>
          </div>
        )}
      </button>

      {/* Expandable body */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0">
          <div className="mt-1 space-y-1.5 pl-4">
            {formula.terms && formula.terms.length > 0 && (
              <dl className="space-y-0.5">
                {formula.terms.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-baseline gap-1.5 text-[11.5px] sm:text-[12px]"
                  >
                    <dt className="shrink-0">
                      {t.symbol ? <SafeMath latex={t.symbol} inline /> : '?'}
                    </dt>
                    <dd className="text-slate-400">=</dd>
                    <dd className="flex-1 leading-[1.45] text-slate-600">
                      {t.means}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {formula.trap && (
              <div className="flex items-start gap-1 text-[11.5px] text-amber-800 sm:text-[12px]">
                <AlertTriangle
                  className="mt-0.5 h-3 w-3 shrink-0 text-amber-600"
                  strokeWidth={2.5}
                />
                <div className="leading-[1.45]">
                  <span className="font-semibold">Watch out:</span>{' '}
                  {formula.trap}
                </div>
              </div>
            )}

            {formula.reference && (
              <p className="text-[10px] italic text-slate-400">
                {formula.reference}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── HighlightedHeading — handwriting text with pastel swash behind ── */

function HighlightedHeading({
  children,
  color,
  extraIcon,
}: {
  children: React.ReactNode
  color: string
  extraIcon?: string
}) {
  return (
    <h3 className="relative inline-block">
      <span
        aria-hidden
        className="absolute -inset-x-1.5 inset-y-0.5 -z-0 rounded"
        style={{
          background: color,
          transform: 'rotate(-1.2deg)',
          opacity: 0.7,
        }}
      />
      <span
        className="relative z-10 px-1.5 text-[1.2rem] font-bold leading-tight text-slate-900 sm:text-[1.4rem]"
        style={{ fontFamily: 'var(--font-handwriting), Caveat, cursive' }}
      >
        {extraIcon ? `${extraIcon} ` : ''}
        {children}
      </span>
    </h3>
  )
}

/* ─── Shared styles ────────────────────────────────────────────────── */

function FormulaSheetStyles() {
  return (
    <style jsx global>{`
      .notebook-bg {
        background-color: #fdfcf7;
        background-image:
          linear-gradient(
            to right,
            rgba(56, 132, 226, 0.08) 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            rgba(56, 132, 226, 0.08) 1px,
            transparent 1px
          );
        background-size: 22px 22px;
      }
      /* Shrink KaTeX inside the formula sheet so most formulas fit
         within the column width without needing to scroll. */
      .cc-sheet-inline .katex,
      .notebook-bg .katex {
        font-size: 0.85em;
      }
      .cc-sheet-inline .katex-display,
      .notebook-bg .katex-display {
        font-size: 0.85em;
        margin: 0;
      }
      /* Hide any KaTeX-rendered scroll affordance just in case */
      .cc-sheet-inline .katex-display > .katex,
      .notebook-bg .katex-display > .katex {
        white-space: normal;
      }
    `}</style>
  )
}

/* ─── SafeMath: KaTeX with plain-string fallback ──────────────────── */

function SafeMath({
  latex,
  inline = false,
  fallback,
}: {
  latex: string
  inline?: boolean
  fallback?: string
}) {
  const Comp = inline ? InlineMath : BlockMath
  return (
    <Comp
      math={latex}
      errorColor="#b91c1c"
      renderError={() => (
        <span className="font-mono text-[12px] text-slate-700">
          {fallback ?? latex}
        </span>
      )}
    />
  )
}
