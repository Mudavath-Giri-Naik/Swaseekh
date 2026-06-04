'use client'

/**
 * FormulaQuestionsDrawer — left-side drawer that lists every question
 * tagged with a given formula. Users can:
 *   - Expand any question (single-open accordion) to read its full
 *     understand / given / step-by-step content inline.
 *   - Page through formulas in the same group with prev/next.
 *   - Toggle the drawer to fullscreen.
 *   - Tap anywhere on the blurred backdrop or hit the X to close.
 *
 * Replaces the older Instagram-story dialog.
 */

import { useCallback, useEffect, useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'
import QuestionDetailContent, {
  type QuestionDoc,
} from './QuestionDetailContent'

/* ─── Types ─────────────────────────────────────────────────────────── */

interface DrawerFormula {
  formulaId?: string
  name?: string
  latex?: string
  plain?: string
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  formulas: DrawerFormula[]
  startIndex: number
  questionCounts: Record<string, number>
}

/* ─── Component ─────────────────────────────────────────────────────── */

export default function FormulaQuestionsDrawer({
  open,
  onOpenChange,
  formulas,
  startIndex,
  questionCounts,
}: Props) {
  const [idx, setIdx] = useState(startIndex)
  const [fullscreen, setFullscreen] = useState(false)
  const [openQid, setOpenQid] = useState<string | null>(null)

  // Per-formula cache of fetched questions
  const [questionsByFormula, setQuestionsByFormula] = useState<
    Record<string, QuestionDoc[]>
  >({})
  const [loading, setLoading] = useState(false)

  // Reset index + collapse state when the drawer opens
  useEffect(() => {
    if (open) {
      setIdx(startIndex)
      setOpenQid(null)
    }
  }, [open, startIndex])

  // Reset accordion when formula changes
  useEffect(() => {
    setOpenQid(null)
  }, [idx])

  const current = formulas[idx]
  const formulaId = current?.formulaId
  const questions = formulaId ? (questionsByFormula[formulaId] ?? []) : []

  // Fetch questions for the active formula on demand
  useEffect(() => {
    if (!open || !formulaId) return
    if (questionsByFormula[formulaId]) return
    setLoading(true)
    fetch(`/api/questions?formula=${encodeURIComponent(formulaId)}&limit=500`)
      .then((res) => (res.ok ? res.json() : { questions: [] }))
      .then((data) => {
        setQuestionsByFormula((prev) => ({
          ...prev,
          [formulaId]: (data.questions ?? []) as QuestionDoc[],
        }))
      })
      .catch(() => {
        setQuestionsByFormula((prev) => ({ ...prev, [formulaId]: [] }))
      })
      .finally(() => setLoading(false))
  }, [open, formulaId, questionsByFormula])

  const go = useCallback(
    (delta: number) => {
      setIdx((i) => {
        const next = i + delta
        if (next < 0 || next >= formulas.length) return i
        return next
      })
    },
    [formulas.length]
  )

  // Keyboard nav: ← → for formulas, Esc handled by Drawer itself
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  if (!current) return null
  const count = formulaId ? (questionCounts[formulaId] ?? 0) : 0

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="left"
      shouldScaleBackground={false}
    >
      <DrawerContent
        // Blurred backdrop is on the overlay; widen content + animate
        className={`flex flex-col overflow-hidden bg-white p-0 shadow-2xl transition-[max-width] duration-300 ease-out ${
          fullscreen
            ? '!max-w-none sm:!max-w-none'
            : 'sm:!max-w-xl md:!max-w-2xl lg:!max-w-3xl'
        }`}
      >
        <DrawerTitle className="sr-only">
          {current.name ?? 'Formula questions'}
        </DrawerTitle>

        {/* ── Top bar: nav + fullscreen + close ─────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-3 py-2 sm:px-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={idx === 0}
              aria-label="Previous formula"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {idx + 1} / {formulas.length}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={idx === formulas.length - 1}
              aria-label="Next formula"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFullscreen((v) => !v)}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Formula header: name + LaTeX + count ──────────────────── */}
        <header className="shrink-0 border-b border-slate-100 bg-gradient-to-br from-indigo-50/60 to-white px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-balance text-[20px] font-extrabold leading-tight tracking-[-0.01em] text-slate-900 sm:text-[24px]">
            {current.name ?? 'Formula'}
          </h2>
          {current.latex ? (
            <div className="mt-3 overflow-x-auto rounded-md bg-white px-3 py-2 text-center text-[15px] text-slate-900 ring-1 ring-slate-200 sm:text-[17px]">
              <InlineMath math={current.latex} />
            </div>
          ) : current.plain ? (
            <div className="mt-3 rounded-md bg-white px-3 py-2 text-center font-mono text-[13.5px] text-slate-800 ring-1 ring-slate-200">
              {current.plain}
            </div>
          ) : null}
          <div className="mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {count > 0
              ? `${count} question${count === 1 ? '' : 's'}`
              : 'No linked questions'}
          </div>
        </header>

        {/* ── Question list — single-open accordion ─────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
          {loading && (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
            </div>
          )}

          {!loading && questions.length === 0 && (
            <p className="py-12 text-center text-[14px] text-slate-500">
              No questions are tagged with this formula yet.
            </p>
          )}

          {!loading && questions.length > 0 && (
            <ul className="space-y-2">
              {questions.map((q, qi) => {
                const isOpen = openQid === q._id
                const meta = q.meta ?? {}
                const stemText =
                  (q.questionText ?? q.question ?? '').slice(0, 200)
                return (
                  <li
                    key={q._id}
                    className={`overflow-hidden rounded-lg border transition-colors ${
                      isOpen
                        ? 'border-indigo-300 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Collapsible
                      open={isOpen}
                      onOpenChange={(o) => setOpenQid(o ? q._id : null)}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="flex w-full items-start gap-3 px-3 py-2.5 text-left sm:px-4 sm:py-3"
                        >
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                            {qi + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                              <span className="text-slate-700">
                                GATE {meta.year ?? q.year}
                              </span>
                              <span>·</span>
                              <span>{meta.difficulty ?? q.difficulty}</span>
                              <span>·</span>
                              <span>{meta.type ?? q.questionType}</span>
                              <span>·</span>
                              <span>
                                {(meta.marks ?? q.marks ?? 0)} mark
                                {(meta.marks ?? q.marks ?? 0) > 1 ? 's' : ''}
                              </span>
                            </span>
                            <span
                              className={`mt-0.5 block text-[14px] leading-snug ${
                                isOpen
                                  ? 'font-semibold text-slate-900'
                                  : 'text-slate-700 line-clamp-2'
                              }`}
                            >
                              {stemText}
                              {stemText.length === 200 ? '…' : ''}
                            </span>
                          </span>
                          <ChevronDown
                            className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t border-slate-200/80 bg-white px-3 py-4 sm:px-5 sm:py-5">
                          <QuestionDetailContent question={q} />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
