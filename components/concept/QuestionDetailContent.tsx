'use client'

/**
 * QuestionDetailContent — renders the rich question body (stem, options,
 * Understand / Given / Step-by-step solution) for a single question.
 *
 * Shared between the standalone /gate/questions/.../[questionId] page
 * and the in-drawer accordion on the formula sheet. The component is
 * self-contained: it fetches the formulas-info map on mount so the
 * inline formula links in step headings show hover-card previews.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { enhanceSvgMath } from '@/lib/svg-math'
import { AsciiMath, SmartText } from '@/components/concept/SmartText'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'

/* ─── Types ─────────────────────────────────────────────────────────── */

interface FormulaUsed {
  formulaId: string
  name: string
  plain: string
  termsExplained: string[]
}
interface SolutionStep {
  step: number
  title: string
  formula_id: string
  formula_raw: string
  apply: string
  note: string
}
interface Solution {
  steps: SolutionStep[]
  result: string
}
interface Keyword { term: string; explain: string; example: string }
interface Understand {
  plain: string
  keywords: Keyword[]
  visual_svg: string
  visual_alt: string
}
interface GivenTerm {
  term: string
  meaning: string
  example: string
  connects: string
}
interface Given {
  aim: string
  terms: GivenTerm[]
  plan: string
}

export interface QuestionDoc {
  _id: string
  id?: string
  meta?: {
    exam?: string
    year?: number
    marks?: number
    difficulty?: string
    type?: string
    subject?: string
    topic?: string
    subtopic?: string
  }
  question?: string
  answer?: string
  understand?: Understand
  given?: Given
  to_find?: string
  solution?: Solution
  formula_ids_used?: string[]
  formula_note?: string
  // flattened by enrichQuestion
  questionText?: string
  correctAnswer?: string
  questionType?: string
  year?: number
  marks?: number
  difficulty?: string
  formulaIds?: string[]
}

type FormulaInfoMap = Record<
  string,
  { name?: string; latex?: string; plain?: string }
>

/* ─── Helpers ───────────────────────────────────────────────────────── */

