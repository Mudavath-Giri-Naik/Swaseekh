'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Check,
  Info,
} from 'lucide-react'
import { slugify, cn } from '@/lib/utils'
import FormulaBadge from '@/components/concept/FormulaBadge'
import { enhanceSvgMath } from '@/lib/svg-math'
import { AsciiMath, SmartText } from '@/components/concept/SmartText'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import 'katex/dist/katex.min.css'
import { InlineMath } from 'react-katex'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

/* ─── Types matching the new schema ─────────────────────────────── */

interface Keyword {
  term: string
  explain: string
  example: string
}

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

interface QuestionMeta {
  exam: string
  year: number
  marks: number
  difficulty: string
  type: string
  subject: string
  topic: string
  subtopic: string
}

interface QuestionDetail {
  _id: string
  id?: string
  meta: QuestionMeta
  question: string
  answer: string
  understand?: Understand
  given?: Given
  to_find?: string
  solution?: Solution
  formula_ids_used?: string[]
  formula_note?: string

  // Flattened by enrichQuestion()
  year?: number
  marks?: number
  difficulty?: string
  questionType?: string
  questionText?: string
  correctAnswer?: string
  formulaId?: string | null
  formulaIds?: string[]
  subjectName?: string
  topicName?: string
  conceptName?: string
}

/** Turn a formulaId like "product-rule" into "Product Rule" */
function formulaIdToName(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Pre-process an inline SVG string so it always renders its full content:
 *   1. Strip any inline `width=` / `height=` attributes so our CSS controls
 *      sizing (without them clashing).
 *   2. Add `overflow="visible"` + `preserveAspectRatio="xMidYMid meet"` so
 *      labels drawn just past the viewBox edge remain visible instead of
 *      being clipped by the SVG box.
 *   3. Pad the viewBox by ~6% horizontally and ~4% vertically so long
 *      text labels (e.g. captions wider than the diagram itself) have
 *      breathing room inside the displayed area.
 */
function prepSvg(raw: string | undefined | null): string {
  if (!raw) return ''
  let svg = raw

  // Match the opening <svg ...> tag and operate on it.
  const openMatch = svg.match(/<svg\b[^>]*>/i)
  if (!openMatch) return svg
  let openTag = openMatch[0]

  // Strip fixed width/height
  openTag = openTag.replace(/\s(width|height)="[^"]*"/gi, '')

  // Pad the viewBox a bit so labels just outside it stay visible
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
      const next = [
        minX - padX,
        minY - padY,
        w + padX * 2,
        h + padY * 2,
      ]
        .map((n) => +n.toFixed(2))
        .join(' ')
      return `viewBox=${q}${next}${q}`
    }
  )

  // Force overflow + preserveAspectRatio
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

/**
 * Pull inline MCQ/MSQ options out of a question stem like
 *   "... How many? A. n! B. C(n,2k) C. ... D. ..."
 * Returns the stem with the options stripped + the option strings in order.
 * Falls back to `{ stem: text, options: [] }` when no valid A→B→C sequence
 * is detected (prevents false matches on things like "1. A. block first").
 */
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
  // Walk from each A-occurrence (latest first) and grow the longest
  // contiguous A,B,C,… sequence; pick the first start that yields ≥2 opts.
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

interface SubjectLite {
  _id: string
  name: string
}

/* ─── Page ──────────────────────────────────────────────────────── */

