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
  FlaskConical,
  Lightbulb,
} from 'lucide-react'
import MathRenderer from '@/components/MathRenderer'
import { slugify, cn } from '@/lib/utils'
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

/* ─── Types ─────────────────────────────────────────────────────────── */

interface QuestionDetail {
  _id: string
  questionText: string
  questionType: string
  options: string[]
  correctAnswer: string
  explanation: string
  marks: number
  difficulty: string
  year: number
  subjectId: string
  topicId: string
  conceptId: string
  angle?: string
  cognitiveOperation?: string
  depthLevel?: string
  distractorStrategy?: string | null
  keyConstraint?: string | null
  statementStructure?: string
  trap?: string
  formulaId?: string | null
  formulaIds?: string[]
  simpleExplanation?: string | null
  subjectName: string
  topicName: string
  conceptName: string
}

/** Turn a formulaId like "r-combination-no-rep" into a readable name */
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
interface TopicWithConcepts {
  _id: string
  name: string
  concepts: { _id: string; title: string }[]
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

/* ─── Page ──────────────────────────────────────────────────────────── */

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
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [subjects, setSubjects] = useState<SubjectLite[]>([])
  const [topics, setTopics] = useState<TopicWithConcepts[]>([])
  const [siblings, setSiblings] = useState<{ _id: string }[]>([])

