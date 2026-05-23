'use client'

/**
 * FormulaStoryDialog — Instagram-story style fullscreen view of a single
 * formula. Progress segments at top (one per formula in the group), swipe
 * or tap-zones to navigate, keyboard arrows + Escape, no scroll.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X, ArrowUpRight, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface Term { symbol?: string; means?: string }
export interface StoryFormula {
  formulaId?: string
  name?: string
  latex?: string
  plain?: string
  whenToUse?: string
  terms?: Term[]
  trap?: string
  reference?: string
}

/* ─── Story themes — strings are literal so Tailwind JIT picks them up ── */

type Theme = {
  gradient: string
  accent: string
  accentSoft: string
  bar: string
  chipBg: string
}

const THEMES: Theme[] = [
  { gradient: 'bg-gradient-to-br from-blue-100 via-blue-50 to-sky-200',
    accent: 'text-blue-900', accentSoft: 'text-blue-800/75',
    bar: 'bg-blue-600', chipBg: 'bg-blue-100/70' },
  { gradient: 'bg-gradient-to-br from-emerald-100 via-green-50 to-teal-200',
    accent: 'text-emerald-900', accentSoft: 'text-emerald-800/75',
    bar: 'bg-emerald-600', chipBg: 'bg-emerald-100/70' },
  { gradient: 'bg-gradient-to-br from-sky-100 via-cyan-50 to-cyan-200',
    accent: 'text-sky-900', accentSoft: 'text-sky-800/75',
    bar: 'bg-sky-600', chipBg: 'bg-sky-100/70' },
  { gradient: 'bg-gradient-to-br from-purple-100 via-purple-50 to-fuchsia-200',
    accent: 'text-purple-900', accentSoft: 'text-purple-800/75',
    bar: 'bg-purple-600', chipBg: 'bg-purple-100/70' },
  { gradient: 'bg-gradient-to-br from-rose-100 via-rose-50 to-pink-200',
    accent: 'text-rose-900', accentSoft: 'text-rose-800/75',
    bar: 'bg-rose-600', chipBg: 'bg-rose-100/70' },
  { gradient: 'bg-gradient-to-br from-amber-100 via-amber-50 to-orange-200',
    accent: 'text-amber-900', accentSoft: 'text-amber-800/75',
    bar: 'bg-amber-600', chipBg: 'bg-amber-100/70' },
  { gradient: 'bg-gradient-to-br from-teal-100 via-teal-50 to-emerald-200',
    accent: 'text-teal-900', accentSoft: 'text-teal-800/75',
    bar: 'bg-teal-600', chipBg: 'bg-teal-100/70' },
  { gradient: 'bg-gradient-to-br from-indigo-100 via-indigo-50 to-violet-200',
    accent: 'text-indigo-900', accentSoft: 'text-indigo-800/75',
    bar: 'bg-indigo-600', chipBg: 'bg-indigo-100/70' },
]