function formulaIdToName(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Patch an inline SVG so its full content renders correctly. */
function prepSvg(raw: string | undefined | null): string {
  if (!raw) return ''
  let svg = raw
  const openMatch = svg.match(/<svg\b[^>]*>/i)
  if (!openMatch) return svg
  let openTag = openMatch[0]
  openTag = openTag.replace(/\s(width|height)="[^"]*"/gi, '')
  openTag = openTag.replace(
    /\bviewBox=(['"])([^'"]+)\1/i,
    (_full, q, vb: string) => {
      const parts = vb.trim().split(/[\s,]+/).map(Number)
      if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
        return `viewBox=${q}${vb}${q}`
      }
      const [minX, minY, w, h] = parts
      const padX = w * 0.06
      const padY = h * 0.04
      const next = [minX - padX, minY - padY, w + padX * 2, h + padY * 2]
        .map((n) => +n.toFixed(2))
        .join(' ')
      return `viewBox=${q}${next}${q}`
    }
  )
  if (!/\soverflow=/i.test(openTag)) {
    openTag = openTag.replace(/<svg\b/i, `<svg overflow="visible"`)
  }
  if (!/\spreserveAspectRatio=/i.test(openTag)) {
    openTag = openTag.replace(
      /<svg\b/i,
      `<svg preserveAspectRatio="xMidYMid meet"`
    )
  }
  return svg.replace(/<svg\b[^>]*>/i, openTag)
}

/** Split inline MCQ/MSQ options out of a question stem. */
function splitInlineOptions(text: string): { stem: string; options: string[] } {
  const re = /(?:^|\s)([A-F])\.\s/g
  const found: { letter: string; idx: number; afterMarker: number }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const letterIdx = m.index + (m[0].startsWith(' ') ? 1 : 0)
    found.push({ letter: m[1], idx: letterIdx, afterMarker: re.lastIndex })
  }
  if (found.length < 2) return { stem: text, options: [] }
  const EXPECTED = ['A', 'B', 'C', 'D', 'E', 'F']
  for (let start = found.length - 1; start >= 0; start--) {
    if (found[start].letter !== 'A') continue
    const seq = [found[start]]
    for (let j = start + 1; j < found.length; j++) {
      if (found[j].letter === EXPECTED[seq.length]) seq.push(found[j])
    }
    if (seq.length < 2) continue
    const stem = text.slice(0, seq[0].idx).trim()
    const options: string[] = []
    for (let i = 0; i < seq.length; i++) {
      const s = seq[i].afterMarker
      const e = i + 1 < seq.length ? seq[i + 1].idx : text.length
      options.push(text.slice(s, e).trim())
    }
    return { stem, options }
  }
  return { stem: text, options: [] }
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

/* ─── Component ─────────────────────────────────────────────────────── */

export default function QuestionDetailContent({
  question,
  formulaInfoMap: externalInfoMap,
}: {
  question: QuestionDoc
  /** Optional — if not provided, the component fetches the global map. */
  formulaInfoMap?: FormulaInfoMap
}) {
  const [fetchedInfo, setFetchedInfo] = useState<FormulaInfoMap | null>(null)
  useEffect(() => {
    if (externalInfoMap) return
    fetch('/api/formulas/info')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setFetchedInfo(data ?? {}))
      .catch(() => setFetchedInfo({}))
  }, [externalInfoMap])
  const formulaInfoMap = externalInfoMap ?? fetchedInfo ?? {}

  const questionType = question.questionType ?? question.meta?.type ?? ''
  const questionText = question.questionText ?? question.question ?? ''
  const answer = String(question.correctAnswer ?? question.answer ?? '')

  const isChoice = ['MCQ', 'MSQ'].includes(questionType.toUpperCase())
  const { stem, options } = isChoice
    ? splitInlineOptions(questionText)
    : { stem: questionText, options: [] as string[] }
  const correctLetter = answer.trim().toUpperCase()

  return (
    <div className="text-foreground">
      {/* Stem */}
      <div className="text-[16px] leading-7 sm:text-[17px]">
        <SmartText text={stem} />
      </div>

      {/* Options */}
      {options.length > 0 && (
        <ol className="mt-5 space-y-2.5">
          {options.map((opt, i) => {
            const letter = OPTION_LABELS[i]
            const isCorrect = letter === correctLetter
            return (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {letter}
                </span>
                <span
                  className={`flex-1 text-[15.5px] leading-7 ${
                    isCorrect ? 'font-semibold text-emerald-800' : 'text-foreground/90'
                  }`}
                >
                  <SmartText text={opt} />
                </span>
              </li>
            )
          })}
        </ol>
      )}

      {/* ─── 1. Understand ──────────────────────────────────────────── */}
      {question.understand && (
        <section className="mt-8">
          <NumberedHeading number={1} title="Understand" />
          {question.understand.plain && (
            <p className="mt-3 text-[15.5px] leading-[1.7] text-foreground/90">
              <SmartText text={question.understand.plain} />
            </p>
          )}
          {question.understand.visual_svg && (
            <figure className="mt-5 flex justify-center">
              <SvgVisual
                svg={question.understand.visual_svg}
                alt={question.understand.visual_alt}
                maxWidth="30rem"
              />
            </figure>
          )}
          {question.understand.keywords?.length ? (
            <dl className="mt-5 space-y-1.5 text-[14px] leading-[1.6] text-foreground/80">
              {question.understand.keywords.map((kw, i) => (
                <div key={i} className="flex flex-wrap items-baseline gap-x-1.5">
                  <dt className="font-bold text-foreground">{kw.term}</dt>
                  <dd className="text-muted-foreground/70">=</dd>
                  <dd className="flex-1">
                    {kw.explain}
                    {kw.example && (
                      <span className="text-muted-foreground/70"> ({kw.example})</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      )}

      {/* ─── 2. Given ──────────────────────────────────────────────── */}
      {question.given && (
        <section className="mt-8">
          <NumberedHeading number={2} title="Given" />
          {question.given.aim && (
            <p className="mt-3 text-[14.5px] leading-[1.6] text-foreground/80">
              <span className="font-semibold text-foreground">Goal: </span>
              {question.given.aim}
            </p>
          )}
          {question.given.terms?.length ? (
            <div className="mt-4 -mx-2 overflow-x-auto sm:mx-0">
              <table className="w-full min-w-[480px] border-collapse text-left text-[13.5px] leading-[1.5] sm:text-[14px]">
                <thead>
                  <tr className="border-b border-border text-[12px] font-bold text-foreground">
                    <th className="px-2 py-2 sm:px-3">Term</th>
                    <th className="px-2 py-2 sm:px-3">Meaning</th>
                    <th className="px-2 py-2 sm:px-3">Example</th>
                    <th className="px-2 py-2 sm:px-3">In simple words</th>
                  </tr>
                </thead>
                <tbody className="text-foreground/80">
                  {question.given.terms.map((t, i) => (
                    <tr key={i} className="border-b border-border/60 align-top">
                      <td className="px-2 py-2.5 sm:px-3">
                        <span className="font-bold text-foreground">
                          <SmartText text={t.term} />
                        </span>
                      </td>
                      <td className="px-2 py-2.5 sm:px-3">
                        <SmartText text={t.meaning} />
                      </td>
                      <td className="px-2 py-2.5 text-muted-foreground sm:px-3">
                        <SmartText text={t.example ?? ''} />
                      </td>
                      <td className="px-2 py-2.5 sm:px-3">
                        <SmartText text={t.connects} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {question.given.plan && (
            <p className="mt-4 border-l-2 border-border pl-3 text-[13.5px] leading-[1.6] italic text-muted-foreground">
              <span className="font-bold not-italic text-foreground/90">Plan: </span>
              {question.given.plan}
            </p>
          )}
          {question.to_find && (
            <p className="mt-3 text-[14.5px] leading-[1.6] text-foreground/90">
              <span className="font-bold text-foreground">To find: </span>
              <SmartText text={question.to_find} />
            </p>
          )}
        </section>
      )}

      {/* ─── 3. Step-by-step solution ──────────────────────────────── */}
      {question.solution && question.solution.steps?.length ? (
        <section className="mt-8">
          <NumberedHeading number={3} title="Step-by-step solution" />
          <div className="mt-4 space-y-6">
            {question.solution.steps.map((step) => {
              const fName = step.formula_id
                ? formulaInfoMap[step.formula_id]?.name ??
                  formulaIdToName(step.formula_id)
                : null
              return (
                <div key={step.step}>
                  <h3 className="text-[15px] font-bold leading-[1.45] text-foreground sm:text-[16px]">
                    Step {step.step}
                    <span className="mx-1.5 text-muted-foreground/70">—</span>
                    <SmartText text={step.title} />
                    {fName && (
                      <span className="text-muted-foreground">
                        {' '}({step.formula_id ? (
                          <FormulaInlineLink
                            formulaId={step.formula_id}
                            name={fName}
                            info={formulaInfoMap[step.formula_id]}
                          />
                        ) : fName})
                      </span>
                    )}
                  </h3>
                  {(step.formula_raw || step.apply) && (
                    <div className="mt-2.5 overflow-x-auto rounded-md bg-muted/40 px-3.5 py-2.5 text-[13px] leading-[1.85] text-foreground/90 ring-1 ring-border sm:text-[14px]">
                      {step.formula_raw && (
                        <div className="flex items-center gap-3">
                          <span className="w-[48px] shrink-0 select-none font-mono text-[12px] text-muted-foreground/70">
                            Raw:
                          </span>
                          <span className="flex-1">
                            <AsciiMath text={step.formula_raw} />
                          </span>
                        </div>
                      )}
                      {step.apply && (
                        <div className="flex items-center gap-3">
                          <span className="w-[48px] shrink-0 select-none font-mono text-[12px] text-muted-foreground/70">
                            Apply:
                          </span>
                          <span className="flex-1 text-foreground">
                            <AsciiMath text={step.apply} />
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  {step.note && (
                    <p className="mt-2.5 text-[13px] leading-[1.6] text-muted-foreground">
                      ({step.note})
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          {question.solution.result && (
            <div className="mt-6">
              <h3 className="text-[15px] font-bold text-foreground sm:text-[16px]">
                Result
              </h3>
              <div className="mt-1.5 overflow-x-auto rounded-md bg-muted/40 px-3.5 py-3 text-[15px] font-semibold leading-[1.6] text-foreground ring-1 ring-border sm:text-[16px]">
                <AsciiMath text={question.solution.result} />
              </div>
            </div>
          )}
        </section>
      ) : null}

      {question.formula_note && question.formula_note.trim() !== '' && (
        <p className="mt-5 text-[12.5px] italic text-slate-500">
          Note: {question.formula_note}
        </p>
      )}
    </div>
  )
}

/* ─── SVG visual: inline SVG + post-render KaTeX enhancement ────────── */

function SvgVisual({
  svg,
  alt,
}: {
  svg: string
  alt?: string
  /** @deprecated kept for backwards-compat — sizing now flows from Tailwind */
  maxWidth?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const html = prepSvg(svg)

  useEffect(() => {
    if (!ref.current) return
    const run = () => {
      if (ref.current) enhanceSvgMath(ref.current)
    }
    const id = requestAnimationFrame(run)
    window.addEventListener('resize', run)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', run)
    }
  }, [html])

  return (
    <div
      ref={ref}
      className="svg-visual-container w-full max-w-full overflow-x-auto rounded-xl bg-[#f5efe1] px-4 py-5 ring-1 ring-[#d6c8a6]/70 sm:max-w-[34rem] sm:px-6 sm:py-7 lg:max-w-[40rem]"
      role="img"
      aria-label={alt || 'Visual diagram'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/* ─── Section heading ───────────────────────────────────────────────── */

function NumberedHeading({ number, title }: { number: number; title: string }) {
  return (
    <h2 className="text-[17px] font-bold leading-[1.3] text-foreground sm:text-[18px]">
      {number}. {title}
    </h2>
  )
}

/* ─── Inline formula link with hover preview ────────────────────────── */

function FormulaInlineLink({
  formulaId,
  name,
  info,
}: {
  formulaId: string
  name: string
  info?: { name?: string; latex?: string; plain?: string }
}) {
  return (
    <HoverCard openDelay={80} closeDelay={120}>
      <HoverCardTrigger asChild>
        <Link
          href={`/gate/questions?formula=${encodeURIComponent(formulaId)}`}
          className="font-normal text-indigo-600 underline-offset-4 hover:underline"
        >
          {name}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto min-w-[14rem] max-w-sm" side="top">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-indigo-700">
          {info?.name ?? name}
        </div>
        <div className="mt-1.5 overflow-x-auto rounded-md bg-slate-50 px-3 py-2 text-center text-[15px] text-foreground">
          {info?.latex ? (
            <InlineMath math={info.latex} />
          ) : (
            <span className="font-mono text-[13px] text-foreground/80">
              {info?.plain ?? '—'}
            </span>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