  /* Fetch the question itself */
  useEffect(() => {
    if (!params.questionId) return
    setLoading(true)
    setShowAnswer(false)
    setSelectedOption(null)
    setDrawerOpen(false) // auto-close filter drawer on navigation

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

  /* Fetch topics + concepts for the current subject.
     Use the URL slug (params.subject) instead of question.subjectId because
     subject IDs can be padded ("sub_02" vs "sub_002") and the API resolves
     slugs reliably via name match. */
  useEffect(() => {
    if (!params.subject) return
    fetch(`/api/subjects/${params.subject}`)
      .then((res) => res.json())
      .then((data) => setTopics(data.topics || []))
      .catch(() => {})
  }, [params.subject])

  /* Fetch sibling questions in the same concept for prev/next nav */
  useEffect(() => {
    if (!question?.conceptId) return
    fetch(`/api/questions?conceptId=${question.conceptId}&limit=500`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.questions)) {
          setSiblings(
            data.questions.map((q: { _id: string }) => ({ _id: q._id }))
          )
        }
      })
      .catch(() => {})
  }, [question?.conceptId])

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

  /* When the user changes a dropdown, fetch the first matching question and jump */
  const jumpToFirstQuestion = async (
    filter: { subjectId?: string; topicId?: string; conceptId?: string }
  ) => {
    const qs = new URLSearchParams()
    if (filter.conceptId) qs.set('conceptId', filter.conceptId)
    else if (filter.topicId) qs.set('topicId', filter.topicId)
    else if (filter.subjectId) qs.set('subjectId', filter.subjectId)
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

  /* Loading / not-found states */
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

  /* Correct answer normalisation (handles number/null/undefined safely) */
  const correctAnswerLetter = String(question.correctAnswer ?? '')
    .trim()
    .toUpperCase()
  const correctIndex = optionLabels.indexOf(correctAnswerLetter)

  const currentTopic = topics.find((t) => t._id === question.topicId)
  const conceptsForTopic = currentTopic?.concepts ?? []

  /* ─── Render ──────────────────────────────────────────────────────── */

  return (
    <article className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 sm:pb-16">
      {/* Sticky top bar — replaces the layout's header on this page */}
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
                  Pick a subject, topic, or concept to jump to the first
                  question that matches.
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-4 px-4 pb-2">
                <DrawerOption
                  label="Subject"
                  value={question.subjectId}
                  options={subjects.map((s) => ({
                    value: s._id,
                    label: s.name,
                  }))}
                  onChange={(val) => jumpToFirstQuestion({ subjectId: val })}
                />
                <DrawerOption
                  label="Topic"
                  value={question.topicId}
                  options={topics.map((t) => ({ value: t._id, label: t.name }))}
                  onChange={(val) => jumpToFirstQuestion({ topicId: val })}
                />
                <DrawerOption
                  label="Concept"
                  value={question.conceptId}
                  options={conceptsForTopic.map((c) => ({
                    value: c._id,
                    label: c.title,
                  }))}
                  onChange={(val) => jumpToFirstQuestion({ conceptId: val })}
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
        GATE {question.year} · {question.marks} mark
        {question.marks > 1 ? 's' : ''} · {question.difficulty} ·{' '}
        {question.questionType}
        {currentIndex >= 0 && total > 0 && (
          <>
            {' · '}
            <span className="font-medium text-slate-700">
              {currentIndex + 1} / {total}
            </span>
          </>
        )}
      </p>

      {/* H1 — concept title */}
      <h1 className="mt-2 scroll-m-20 text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl">
        {question.conceptName}
      </h1>

      {/* Lead — topic / subject breadcrumb-style line */}
      <p className="mt-3 text-base text-slate-500 sm:text-lg">
        {question.subjectName} · {question.topicName}
      </p>

      {/* Formula badges */}
      {question.formulaIds && question.formulaIds.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Formulas
          </span>
          {question.formulaIds.map((fId) => {
            const isPrimary = fId === question.formulaId
            return (
              <Link
                key={fId}
                href={`/gate/questions?formula=${encodeURIComponent(fId)}`}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors
                  ${isPrimary
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'border border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100'
                  }
                `}
                title={isPrimary ? `Primary formula: ${formulaIdToName(fId)}` : formulaIdToName(fId)}
              >
                <FlaskConical className="h-3 w-3" />
                {formulaIdToName(fId)}
              </Link>
            )
          })}
        </div>
      )}

      {/* Question text — prefixed with the numeric ID extracted from question._id */}
      <div className="mt-8 text-[17px] leading-7 text-slate-900 [&_p]:mt-6 [&_p:first-child]:mt-0">
        <span className="mr-2 font-bold text-slate-900">
          {String(question._id).replace(/\D/g, '') || ''}.
        </span>
        <MathRenderer text={question.questionText} />
      </div>

      {/* Options (MCQ only) */}
      {question.questionType !== 'NAT' &&
        question.options &&
        question.options.length > 0 && (
          <ol className="mt-8 space-y-3">
            {question.options.map((opt, i) => {
              const isCorrect = showAnswer && i === correctIndex
              const isWrongSelected =
                showAnswer && selectedOption === i && i !== correctIndex
              const isSelected = selectedOption === i && !showAnswer

              const tone = isCorrect
                ? 'text-emerald-700'
                : isWrongSelected
                  ? 'text-rose-700'
                  : isSelected
                    ? 'text-indigo-700'
                    : 'text-slate-800'

              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => !showAnswer && setSelectedOption(i)}
                    disabled={showAnswer}
                    className={`flex w-full items-start gap-3 text-left leading-7 transition-colors ${tone} ${
                      !showAnswer
                        ? 'cursor-pointer hover:text-indigo-700'
                        : 'cursor-default'
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-700'
                          : isWrongSelected
                            ? 'bg-rose-100 text-rose-700'
                            : isSelected
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {optionLabels[i]}
                    </span>
                    <span className="flex-1 text-[17px]">
                      <MathRenderer text={opt} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        )}

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
          {/* H2 — Answer */}
          <h2 className="mt-10 scroll-m-20 border-b border-slate-200 pb-2 text-2xl font-semibold tracking-tight text-slate-900 first:mt-0">
            Answer
          </h2>
          <p className="mt-4 leading-7 text-slate-800">
            <span className="font-semibold text-emerald-700">
              {question.correctAnswer}
            </span>
          </p>

          {/* H2 — Simple Explanation */}
          {question.simpleExplanation && (
            <>
              <h2 className="mt-10 scroll-m-20 border-b border-slate-200 pb-2 text-2xl font-semibold tracking-tight text-slate-900">
                Simple Explanation
              </h2>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-4">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Step-by-step
                </div>
                <div className="text-[16px] leading-7 text-amber-950">
                  <MathRenderer text={question.simpleExplanation} />
                </div>
              </div>
            </>
          )}

          {/* H2 — Explanation */}
          {question.explanation && (
            <>
              <h2 className="mt-10 scroll-m-20 border-b border-slate-200 pb-2 text-2xl font-semibold tracking-tight text-slate-900">
                Explanation
              </h2>
              <div className="mt-4 text-[17px] leading-7 text-slate-800 [&_p]:mt-6 [&_p:first-child]:mt-0">
                <MathRenderer text={question.explanation} />
              </div>
            </>
          )}

          {/* H2 — Notes (meta) */}
          {(question.cognitiveOperation ||
            question.angle ||
            question.trap ||
            question.keyConstraint ||
            question.depthLevel ||
            question.statementStructure ||
            question.distractorStrategy) && (
            <>
              <h2 className="mt-10 scroll-m-20 border-b border-slate-200 pb-2 text-2xl font-semibold tracking-tight text-slate-900">
                Notes
              </h2>
              <ul className="my-6 ml-6 list-disc leading-7 text-slate-800 [&>li]:mt-2">
                {question.cognitiveOperation && (
                  <li>
                    <span className="font-semibold">Cognitive operation:</span>{' '}
                    {question.cognitiveOperation}
                  </li>
                )}
                {question.angle && (
                  <li>
                    <span className="font-semibold">Angle:</span>{' '}
                    {question.angle}
                  </li>
                )}
                {question.trap && (
                  <li>
                    <span className="font-semibold">Trap:</span> {question.trap}
                  </li>
                )}
                {question.keyConstraint && (
                  <li>
                    <span className="font-semibold">Key constraint:</span>{' '}
                    {question.keyConstraint}
                  </li>
                )}
                {question.depthLevel && (
                  <li>
                    <span className="font-semibold">Depth level:</span>{' '}
                    {question.depthLevel}
                  </li>
                )}
                {question.statementStructure && (
                  <li>
                    <span className="font-semibold">Statement structure:</span>{' '}
                    {question.statementStructure}
                  </li>
                )}
                {question.distractorStrategy && (
                  <li>
                    <span className="font-semibold">Distractor strategy:</span>{' '}
                    {question.distractorStrategy}
                  </li>
                )}
              </ul>
            </>
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

/* ─── Drawer option row: label on top, expandable list of choices below ── */

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