function pickTheme(id: string): Theme {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return THEMES[h % THEMES.length]
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function FormulaStoryDialog({
  open,
  onOpenChange,
  formulas,
  startIndex,
  questionCounts,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  formulas: StoryFormula[]
  startIndex: number
  questionCounts: Record<string, number>
}) {
  const [idx, setIdx] = useState(startIndex)

  useEffect(() => {
    if (open) setIdx(startIndex)
  }, [open, startIndex])

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

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  // Touch swipe
  const touchStartX = useRef<number | null>(null)
  const onTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: ReactTouchEvent) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
    touchStartX.current = null
  }

  if (!formulas.length) return null
  const current = formulas[Math.min(idx, formulas.length - 1)] ?? formulas[0]
  const themeKey = current.formulaId ?? current.name ?? String(idx)
  const theme = pickTheme(themeKey)
  const count = current.formulaId ? (questionCounts[current.formulaId] ?? 0) : 0

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${theme.gradient}`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <DialogPrimitive.Title className="sr-only">
            {current.name ?? 'Formula'}
          </DialogPrimitive.Title>

          {/* Progress segments */}
          <div className="z-20 flex gap-1 px-4 pt-3 sm:px-8 sm:pt-4">
            {formulas.map((_, i) => (
              <div
                key={i}
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/40"
              >
                <div
                  className={`h-full rounded-full ${theme.bar} transition-all duration-300`}
                  style={{ width: i < idx ? '100%' : i === idx ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Top bar */}
          <div className="z-20 flex items-center justify-between px-4 pb-1 pt-2 sm:px-8">
            <span
              className={`text-[11px] font-bold uppercase tracking-[0.18em] ${theme.accent} opacity-60`}
            >
              {idx + 1} / {formulas.length}
            </span>
            <DialogPrimitive.Close
              className="rounded-full bg-white/50 p-2 text-slate-700 backdrop-blur-md transition hover:bg-white/80"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>

          {/* Tap zones (left/right thirds) — pointer-events-auto, no UI */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            disabled={idx === 0}
            className="absolute bottom-0 left-0 top-16 z-10 w-1/3 cursor-w-resize disabled:cursor-default"
          />
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            disabled={idx === formulas.length - 1}
            className="absolute bottom-0 right-0 top-16 z-10 w-1/3 cursor-e-resize disabled:cursor-default"
          />

          {/* Side hint arrows (very subtle) */}
          {idx > 0 && (
            <div className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 ${theme.accent} opacity-30 sm:left-6`}>
              <ChevronLeft className="h-7 w-7" />
            </div>
          )}
          {idx < formulas.length - 1 && (
            <div className={`pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 ${theme.accent} opacity-30 sm:right-6`}>
              <ChevronRight className="h-7 w-7" />
            </div>
          )}

          {/* Content — centered, no scroll */}
          <div className="relative z-0 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-5 px-8 pb-10 pt-4 sm:gap-7 sm:px-12">
            <h2
              className={`text-balance text-center text-[2.2rem] font-extrabold leading-[1.05] ${theme.accent} sm:text-[3rem]`}
              style={{ fontFamily: 'var(--font-handwriting), Caveat, cursive' }}
            >
              {current.name}
            </h2>

            {current.latex && (
              <div className={`w-full overflow-hidden text-center ${theme.accent}`}>
                <div className="story-formula">
                  <BlockMath math={current.latex} errorColor="#b91c1c" />
                </div>
              </div>
            )}

            {current.whenToUse && (
              <p
                className={`max-w-xl text-balance text-center text-[15px] leading-relaxed ${theme.accentSoft} sm:text-[17px]`}
              >
                {current.whenToUse}
              </p>
            )}

            {current.terms && current.terms.length > 0 && (
              <div className="w-full max-w-md">
                <p
                  className={`mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] ${theme.accent} opacity-50`}
                >
                  Where
                </p>
                <dl className={`mx-auto grid gap-y-1 ${current.terms.length > 3 ? 'sm:grid-cols-2 sm:gap-x-6' : ''}`}>
                  {current.terms.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-baseline gap-2 text-[13px] sm:text-[14px]"
                    >
                      <dt className={`shrink-0 ${theme.accent}`}>
                        {t.symbol ? <InlineMath math={t.symbol} /> : '?'}
                      </dt>
                      <dd className={`${theme.accentSoft} opacity-60`}>=</dd>
                      <dd className={`flex-1 ${theme.accentSoft}`}>{t.means}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {current.trap && (
              <div className="w-full max-w-xl rounded-2xl bg-white/55 p-4 backdrop-blur-md">
                <div className="flex items-start gap-2 text-[13px] sm:text-[14px]">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                    strokeWidth={2.5}
                  />
                  <div>
                    <span className="font-bold text-amber-900">Watch out: </span>
                    <span className="text-amber-900/80">{current.trap}</span>
                  </div>
                </div>
              </div>
            )}

            {current.formulaId && count > 0 && (
              <Link
                href={`/gate/questions?formula=${encodeURIComponent(current.formulaId)}`}
                onClick={(e) => e.stopPropagation()}
                className={`z-20 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-5 py-2 text-[13px] font-bold backdrop-blur-md transition hover:bg-white sm:text-[14px] ${theme.accent}`}
              >
                Practice {count} question{count !== 1 ? 's' : ''}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}

            {current.reference && (
              <p className={`text-center text-[10px] italic ${theme.accentSoft} opacity-50`}>
                {current.reference}
              </p>
            )}
          </div>

          <style jsx global>{`
            .story-formula .katex { font-size: 2em; }
            @media (min-width: 640px) {
              .story-formula .katex { font-size: 2.6em; }
            }
            .story-formula .katex-display { margin: 0; overflow-x: auto; overflow-y: hidden; }
            .story-formula .katex-display::-webkit-scrollbar { display: none; }
          `}</style>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