export default function QuestionDetailPage() {
  const params = useParams<{
    subject: string
    topic: string
    concept: string
    questionId: string
  }>()
  const router = useRouter()

  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAnswer, setShowAnswer] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [subjects, setSubjects] = useState<SubjectLite[]>([])
  const [siblings, setSiblings] = useState<{ _id: string }[]>([])
  // Formula info ({ name, latex, plain } per formulaId) for hover preview
  const [formulaInfoMap, setFormulaInfoMap] = useState<
    Record<string, { name?: string; latex?: string; plain?: string }>
  >({})

  /* Fetch the question itself */
  useEffect(() => {
    if (!params.questionId) return
    setLoading(true)
    setShowAnswer(false)
    setDrawerOpen(false)

    fetch(`/api/questions/${params.questionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.question) setQuestion(data.question)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.questionId])

  /* Fetch all subjects (for the Subject dropdown) */
  useEffect(() => {
    fetch('/api/subjects')
      .then((res) => res.json())
      .then((data) => setSubjects(data.subjects || []))
      .catch(() => {})
  }, [])

  /* Fetch sibling questions (same topic/subtopic for prev/next nav).
     New schema: filter by meta.topic which maps to conceptName. */
  useEffect(() => {
    if (!question?.meta?.topic) return
    fetch(`/api/questions?topic=${encodeURIComponent(question.meta.topic)}&limit=500`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.questions)) {
          setSiblings(
            data.questions.map((q: { _id: string }) => ({ _id: q._id }))
          )
        }
      })
      .catch(() => {})
  }, [question?.meta?.topic])

  /* Fetch the global formula info map (id → { name, latex, plain }) once.
     Used to power the hover-card preview on every formula chip on the page. */
  useEffect(() => {
    fetch('/api/formulas/info')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setFormulaInfoMap(data ?? {}))
      .catch(() => {})
  }, [])

  /* Derive prev/next */
  const { prevId, nextId, currentIndex, total } = useMemo(() => {
    if (!question || siblings.length === 0) {
      return { prevId: null, nextId: null, currentIndex: -1, total: 0 }
    }
    const idx = siblings.findIndex((s) => s._id === question._id)
    return {
      prevId: idx > 0 ? siblings[idx - 1]._id : null,
      nextId: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1]._id : null,
      currentIndex: idx,
      total: siblings.length,
    }
  }, [question, siblings])

  /* Navigation helpers */
  const goToQuestion = (qid: string) => {
    router.push(
      `/gate/questions/${params.subject}/${params.topic}/${params.concept}/${qid}`
    )
  }

  /* When the user changes subject dropdown, jump to first matching question */
  const jumpToFirstQuestion = async (
    filter: { subjectId?: string }
  ) => {
    const qs = new URLSearchParams()
    if (filter.subjectId) qs.set('subject', filter.subjectId)
    qs.set('limit', '1')

    try {
      const res = await fetch(`/api/questions?${qs.toString()}`)
      const data = await res.json()
      const first = data?.questions?.[0]
      if (!first) return

      router.push(
        `/gate/questions/${slugify(first.subjectName)}/${slugify(first.topicName)}/${slugify(first.conceptName)}/${first._id}`
      )
    } catch {
      /* swallow */
    }
  }

  /* ─── Loading / not-found ──────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border border-t-slate-700" />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-base text-muted-foreground">Question not found.</p>
        <Link
          href="/gate/questions"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all questions
        </Link>
      </div>
    )
  }

  /* Convenience accessors */
  const meta = question.meta ?? ({} as QuestionMeta)
  const year = question.year ?? meta.year
  const marks = question.marks ?? meta.marks
  const difficulty = question.difficulty ?? meta.difficulty
  const questionType = question.questionType ?? meta.type
  const subjectName = question.subjectName ?? meta.subject ?? ''
  const topicName = question.topicName ?? meta.subtopic ?? ''
  const conceptName = question.conceptName ?? meta.topic ?? ''
  const questionText = question.questionText ?? question.question ?? ''
  const answer = question.correctAnswer ?? question.answer ?? ''
  const formulaIdsUsed = question.formula_ids_used ?? question.formulaIds ?? []

  /* ─── Render ──────────────────────────────────────────────────── */

  return (
    <article className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 sm:pb-16">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-border/60 bg-background/85 px-4 py-2.5 backdrop-blur dark:border-transparent sm:-mx-6 sm:px-6">
        <Link
          href="/gate/questions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All questions
        </Link>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              aria-label="Filter questions"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-md">
              <DrawerHeader>
                <DrawerTitle>Filter questions</DrawerTitle>
                <DrawerDescription>
                  Pick a subject to jump to the first question that matches.
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-4 px-4 pb-2">
                <DrawerOption
                  label="Subject"
                  value={meta.subject}
                  options={subjects.map((s) => ({
                    value: s.name,
                    label: s.name,
                  }))}
                  onChange={(val) => jumpToFirstQuestion({ subjectId: val })}
                />
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border border bg-card text-sm font-medium text-foreground/80 transition-colors hover:bg-accent"
                  >
                    Close
                  </button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Eyebrow meta */}
      <p className="mt-10 text-sm text-muted-foreground">
        {meta.exam || `GATE ${year}`} · {marks} mark
        {marks > 1 ? 's' : ''} · {difficulty} · {questionType}
        {currentIndex >= 0 && total > 0 && (
          <>
            {' · '}
            <span className="font-medium text-foreground/80">
              {currentIndex + 1} / {total}
            </span>
          </>
        )}
      </p>

      {/* H1 — concept/topic title */}
      <h1 className="mt-2 scroll-m-20 text-3xl font-extrabold tracking-tight text-balance text-foreground sm:text-4xl">
        {conceptName}
      </h1>

      {/* Subject / topic breadcrumb */}
      <p className="mt-3 text-base text-muted-foreground sm:text-lg">
        {subjectName} · {topicName}
      </p>

      {/* Formula badges — from formula_ids_used */}
      {formulaIdsUsed.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Formulas
          </span>
          {formulaIdsUsed.map((fId) => {
            const info = formulaInfoMap[fId]
            const name = info?.name ?? formulaIdToName(fId)
            return (
              <FormulaBadge
                key={fId}
                formulaId={fId}
                name={name}
                info={info}
                primary={fId === formulaIdsUsed[0]}
                href={`/gate/questions?formula=${encodeURIComponent(fId)}`}
                size="md"
              />
            )
          })}
        </div>
      )}

      {/* Question text — strip inline MCQ options out of the stem and
          render them as a separate list (only for MCQ/MSQ types). */}
      {(() => {
        const isChoice =
          (questionType ?? '').toUpperCase() === 'MCQ' ||
          (questionType ?? '').toUpperCase() === 'MSQ'
        const { stem, options } = isChoice
          ? splitInlineOptions(questionText)
          : { stem: questionText, options: [] as string[] }
        const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']
        const correctLetter = String(answer ?? '').trim().toUpperCase()

        return (
          <>
            <div className="mt-8 text-[17px] leading-7 text-foreground [&_p]:mt-6 [&_p:first-child]:mt-0">
              <span className="mr-2 font-bold text-foreground">
                {String(question._id).replace(/\D/g, '') || ''}.
              </span>
              <SmartText text={stem} />
            </div>

            {options.length > 0 && (
              <ol className="mt-6 space-y-3">
                {options.map((opt, i) => {
                  const letter = optionLabels[i]
                  const isCorrect = showAnswer && letter === correctLetter
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {letter}
                      </span>
                      <span
                        className={`flex-1 text-[16.5px] leading-7 ${
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
          </>
        )
      })()}

      {/* Show / hide answer */}
      <button
        type="button"
        onClick={() => setShowAnswer((v) => !v)}
        className="mt-10 text-sm font-medium text-indigo-600 underline-offset-4 hover:underline"
      >
        {showAnswer ? 'Hide answer & explanation' : 'Show answer & explanation'}
      </button>

      {showAnswer && (
        <>
          {/* ═══ SECTION 1: Understand ═══════════════════════════════ */}
          {question.understand && (
            <section className="mt-12 sm:mt-14">
              <NumberedHeading number={1} title="Understand" />

              {/* Plain restatement */}
              {question.understand.plain && (
                <p className="mt-4 text-[16.5px] leading-[1.7] text-foreground/90">
                  <SmartText text={question.understand.plain} />
                </p>
              )}

              {/* Visual SVG figure */}
              {question.understand.visual_svg && (
                <figure className="mt-6 flex justify-center">
                  <PageSvgVisual
                    svg={question.understand.visual_svg}
                    alt={question.understand.visual_alt}
                  />
                </figure>
              )}

              {/* Keywords — simple inline definitions */}
              {question.understand.keywords && question.understand.keywords.length > 0 && (
                <dl className="mt-6 space-y-2 text-[15px] leading-[1.6] text-foreground/80">
                  {question.understand.keywords.map((kw, i) => (
                    <div key={i} className="flex flex-wrap items-baseline gap-x-1.5">
                      <dt className="font-bold text-foreground">{kw.term}</dt>
                      <dd className="text-muted-foreground/70">=</dd>
                      <dd className="flex-1">
                        <SmartText text={kw.explain} />
                        {kw.example && (
                          <span className="text-muted-foreground/70">
                            {' '}(<SmartText text={kw.example} />)
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          )}

          {/* ═══ SECTION 2: Given ════════════════════════════════════ */}
          {question.given && (
            <section className="mt-12 sm:mt-14">
              <NumberedHeading number={2} title="Given" />

              {/* Aim — small caption above the table (optional) */}
              {question.given.aim && (
                <p className="mt-3 text-[15px] leading-[1.6] text-foreground/80">
                  <span className="font-semibold text-foreground">Goal: </span>
                  <SmartText text={question.given.aim} />
                </p>
              )}

              {/* Terms — clean textbook-style table */}
              {question.given.terms && question.given.terms.length > 0 && (
                <div className="mt-5 -mx-4 overflow-x-auto sm:mx-0">
                  <table className="w-full min-w-[560px] border-collapse text-left text-[14px] leading-[1.55] sm:text-[14.5px]">
                    <thead>
                      <tr className="border-b border-border text-[12.5px] font-bold text-foreground">
                        <th scope="col" className="px-3 py-2.5 sm:px-4 w-[14%]">Term</th>
                        <th scope="col" className="px-3 py-2.5 sm:px-4 w-[24%]">Meaning</th>
                        <th scope="col" className="px-3 py-2.5 sm:px-4 w-[28%]">Example</th>
                        <th scope="col" className="px-3 py-2.5 sm:px-4 w-[34%]">In simple words</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground/80">
                      {question.given.terms.map((t, i) => (
                        <tr key={i} className="border-b border-border/60 align-top">
                          <td className="px-3 py-3 sm:px-4">
                            <span className="font-bold text-foreground">
                              <SmartText text={t.term} />
                            </span>
                          </td>
                          <td className="px-3 py-3 sm:px-4">
                            <SmartText text={t.meaning} />
                          </td>
                          <td className="px-3 py-3 sm:px-4 text-muted-foreground">
                            <SmartText text={t.example ?? ''} />
                          </td>
                          <td className="px-3 py-3 sm:px-4">
                            <SmartText text={t.connects} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Plan — small footnote line under the table */}
              {question.given.plan && (
                <p className="mt-5 border-l-2 border-border pl-3 text-[14.5px] leading-[1.6] italic text-muted-foreground">
                  <span className="font-bold not-italic text-foreground/90">Plan: </span>
                  <SmartText text={question.given.plan} />
                </p>
              )}

              {/* To find — sentence */}
              {question.to_find && (
                <p className="mt-4 text-[16px] leading-[1.6] text-foreground/90">
                  <span className="font-bold text-foreground">To find: </span>
                  <SmartText text={question.to_find} />
                </p>
              )}
            </section>
          )}

          {/* ═══ SECTION 3: Step-by-step solution ════════════════════ */}
          {question.solution && question.solution.steps && question.solution.steps.length > 0 && (
            <section className="mt-12 sm:mt-14">
              <NumberedHeading number={3} title="Step-by-step solution" />

              <div className="mt-5 space-y-7">
                {question.solution.steps.map((step) => {
                  const fName = step.formula_id
                    ? formulaInfoMap[step.formula_id]?.name ?? formulaIdToName(step.formula_id)
                    : null
                  return (
                    <div key={step.step}>
                      {/* Inline step heading: "Step N — Title (Formula Name)" */}
                      <h3 className="text-[16px] font-bold leading-[1.45] text-foreground sm:text-[17px]">
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

                      {/* Raw + Apply block — KaTeX rendered */}
                      {(step.formula_raw || step.apply) && (
                        <div className="mt-3 overflow-x-auto rounded-md bg-muted/40 px-4 py-3 text-[14px] leading-[1.85] text-foreground/90 ring-1 ring-border sm:text-[15px]">
                          {step.formula_raw && (
                            <div className="flex items-center gap-3">
                              <span className="w-[52px] shrink-0 select-none font-mono text-[12px] text-muted-foreground/70">Raw:</span>
                              <span className="flex-1">
                                <AsciiMath text={step.formula_raw} />
                              </span>
                            </div>
                          )}
                          {step.apply && (
                            <div className="flex items-center gap-3">
                              <span className="w-[52px] shrink-0 select-none font-mono text-[12px] text-muted-foreground/70">Apply:</span>
                              <span className="flex-1 text-foreground">
                                <AsciiMath text={step.apply} />
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Note */}
                      {step.note && (
                        <p className="mt-3 text-[14px] leading-[1.65] text-muted-foreground">
                          ({step.note})
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Result block */}
              {question.solution.result && (
                <div className="mt-8">
                  <h3 className="text-[16px] font-bold text-foreground sm:text-[17px]">
                    Result
                  </h3>
                  <div className="mt-2 overflow-x-auto rounded-md bg-muted/40 px-4 py-3 text-[16px] font-semibold leading-[1.6] text-foreground ring-1 ring-border sm:text-[17px]">
                    <AsciiMath text={question.solution.result} />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Standalone answer fallback (if no solution section) */}
          {(!question.solution || !question.solution.result) && answer && (
            <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                Answer
              </div>
              <div className="mt-1 text-[18px] font-semibold text-emerald-900">
                <AsciiMath text={answer} />
              </div>
            </div>
          )}

          {/* Formulas used summary (from formula_ids_used) */}
          {formulaIdsUsed.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Formulas used
              </span>
              {formulaIdsUsed.map((fId) => (
                <FormulaBadge
                  key={fId}
                  formulaId={fId}
                  name={formulaInfoMap[fId]?.name ?? formulaIdToName(fId)}
                  info={formulaInfoMap[fId]}
                  href={`/gate/questions?formula=${encodeURIComponent(fId)}`}
                  size="sm"
                />
              ))}
            </div>
          )}

          {/* Formula note — only render when non-empty */}
          {question.formula_note && question.formula_note.trim() !== '' && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-[13px] leading-6 text-muted-foreground dark:border-transparent">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <span className="font-semibold text-foreground/80">Note: </span>
                {question.formula_note}
              </div>
            </div>
          )}
        </>
      )}

      {/* Prev / Next navigation */}
      {(prevId || nextId) && (
        <nav className="mt-16 grid grid-cols-2 gap-3 border-t border-border/60 pt-6 dark:border-transparent sm:gap-8">
          {prevId ? (
            <button
              type="button"
              onClick={() => goToQuestion(prevId)}
              className="group flex flex-col items-start gap-1 text-left transition-colors hover:text-indigo-700"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground group-hover:text-indigo-600">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="text-sm font-semibold text-foreground group-hover:text-indigo-700">
                Question {currentIndex}
              </span>
            </button>
          ) : (
            <span />
          )}

          {nextId ? (
            <button
              type="button"
              onClick={() => goToQuestion(nextId)}
              className="group flex flex-col items-end gap-1 text-right transition-colors hover:text-indigo-700"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground group-hover:text-indigo-600">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold text-foreground group-hover:text-indigo-700">
                Question {currentIndex + 2}
              </span>
            </button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </article>
  )
}

/* ─── SVG visual with post-render KaTeX enhancement ─────────────────── */

function PageSvgVisual({ svg, alt }: { svg: string; alt?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const html = prepSvg(svg)

  useEffect(() => {
    if (!ref.current) return
    // Re-run enhancement on mount AND on viewport resize so foreignObject
    // positions reflect the latest layout. requestAnimationFrame ensures
    // getBBox() is reliable.
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
      className="svg-visual-container w-full max-w-full overflow-x-auto rounded-xl bg-[#f5efe1] px-4 py-6 ring-1 ring-[#d6c8a6]/70 sm:max-w-[36rem] sm:px-7 sm:py-8 lg:max-w-[42rem]"
      role="img"
      aria-label={alt || 'Visual diagram'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/* ─── Inline formula link with a hover preview ──────────────────────── */

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
        <div className="mt-1.5 overflow-x-auto rounded-md bg-muted/50 px-3 py-2 text-center text-[15px] text-foreground">
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

/* ─── Numbered section heading: "1. Understand", "2. Given", … ─────── */

function NumberedHeading({ number, title }: { number: number; title: string }) {
  return (
    <h2 className="scroll-m-20 text-[18px] font-bold leading-[1.3] text-foreground sm:text-[19px]">
      {number}. {title}
    </h2>
  )
}

/* ─── Drawer option row: label on top, expandable list of choices ── */

function DrawerOption({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)

  return (
    <div className="rounded-xl border border bg-card">
      {/* Header (always visible) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {label}
          </div>
          <div className="mt-0.5 truncate text-sm font-medium text-foreground">
            {current?.label ?? '— Select —'}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Expanded option list */}
      {open && (
        <ul className="max-h-56 overflow-y-auto border-t border-border/60 py-1">
          {options.length === 0 && (
            <li className="px-4 py-2 text-sm text-muted-foreground/70">No options</li>
          )}
          {options.map((o) => {
            const isActive = o.value === value
            return (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    if (!isActive) onChange(o.value)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-accent',
                    isActive ? 'font-semibold text-indigo-600' : 'text-foreground/80'
                  )}
                >
                  <span className="truncate pr-2">{o.label}</span>
                  {isActive && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
