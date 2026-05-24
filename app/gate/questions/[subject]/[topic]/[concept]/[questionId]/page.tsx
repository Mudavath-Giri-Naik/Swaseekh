'use client'

import { useEffect, useMemo, useState } from 'react'
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
  Target,
  Lightbulb,
  BookOpen,
  Crosshair,
} from 'lucide-react'
import MathRenderer from '@/components/MathRenderer'
import { slugify, cn } from '@/lib/utils'
import FormulaBadge from '@/components/concept/FormulaBadge'
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

  /* Fetch formula info from content API to build hover-preview map */
  useEffect(() => {
    if (!question?.formula_ids_used?.length) return

    // Fetch the formulas content doc — it's a single doc in the 'content' collection.
    // We try to find it via a known conceptId or fetch all content docs.
    // Since formulas are in the content collection, let's fetch by a known concept.
    const conceptId = question.meta?.subtopic || question.meta?.topic
    if (!conceptId) return

    fetch(`/api/content/${encodeURIComponent(conceptId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.content?.groups) return
        const map: Record<string, { name?: string; latex?: string; plain?: string }> = {}
        for (const group of data.content.groups) {
          for (const f of group.formulas ?? []) {
            if (!f.formulaId) continue
            map[f.formulaId] = { name: f.name, latex: f.latex, plain: f.plain }
          }
        }
        setFormulaInfoMap(map)
      })
      .catch(() => {})
  }, [question?.formula_ids_used, question?.meta?.subtopic, question?.meta?.topic])

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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-base text-slate-500">Question not found.</p>
        <Link
          href="/gate/questions"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
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
      <div className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-slate-200 bg-white/85 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
        <Link
          href="/gate/questions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All questions
        </Link>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              aria-label="Filter questions"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
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
      <p className="mt-10 text-sm text-slate-500">
        {meta.exam || `GATE ${year}`} · {marks} mark
        {marks > 1 ? 's' : ''} · {difficulty} · {questionType}
        {currentIndex >= 0 && total > 0 && (
          <>
            {' · '}
            <span className="font-medium text-slate-700">
              {currentIndex + 1} / {total}
            </span>
          </>
        )}
      </p>

      {/* H1 — concept/topic title */}
      <h1 className="mt-2 scroll-m-20 text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl">
        {conceptName}
      </h1>

      {/* Subject / topic breadcrumb */}
      <p className="mt-3 text-base text-slate-500 sm:text-lg">
        {subjectName} · {topicName}
      </p>

      {/* Formula badges — from formula_ids_used */}
      {formulaIdsUsed.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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

      {/* Question text */}
      <div className="mt-8 text-[17px] leading-7 text-slate-900 [&_p]:mt-6 [&_p:first-child]:mt-0">
        <span className="mr-2 font-bold text-slate-900">
          {String(question._id).replace(/\D/g, '') || ''}. 
        </span>
        <MathRenderer text={questionText} />
      </div>

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
          {/* ═══ SECTION 1: Understand the Problem ═══════════════════ */}
          {question.understand && (
            <section className="mt-10">
              <SectionHeading icon={<Lightbulb className="h-5 w-5" />} title="Understand the Problem" />

              {/* Plain restatement */}
              {question.understand.plain && (
                <p className="mt-4 text-[17px] leading-7 text-slate-800">
                  <MathRenderer text={question.understand.plain} />
                </p>
              )}

              {/* Visual SVG */}
              {question.understand.visual_svg && (
                <div
                  className="svg-visual-container mt-6 flex justify-center overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                  role="img"
                  aria-label={question.understand.visual_alt || 'Visual diagram'}
                  dangerouslySetInnerHTML={{ __html: question.understand.visual_svg }}
                />
              )}

              {/* Keywords */}
              {question.understand.keywords && question.understand.keywords.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {question.understand.keywords.map((kw, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <span className="text-[15px] font-bold text-slate-900">{kw.term}</span>
                      <span className="mx-1.5 text-slate-300">—</span>
                      <span className="text-[15px] text-slate-700">{kw.explain}</span>
                      {kw.example && (
                        <span className="ml-2 text-[13px] italic text-slate-400">
                          e.g. {kw.example}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ═══ SECTION 2: Given ═══════════════════════════════════ */}
          {question.given && (
            <section className="mt-10">
              <SectionHeading icon={<BookOpen className="h-5 w-5" />} title="Given" />

              {/* Aim */}
              {question.given.aim && (
                <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/50 px-5 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
                    Goal
                  </div>
                  <p className="mt-1 text-[17px] font-medium leading-7 text-indigo-900">
                    {question.given.aim}
                  </p>
                </div>
              )}

              {/* Terms grid */}
              {question.given.terms && question.given.terms.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {question.given.terms.map((t, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="text-[16px] font-bold text-slate-900">{t.term}</div>
                      <div className="mt-1 text-[14px] text-slate-600">{t.meaning}</div>
                      {t.example && (
                        <div className="mt-1.5 text-[13px] text-slate-400">
                          <span className="font-medium text-slate-500">e.g.</span> {t.example}
                        </div>
                      )}
                      {t.connects && (
                        <div className="mt-2 border-t border-slate-100 pt-2 text-[13px] text-slate-500">
                          <span className="font-medium text-slate-600">↗ </span>
                          {t.connects}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Plan */}
              {question.given.plan && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/50 px-5 py-3">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                      Strategy
                    </div>
                    <p className="mt-0.5 text-[15px] leading-6 text-amber-900">
                      {question.given.plan}
                    </p>
                  </div>
                </div>
              )}

              {/* To find */}
              {question.to_find && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50/50 px-5 py-3">
                  <Crosshair className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-600">
                      What we need to find
                    </div>
                    <p className="mt-0.5 text-[15px] font-medium leading-6 text-violet-900">
                      <MathRenderer text={question.to_find} />
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ═══ SECTION 3: Step-by-step Solution ═══════════════════ */}
          {question.solution && question.solution.steps && question.solution.steps.length > 0 && (
            <section className="mt-10">
              <SectionHeading
                icon={<span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">S</span>}
                title="Step-by-step Solution"
              />

              <ol className="mt-6 space-y-6">
                {question.solution.steps.map((step) => (
                  <li key={step.step} className="relative pl-10">
                    {/* Step number */}
                    <span className="absolute left-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {step.step}
                    </span>

                    {/* Title */}
                    <div className="text-[16px] font-semibold text-slate-900">
                      {step.title}
                    </div>

                    {/* Formula chip (clickable) */}
                    {step.formula_id && (
                      <div className="mt-2">
                        <FormulaBadge
                          formulaId={step.formula_id}
                          name={formulaInfoMap[step.formula_id]?.name ?? formulaIdToName(step.formula_id)}
                          info={formulaInfoMap[step.formula_id]}
                          primary
                          href={`/gate/questions?formula=${encodeURIComponent(step.formula_id)}`}
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Raw formula (no values) */}
                    {step.formula_raw && (
                      <div className="mt-2 rounded-lg bg-slate-100 px-4 py-2 font-mono text-[14px] text-slate-700">
                        <MathRenderer text={step.formula_raw} />
                      </div>
                    )}

                    {/* Applied formula (with values) */}
                    {step.apply && (
                      <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-2 text-[15px] text-emerald-900">
                        <MathRenderer text={step.apply} />
                      </div>
                    )}

                    {/* Note */}
                    {step.note && (
                      <p className="mt-2 text-[13px] leading-5 text-slate-500 italic">
                        {step.note}
                      </p>
                    )}
                  </li>
                ))}
              </ol>

              {/* Final result */}
              {question.solution.result && (
                <div className="mt-8 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-center">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                    Final Answer
                  </div>
                  <div className="mt-1 text-xl font-bold text-emerald-900">
                    <MathRenderer text={question.solution.result} />
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
                <MathRenderer text={answer} />
              </div>
            </div>
          )}

          {/* Formulas used summary (from formula_ids_used) */}
          {formulaIdsUsed.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] leading-6 text-slate-600">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <div className="flex-1">
                <span className="font-semibold text-slate-700">Note: </span>
                {question.formula_note}
              </div>
            </div>
          )}
        </>
      )}

      {/* Prev / Next navigation */}
      {(prevId || nextId) && (
        <nav className="mt-16 grid grid-cols-2 gap-3 border-t border-slate-200 pt-6 sm:gap-8">
          {prevId ? (
            <button
              type="button"
              onClick={() => goToQuestion(prevId)}
              className="group flex flex-col items-start gap-1 text-left transition-colors hover:text-indigo-700"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 group-hover:text-indigo-600">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
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
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 group-hover:text-indigo-600">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
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

/* ─── Section heading component ─────────────────────────────────── */

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2.5 scroll-m-20 border-b border-slate-200 pb-2 text-2xl font-semibold tracking-tight text-slate-900">
      <span className="text-indigo-600">{icon}</span>
      {title}
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
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header (always visible) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </div>
          <div className="mt-0.5 truncate text-sm font-medium text-slate-900">
            {current?.label ?? '— Select —'}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-slate-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Expanded option list */}
      {open && (
        <ul className="max-h-56 overflow-y-auto border-t border-slate-100 py-1">
          {options.length === 0 && (
            <li className="px-4 py-2 text-sm text-slate-400">No options</li>
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
                    'flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50',
                    isActive ? 'font-semibold text-indigo-600' : 'text-slate-700'
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
