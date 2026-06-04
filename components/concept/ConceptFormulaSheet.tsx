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
import FormulaQuestionsDrawer from './FormulaQuestionsDrawer'

// Shape of formula objects passed to the questions drawer
type DrawerFormula = {
  formulaId?: string
  name?: string
  latex?: string
  plain?: string
}

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

// Light mode = original pastel poster look.
// Dark mode  = same hue family but translucent on the dark backdrop, with
// brighter 300-weight text so each card still reads color-coded.
const POSTER_PALETTES: Palette[] = [
  { card: 'bg-blue-50 dark:bg-blue-500/[0.08]',       border: 'border-blue-200 dark:border-blue-500/20',       headerText: 'text-blue-800 dark:text-blue-300',       headerBar: 'bg-blue-100 dark:bg-blue-500/15',       num: 'bg-blue-500',    accent: 'text-blue-600 dark:text-blue-300' },
  { card: 'bg-orange-50 dark:bg-orange-500/[0.08]',   border: 'border-orange-200 dark:border-orange-500/20',   headerText: 'text-orange-800 dark:text-orange-300',   headerBar: 'bg-orange-100 dark:bg-orange-500/15',   num: 'bg-orange-500',  accent: 'text-orange-600 dark:text-orange-300' },
  { card: 'bg-emerald-50 dark:bg-emerald-500/[0.08]', border: 'border-emerald-200 dark:border-emerald-500/20', headerText: 'text-emerald-800 dark:text-emerald-300', headerBar: 'bg-emerald-100 dark:bg-emerald-500/15', num: 'bg-emerald-500', accent: 'text-emerald-600 dark:text-emerald-300' },
  { card: 'bg-amber-50 dark:bg-amber-500/[0.08]',     border: 'border-amber-200 dark:border-amber-500/20',     headerText: 'text-amber-800 dark:text-amber-300',     headerBar: 'bg-amber-100 dark:bg-amber-500/15',     num: 'bg-amber-500',   accent: 'text-amber-600 dark:text-amber-300' },
  { card: 'bg-rose-50 dark:bg-rose-500/[0.08]',       border: 'border-rose-200 dark:border-rose-500/20',       headerText: 'text-rose-800 dark:text-rose-300',       headerBar: 'bg-rose-100 dark:bg-rose-500/15',       num: 'bg-rose-500',    accent: 'text-rose-600 dark:text-rose-300' },
  { card: 'bg-violet-50 dark:bg-violet-500/[0.08]',   border: 'border-violet-200 dark:border-violet-500/20',   headerText: 'text-violet-800 dark:text-violet-300',   headerBar: 'bg-violet-100 dark:bg-violet-500/15',   num: 'bg-violet-500',  accent: 'text-violet-600 dark:text-violet-300' },
  { card: 'bg-sky-50 dark:bg-sky-500/[0.08]',         border: 'border-sky-200 dark:border-sky-500/20',         headerText: 'text-sky-800 dark:text-sky-300',         headerBar: 'bg-sky-100 dark:bg-sky-500/15',         num: 'bg-sky-500',     accent: 'text-sky-600 dark:text-sky-300' },
  { card: 'bg-pink-50 dark:bg-pink-500/[0.08]',       border: 'border-pink-200 dark:border-pink-500/20',       headerText: 'text-pink-800 dark:text-pink-300',       headerBar: 'bg-pink-100 dark:bg-pink-500/15',       num: 'bg-pink-500',    accent: 'text-pink-600 dark:text-pink-300' },
  { card: 'bg-teal-50 dark:bg-teal-500/[0.08]',       border: 'border-teal-200 dark:border-teal-500/20',       headerText: 'text-teal-800 dark:text-teal-300',       headerBar: 'bg-teal-100 dark:bg-teal-500/15',       num: 'bg-teal-500',    accent: 'text-teal-600 dark:text-teal-300' },
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

  // Questions drawer state — shared across all groups so each tap can
  // open a left-side drawer listing the questions for that formula.
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerFormulas, setDrawerFormulas] = useState<DrawerFormula[]>([])
  const [drawerIndex, setDrawerIndex] = useState(0)
  const openDrawer = (formulas: DrawerFormula[], index: number) => {
    setDrawerFormulas(formulas)
    setDrawerIndex(index)
    setDrawerOpen(true)
  }

  // Always 2 columns for the poster grid — keeps the 9:16 layout dense
  // and readable. Larger group counts simply stack into more rows.
  const numCols = 2

  const Poster = (
    <div
      className="poster mx-auto flex w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-card shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)] ring-1 ring-border dark:ring-transparent dark:shadow-none"
    >
      {/* ── Banner ─────────────────────────────────────────────────── */}
      <div className="relative shrink-0 bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-100 dark:from-indigo-500/15 dark:via-sky-500/10 dark:to-blue-500/15 px-3 py-2 text-center">
        <h1
          className="text-balance text-[1.35rem] font-extrabold leading-[1.05] text-indigo-900 dark:text-indigo-200"
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
                onOpenStory={openDrawer}
                questionCounts={questionCounts}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/60 bg-muted/40 px-3 py-1.5 text-[9px] font-medium text-muted-foreground dark:border-transparent">
        <span>
          {groupList.length} groups · {totalFormulas} formulas
        </span>
        <span className="italic">Tap any formula for details</span>
      </div>
    </div>
  )

  const StoryHost = (
    <FormulaQuestionsDrawer
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
      formulas={drawerFormulas}
      startIndex={drawerIndex}
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
    <div className="min-h-screen bg-background">
      <article className="mx-auto max-w-[480px] px-3 py-3 sm:px-5 sm:py-5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        <div className="mt-3">{Poster}</div>
        {reference && (
          <p className="mt-3 text-center text-[10.5px] italic text-muted-foreground/70">
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
    <div className="shrink-0 border-y border-border/60 bg-muted/40 px-2.5 py-1.5 dark:border-transparent">
      <div className="text-center text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {title || 'Which formula do I use?'}
      </div>
      {map && map.length > 0 && (
        <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
          {map.map((row, i) => (
            <div key={i} className="flex items-baseline gap-1 text-[8.5px] leading-tight text-foreground/80">
              <span className="flex-1 truncate">{row.condition}</span>
              <span aria-hidden className="text-muted-foreground/60">→</span>
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

/* ─── Length-aware sizing for poster formulas ───────────────────────── */
// Short formulas keep a comfortable, readable size; only the genuinely
// lengthy ones shrink. The unit returned is `em`, multiplied against the
// poster's base font-size by `.cc-poster-formula .katex`.
function posterFormulaSize(
  latex?: string,
  plain?: string
): number {
  const src = (latex && latex.length > 0 ? latex : plain) ?? ''
  // Strip LaTeX command backslashes + braces for a fairer "visible" length
  const visible = src
    .replace(/\\[a-zA-Z]+/g, 'x') // each \cmd → 1 char
    .replace(/[{}]/g, '')
    .trim()
  const n = visible.length
  if (n <= 18) return 0.85   // tiny formulas: big and readable
  if (n <= 28) return 0.72   // medium
  if (n <= 40) return 0.58   // long
  if (n <= 60) return 0.48   // very long
  return 0.4                  // monsters
}

/* ─── Poster card — one colored group card ─────────────────────────── */

function PosterCard({
  group,
  number,
  palette,
  onOpenStory,
  questionCounts,
}: {
  group: Group
  number: number
  palette: Palette
  onOpenStory: (formulas: DrawerFormula[], index: number) => void
  questionCounts: Record<string, number>
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
        {formulas.map((f, fIdx) => {
          const count = f.formulaId ? (questionCounts[f.formulaId] ?? 0) : 0
          return (
            <li key={f.formulaId ?? fIdx}>
              <button
                type="button"
                onClick={() => onOpenStory(formulas, fIdx)}
                data-formula-id={f.formulaId ?? undefined}
                className="group block w-full rounded text-left transition-colors hover:bg-white/70 dark:hover:bg-white/[0.06]"
              >
                <div className="flex items-baseline gap-1">
                  <span
                    className={`mt-px inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full text-[7px] font-bold leading-none text-white ${palette.num}`}
                  >
                    {fIdx + 1}
                  </span>
                  <span className="flex-1 break-words text-[8px] font-semibold leading-tight text-foreground sm:text-[8.5px]">
                    {f.name}
                  </span>
                  {count > 0 && (
                    <span
                      className={`ml-1 shrink-0 rounded-full px-1 py-px text-[7px] font-bold leading-none text-white ${palette.num}`}
                      title={`${count} question${count === 1 ? '' : 's'}`}
                    >
                      {count}
                    </span>
                  )}
                </div>
                {f.latex && (
                  <div
                    className="cc-poster-formula pl-3.5 leading-none text-foreground/80"
                    style={{ fontSize: `${posterFormulaSize(f.latex, f.plain)}em` }}
                  >
                    <SafeMath latex={f.latex} fallback={f.plain} inline />
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ─── Shared styles ────────────────────────────────────────────────── */

function FormulaSheetStyles() {
  return (
    <style jsx global>{`
      /* Poster: KaTeX inherits font-size from .cc-poster-formula (set
         inline per-formula by posterFormulaSize() — short formulas get
         a larger size, lengthy ones shrink down). */
      .poster .cc-poster-formula .katex {
        font-size: inherit;
        line-height: 1.05;
      }
      .poster .cc-poster-formula {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        word-break: break-word;
      }
      /* Cap KaTeX nodes to the column width so they can never bleed past
         the card edge, even if the heuristic underestimates. */
      .poster .cc-poster-formula .katex,
      .poster .cc-poster-formula .katex-html {
        display: inline-block;
        max-width: 100%;
      }
      .poster .cc-decision-mini .katex {
        font-size: 0.6em;
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
        <span className="font-mono text-[12px] text-foreground/80">
          {fallback ?? latex}
        </span>
      )}
    />
  )
}
