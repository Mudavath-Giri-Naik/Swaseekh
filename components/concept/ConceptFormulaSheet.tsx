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
import { ArrowLeft } from 'lucide-react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import FormulaStoryDialog, { type StoryFormula } from './FormulaStoryDialog'

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

/* ─── Poster palette — pastel cards, one per group, cycled ─────────── */

type Palette = {
  card: string      // soft tinted background for the card body
  border: string    // matching subtle border
  headerText: string
  headerBar: string // tint behind the card header
  num: string       // numbered circle (bg+text)
  accent: string    // accent text color
}

const POSTER_PALETTES: Palette[] = [
  { card: 'bg-blue-50',    border: 'border-blue-200',    headerText: 'text-blue-800',    headerBar: 'bg-blue-100',    num: 'bg-blue-500',    accent: 'text-blue-600' },
  { card: 'bg-orange-50',  border: 'border-orange-200',  headerText: 'text-orange-800',  headerBar: 'bg-orange-100',  num: 'bg-orange-500',  accent: 'text-orange-600' },
  { card: 'bg-emerald-50', border: 'border-emerald-200', headerText: 'text-emerald-800', headerBar: 'bg-emerald-100', num: 'bg-emerald-500', accent: 'text-emerald-600' },
  { card: 'bg-amber-50',   border: 'border-amber-200',   headerText: 'text-amber-800',   headerBar: 'bg-amber-100',   num: 'bg-amber-500',   accent: 'text-amber-600' },
  { card: 'bg-rose-50',    border: 'border-rose-200',    headerText: 'text-rose-800',    headerBar: 'bg-rose-100',    num: 'bg-rose-500',    accent: 'text-rose-600' },
  { card: 'bg-violet-50',  border: 'border-violet-200',  headerText: 'text-violet-800',  headerBar: 'bg-violet-100',  num: 'bg-violet-500',  accent: 'text-violet-600' },
  { card: 'bg-sky-50',     border: 'border-sky-200',     headerText: 'text-sky-800',     headerBar: 'bg-sky-100',     num: 'bg-sky-500',     accent: 'text-sky-600' },
  { card: 'bg-pink-50',    border: 'border-pink-200',    headerText: 'text-pink-800',    headerBar: 'bg-pink-100',    num: 'bg-pink-500',    accent: 'text-pink-600' },
  { card: 'bg-teal-50',    border: 'border-teal-200',    headerText: 'text-teal-800',    headerBar: 'bg-teal-100',    num: 'bg-teal-500',    accent: 'text-teal-600' },
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

  // Story dialog state — shared across all groups so each tap can open
  // a fullscreen carousel of just that group's formulas.
  const [storyOpen, setStoryOpen] = useState(false)
  const [storyFormulas, setStoryFormulas] = useState<StoryFormula[]>([])
  const [storyIndex, setStoryIndex] = useState(0)
  const openStory = (formulas: StoryFormula[], index: number) => {
    setStoryFormulas(formulas)
    setStoryIndex(index)
    setStoryOpen(true)
  }

  // Always 2 columns for the poster grid — keeps the 9:16 layout dense
  // and readable. Larger group counts simply stack into more rows.
  const numCols = 2

  const Poster = (
    <div
      className="poster mx-auto flex w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)] ring-1 ring-slate-200"
    >
      {/* ── Banner ─────────────────────────────────────────────────── */}
      <div className="relative shrink-0 bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 px-3 py-2 text-center">
        <h1
          className="text-balance text-[1.35rem] font-extrabold leading-[1.05] text-indigo-900"
          style={{ fontFamily: 'var(--font-handwriting), Caveat, cursive' }}
        >
          {conceptTitle || 'Untitled concept'}
        </h1>
      </div>

      {/* ── Decision strip ────────────────────────────────────────── */}
      {decisionGuide && <DecisionStrip guide={decisionGuide} />}

      {/* ── Group grid (masonry — cards take only the height they need) ── */}
      <div className="min-h-0 flex-1 p-1.5">
        <div className="columns-2 gap-1.5 [column-fill:balance]">
          {groupList.map((group, gIdx) => (
            <div key={group.groupId ?? gIdx} className="mb-1.5 break-inside-avoid">
              <PosterCard
                group={group}
                number={gIdx + 1}
                palette={POSTER_PALETTES[gIdx % POSTER_PALETTES.length]}
                onOpenStory={openStory}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-3 py-1.5 text-[9px] font-medium text-slate-500">
        <span>
          {groupList.length} groups · {totalFormulas} formulas
        </span>
        <span className="italic">Tap any formula for details</span>
      </div>
    </div>
  )

  const StoryHost = (
    <FormulaStoryDialog
      open={storyOpen}
      onOpenChange={setStoryOpen}
      formulas={storyFormulas}
      startIndex={storyIndex}
      questionCounts={questionCounts}
    />
  )

  // ─── Inline mode ─────────────────────────────────────────────────────
  if (inline) {
    return (
      <div className="cc-sheet-inline mt-2">
        {Poster}
        <FormulaSheetStyles />
        {StoryHost}
      </div>
    )
  }

  // ─── Full-page mode ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <article className="mx-auto max-w-[480px] px-3 py-3 sm:px-5 sm:py-5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        <div className="mt-3">{Poster}</div>
        {reference && (
          <p className="mt-3 text-center text-[10.5px] italic text-slate-400">
            {reference}
          </p>
        )}
      </article>
      <FormulaSheetStyles />
      {StoryHost}
    </div>
  )
}

/* ─── Decision strip — compact horizontal panel under the banner ───── */

function DecisionStrip({ guide }: { guide: DecisionGuide }) {
  const { title, map } = guide
  return (
    <div className="shrink-0 border-y border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
      <div className="text-center text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {title || 'Which formula do I use?'}
      </div>
      {map && map.length > 0 && (
        <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
          {map.map((row, i) => (
            <div key={i} className="flex items-baseline gap-1 text-[8.5px] leading-tight text-slate-700">
              <span className="flex-1 truncate">{row.condition}</span>
              <span aria-hidden className="text-slate-300">→</span>
              <span className="cc-decision-mini shrink-0">
                {row.use ? <SafeMath latex={row.use} inline /> : null}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Poster card — one colored group card ─────────────────────────── */

function PosterCard({
  group,
  number,
  palette,
  onOpenStory,
}: {
  group: Group
  number: number
  palette: Palette
  onOpenStory: (formulas: StoryFormula[], index: number) => void
}) {
  const formulas = group.formulas ?? []
  return (
    <div
      className={`overflow-hidden rounded-lg border ${palette.card} ${palette.border}`}
    >
      <div
        className={`px-1.5 py-0.5 text-center text-[8.5px] font-extrabold uppercase leading-tight tracking-[0.06em] ${palette.headerText} ${palette.headerBar}`}
      >
        {number}. {group.groupTitle ?? 'Group'}
      </div>
      <ol className="space-y-0.5 px-1.5 pb-1.5 pt-1">
        {formulas.map((f, fIdx) => (
          <li key={f.formulaId ?? fIdx}>
            <button
              type="button"
              onClick={() => onOpenStory(formulas, fIdx)}
              data-formula-id={f.formulaId ?? undefined}
              className="group block w-full rounded text-left transition-colors hover:bg-white/70"
            >
              <div className="flex items-baseline gap-1">
                <span
                  className={`mt-px inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full text-[7px] font-bold leading-none text-white ${palette.num}`}
                >
                  {fIdx + 1}
                </span>
                <span className="flex-1 text-[8.5px] font-semibold leading-tight text-slate-800">
                  {f.name}
                </span>
              </div>
              {f.latex && (
                <div className="cc-poster-formula pl-3.5 leading-none text-slate-700">
                  <SafeMath latex={f.latex} fallback={f.plain} inline />
                </div>
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ─── Shared styles ────────────────────────────────────────────────── */

function FormulaSheetStyles() {
  return (
    <style jsx global>{`
      /* Poster: ultra-compact KaTeX so formulas fit inside the small cards */
      .poster .cc-poster-formula .katex {
        font-size: 0.72em;
        line-height: 1;
      }
      .poster .cc-poster-formula {
        overflow: hidden;
        white-space: nowrap;
      }
      .poster .cc-decision-mini .katex {
        font-size: 0.68em;
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
