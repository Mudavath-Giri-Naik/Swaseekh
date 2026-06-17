'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import MathRenderer from '@/components/MathRenderer'
import {
  Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Circle, AlertTriangle, X, ListChecks, Hash, ArrowLeft, RotateCcw,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────────────────── */
interface Opt { key: string; text: string }
interface Q {
  id: string
  no: number
  type: 'MCQ' | 'MSQ' | 'NAT' | string
  marks: number
  difficulty: string
  subject: string
  topic: string
  stem: string
  options: Opt[]
  correctOptions: string[]
  isNat: boolean
  subjective: boolean
  excluded: boolean
  answer: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  solution: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  understand: any
  to_find: string
}
interface Section { name: string; questions: Q[] }
interface Paper {
  year: number
  totalQuestions: number
  totalMarks: number
  durationMin: number
  sections: Section[]
}
type Ans = { keys?: string[]; nat?: string }

/* ─── NAT answer matching ────────────────────────────────────────────── */
function evalNumber(s: string): number | null {
  const t = s.trim()
  if (/^[-+]?\d*\.?\d+\s*\/\s*[-+]?\d*\.?\d+$/.test(t)) {
    const [a, b] = t.split('/').map((x) => parseFloat(x))
    if (b !== 0) return a / b
  }
  const n = parseFloat(t)
  return Number.isFinite(n) ? n : null
}
function natCorrect(answer: string, user: string): boolean {
  if (!user || !user.trim()) return false
  const u = evalNumber(user)
  if (u === null) return answer.trim().toLowerCase() === user.trim().toLowerCase()
  // range: "12 to 14"
  const range = answer.match(/(-?\d*\.?\d+)\s*(?:to|–|—)\s*(-?\d*\.?\d+)/i)
  if (range) {
    const lo = parseFloat(range[1]), hi = parseFloat(range[2])
    return u >= Math.min(lo, hi) - 1e-9 && u <= Math.max(lo, hi) + 1e-9
  }
  const a = evalNumber(answer)
  if (a === null) return false
  const tol = Math.max(0.02, Math.abs(a) * 0.01)
  return Math.abs(a - u) <= tol
}
function setEqual(a: string[] = [], b: string[] = []): boolean {
  if (a.length !== b.length) return false
  const sb = new Set(b)
  return a.every((x) => sb.has(x))
}
function fmtTime(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':')
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function ExamPage({ params }: { params: { year: string } }) {
  const year = params.year
  const [paper, setPaper] = useState<Paper | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'instructions' | 'exam' | 'results'>('instructions')

  const [answers, setAnswers] = useState<Record<string, Ans>>({})
  const [visited, setVisited] = useState<Record<string, boolean>>({})
  const [marked, setMarked] = useState<Record<string, boolean>>({})
  const [curIdx, setCurIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)

  const flat = useMemo<Q[]>(() => (paper ? paper.sections.flatMap((s) => s.questions.map((q) => ({ ...q, subject: q.subject }))) : []), [paper])
  const sectionOf = useCallback(
    (q: Q) => (paper?.sections.find((s) => s.questions.some((x) => x.id === q.id))?.name ?? ''),
    [paper]
  )

  const storageKey = `mock-attempt-${year}`

  /* fetch paper */
  useEffect(() => {
    fetch(`/api/mock-tests/${year}`)
      .then((r) => r.json())
      .then((d: Paper) => {
        setPaper(d)
        setTimeLeft((d.durationMin || 180) * 60)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [year])

  /* detect a saved in-progress attempt */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const s = JSON.parse(raw)
        if (s && s.phase === 'exam') setHasSaved(true)
      }
    } catch {}
  }, [storageKey])

  /* persist during exam */
  useEffect(() => {
    if (phase !== 'exam') return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ phase, answers, visited, marked, curIdx, timeLeft }))
    } catch {}
  }, [phase, answers, visited, marked, curIdx, timeLeft, storageKey])

  /* timer */
  useEffect(() => {
    if (phase !== 'exam') return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          doSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const startFresh = () => {
    setAnswers({}); setVisited({}); setMarked({}); setCurIdx(0)
    setTimeLeft((paper?.durationMin || 180) * 60)
    try { localStorage.removeItem(storageKey) } catch {}
    setPhase('exam')
    markVisited(0)
  }
  const resume = () => {
    try {
      const s = JSON.parse(localStorage.getItem(storageKey) || '{}')
      setAnswers(s.answers || {}); setVisited(s.visited || {}); setMarked(s.marked || {})
      setCurIdx(s.curIdx || 0); setTimeLeft(s.timeLeft ?? (paper?.durationMin || 180) * 60)
      setPhase('exam')
    } catch { startFresh() }
  }

  const markVisited = (idx: number) => {
    const q = flat[idx]
    if (q) setVisited((v) => ({ ...v, [q.id]: true }))
  }
  const goTo = (idx: number) => {
    if (idx < 0 || idx >= flat.length) return
    setCurIdx(idx)
    markVisited(idx)
  }

  const cur = flat[curIdx]

  const setChoice = (q: Q, key: string) => {
    setAnswers((a) => {
      const prev = a[q.id]?.keys || []
      if (q.type === 'MSQ') {
        const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        return { ...a, [q.id]: { keys: next } }
      }
      return { ...a, [q.id]: { keys: [key] } }
    })
  }
  const setNat = (q: Q, val: string) => setAnswers((a) => ({ ...a, [q.id]: { nat: val } }))
  const clearResp = (q: Q) => setAnswers((a) => { const n = { ...a }; delete n[q.id]; return n })

  const saveNext = () => goTo(curIdx + 1)
  const markNext = () => {
    if (cur) setMarked((m) => ({ ...m, [cur.id]: true }))
    goTo(curIdx + 1)
  }

  const statusOf = (q: Q): 'notVisited' | 'notAnswered' | 'answered' | 'marked' | 'answeredMarked' => {
    const a = answers[q.id]
    const answered = q.isNat ? !!a?.nat?.trim() : !!(a?.keys && a.keys.length)
    const isMarked = !!marked[q.id]
    if (!visited[q.id] && !answered) return 'notVisited'
    if (isMarked && answered) return 'answeredMarked'
    if (isMarked) return 'marked'
    if (answered) return 'answered'
    return 'notAnswered'
  }

  /* ─── scoring ─── */
  const result = useMemo(() => {
    if (!paper) return null
    let score = 0, correct = 0, incorrect = 0, unattempted = 0, negative = 0
    let maxMarks = 0, subjectiveCount = 0, bonusCount = 0
    const perSection: Record<string, { score: number; max: number; correct: number; total: number }> = {}
    const detail: Record<string, { state: 'correct' | 'incorrect' | 'unattempted' | 'bonus' | 'ungraded'; delta: number }> = {}

    for (const q of flat) {
      const sec = sectionOf(q)
      perSection[sec] = perSection[sec] || { score: 0, max: 0, correct: 0, total: 0 }
      perSection[sec].total++

      if (q.subjective) { subjectiveCount++; detail[q.id] = { state: 'ungraded', delta: 0 }; continue }
      maxMarks += q.marks
      perSection[sec].max += q.marks

      if (q.excluded) {
        score += q.marks; perSection[sec].score += q.marks; bonusCount++
        detail[q.id] = { state: 'bonus', delta: q.marks }
        continue
      }
      const a = answers[q.id]
      const attempted = q.isNat ? !!a?.nat?.trim() : !!(a?.keys && a.keys.length)
      if (!attempted) { unattempted++; detail[q.id] = { state: 'unattempted', delta: 0 }; continue }

      let ok = false
      if (q.isNat) ok = natCorrect(q.answer, a!.nat!)
      else if (q.type === 'MSQ') ok = setEqual(a!.keys, q.correctOptions)
      else ok = (a!.keys!.length === 1 && q.correctOptions.includes(a!.keys![0]))

      if (ok) {
        score += q.marks; perSection[sec].score += q.marks; correct++; perSection[sec].correct++
        detail[q.id] = { state: 'correct', delta: q.marks }
      } else {
        incorrect++
        let neg = 0
        if (q.type === 'MCQ') neg = q.marks * (1 / 3) // GATE: -1/3 for 1-mark, -2/3 for 2-mark
        score -= neg; perSection[sec].score -= neg; negative += neg
        detail[q.id] = { state: 'incorrect', delta: -neg }
      }
    }
    return {
      score: Math.round(score * 100) / 100,
      maxMarks,
      correct, incorrect, unattempted, negative: Math.round(negative * 100) / 100,
      subjectiveCount, bonusCount,
      perSection, detail,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper, flat, answers])

  const doSubmit = () => {
    setConfirmSubmit(false)
    setPhase('results')
    try { localStorage.removeItem(storageKey) } catch {}
  }

  const answeredCount = flat.filter((q) => {
    const a = answers[q.id]
    return q.isNat ? !!a?.nat?.trim() : !!(a?.keys && a.keys.length)
  }).length

  /* ─── render ─── */
  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-[#4A235A]" />
      </div>
    )
  }
  if (!paper) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">Could not load this paper.</p>
        <Link href="/mock-tests" className="rounded-lg bg-[#4A235A] px-4 py-2 text-sm font-semibold text-white">Back to Mock Tests</Link>
      </div>
    )
  }

  if (phase === 'instructions') {
    return <Instructions paper={paper} hasSaved={hasSaved} onStart={startFresh} onResume={resume} />
  }

  if (phase === 'results' && result) {
    return <Results paper={paper} flat={flat} result={result} answers={answers} sectionOf={sectionOf} year={year} />
  }

  /* ── EXAM ── */
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-3 sm:px-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-md bg-[#4A235A] px-2.5 py-1 text-xs font-bold text-white">GATE {paper.year}</span>
          <span className="hidden text-sm font-medium text-muted-foreground sm:block">Full Test · {paper.totalQuestions} Q · {paper.totalMarks} Marks</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums ${timeLeft < 300 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' : 'bg-muted text-foreground'}`}>
            <Clock className="h-4 w-4" />
            {fmtTime(timeLeft)}
          </div>
          <button onClick={() => setConfirmSubmit(true)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Submit Test
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Question area */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Section tabs */}
          <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b bg-muted/40 px-3 py-2 sm:px-5">
            {paper.sections.map((s) => {
              const firstIdx = flat.findIndex((q) => q.id === s.questions[0]?.id)
              const active = cur && sectionOf(cur) === s.name
              return (
                <button
                  key={s.name}
                  onClick={() => goTo(firstIdx)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${active ? 'bg-[#4A235A] text-white' : 'bg-background text-muted-foreground hover:bg-accent'}`}
                >
                  {s.name} <span className="opacity-70">({s.questions.length})</span>
                </button>
              )
            })}
          </div>

          {cur && (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">
              {/* Question header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold">Question {cur.no}</h2>
                  <TypeBadge type={cur.isNat ? 'NAT' : cur.type} />
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{cur.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">+{cur.marks}</span>
                  {!cur.isNat && cur.type === 'MCQ' && !cur.excluded && (
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                      −{(cur.marks / 3).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stem */}
              <div className="prose-sm mb-6 max-w-3xl whitespace-pre-wrap text-[15px] leading-[1.9] text-foreground">
                <MathRenderer text={cur.stem} />
              </div>

              {/* Inputs */}
              {cur.subjective ? (
                <div className="max-w-3xl rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                  This is a descriptive question (not graded in this mock). The full solution is available after you submit.
                </div>
              ) : cur.isNat ? (
                <div className="max-w-md">
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Your answer (numerical)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={answers[cur.id]?.nat ?? ''}
                    onChange={(e) => setNat(cur, e.target.value)}
                    placeholder="Type a number…"
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#4A235A] focus:ring-2 focus:ring-[#4A235A]/20"
                  />
                </div>
              ) : (
                <ul className="max-w-3xl space-y-2.5">
                  {cur.options.map((o) => {
                    const sel = answers[cur.id]?.keys?.includes(o.key)
                    return (
                      <li key={o.key}>
                        <button
                          onClick={() => setChoice(cur, o.key)}
                          className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${sel ? 'border-[#4A235A] bg-[#4A235A]/5 dark:border-violet-400 dark:bg-violet-400/10' : 'hover:border-foreground/20 hover:bg-accent'}`}
                        >
                          <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center ${cur.type === 'MSQ' ? 'rounded-md' : 'rounded-full'} border text-xs font-bold ${sel ? 'border-[#4A235A] bg-[#4A235A] text-white dark:border-violet-400 dark:bg-violet-400 dark:text-black' : 'border-muted-foreground/40 text-muted-foreground'}`}>
                            {o.key}
                          </span>
                          <span className="flex-1 leading-relaxed"><MathRenderer text={o.text} /></span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              {cur.type === 'MSQ' && !cur.subjective && (
                <p className="mt-3 text-xs text-muted-foreground">Multiple Select — choose all correct options. No negative marking.</p>
              )}
            </div>
          )}

          {/* Action bar */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-card px-4 py-3 sm:px-8">
            <div className="flex flex-wrap gap-2">
              <button onClick={markNext} className="rounded-lg border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent sm:text-sm">
                <Flag className="mr-1 inline h-3.5 w-3.5" /> Mark for Review & Next
              </button>
              <button onClick={() => cur && clearResp(cur)} className="rounded-lg border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent sm:text-sm">
                Clear Response
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => goTo(curIdx - 1)} disabled={curIdx === 0} className="rounded-lg border p-2 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={saveNext} className="rounded-lg bg-[#4A235A] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 sm:text-sm">
                Save & Next <ChevronRight className="ml-1 inline h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* Palette */}
        <aside className="hidden w-72 shrink-0 flex-col border-l bg-muted/30 lg:flex">
          <PaletteLegend />
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {paper.sections.map((s) => (
              <div key={s.name} className="mb-5">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{s.name}</div>
                <div className="grid grid-cols-5 gap-2">
                  {s.questions.map((q) => {
                    const idx = flat.findIndex((x) => x.id === q.id)
                    return <PaletteBtn key={q.id} no={q.no} status={statusOf(q)} active={idx === curIdx} onClick={() => goTo(idx)} />
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3 text-center text-xs text-muted-foreground">
            Answered <span className="font-bold text-emerald-600">{answeredCount}</span> / {flat.length}
          </div>
        </aside>
      </div>

      {/* Mobile palette toggle bar */}
      <MobilePalette paper={paper} flat={flat} statusOf={statusOf} curIdx={curIdx} goTo={goTo} answeredCount={answeredCount} />

      {/* Submit confirm */}
      {confirmSubmit && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold">Submit test?</h3>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              You answered <b className="text-foreground">{answeredCount}</b> of {flat.length} questions.
              Time left: <b className="text-foreground">{fmtTime(timeLeft)}</b>. You can&apos;t change answers after submitting.
            </p>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center text-xs">
              <div><div className="font-bold text-emerald-600">{answeredCount}</div><div className="text-muted-foreground">Answered</div></div>
              <div><div className="font-bold text-amber-600">{Object.values(marked).filter(Boolean).length}</div><div className="text-muted-foreground">Marked</div></div>
              <div><div className="font-bold text-muted-foreground">{flat.length - answeredCount}</div><div className="text-muted-foreground">Unanswered</div></div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmSubmit(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-accent">Resume</button>
              <button onClick={doSubmit} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Sub-components ──────────────────────────────────────────────────── */
function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    MCQ: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    MSQ: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    NAT: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  }
  return <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${map[type] || 'bg-muted text-muted-foreground'}`}>{type}</span>
}

const STATUS_STYLE: Record<string, string> = {
  notVisited: 'bg-background text-muted-foreground border',
  notAnswered: 'bg-rose-500 text-white',
  answered: 'bg-emerald-500 text-white',
  marked: 'bg-violet-500 text-white',
  answeredMarked: 'bg-violet-500 text-white ring-2 ring-emerald-400',
}
function PaletteBtn({ no, status, active, onClick }: { no: number; status: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold transition ${STATUS_STYLE[status]} ${active ? 'outline outline-2 outline-offset-1 outline-[#4A235A] dark:outline-violet-300' : ''}`}
    >
      {no}
      {status === 'answeredMarked' && <CheckCircle2 className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-white text-emerald-500" />}
    </button>
  )
}
function PaletteLegend() {
  const items = [
    ['bg-emerald-500', 'Answered'],
    ['bg-rose-500', 'Not Answered'],
    ['bg-violet-500', 'Marked'],
    ['bg-background border', 'Not Visited'],
  ] as const
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 border-b p-3 text-[11px]">
      {items.map(([c, l]) => (
        <div key={l} className="flex items-center gap-1.5">
          <span className={`inline-block h-3.5 w-3.5 rounded ${c}`} />
          <span className="text-muted-foreground">{l}</span>
        </div>
      ))}
    </div>
  )
}

function MobilePalette({
  paper, flat, statusOf, curIdx, goTo, answeredCount,
}: { paper: Paper; flat: Q[]; statusOf: (q: Q) => string; curIdx: number; goTo: (i: number) => void; answeredCount: number }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[65] flex items-center gap-2 rounded-full bg-[#4A235A] px-4 py-2.5 text-sm font-semibold text-white shadow-lg lg:hidden"
      >
        <ListChecks className="h-4 w-4" /> {answeredCount}/{flat.length}
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="mt-auto max-h-[75vh] overflow-y-auto rounded-t-2xl bg-card p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold">Question Palette</h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <PaletteLegend />
            {paper.sections.map((s) => (
              <div key={s.name} className="mb-4 mt-3">
                <div className="mb-2 text-xs font-bold uppercase text-muted-foreground">{s.name}</div>
                <div className="grid grid-cols-6 gap-2">
                  {s.questions.map((q) => {
                    const idx = flat.findIndex((x) => x.id === q.id)
                    return <PaletteBtn key={q.id} no={q.no} status={statusOf(q)} active={idx === curIdx} onClick={() => { goTo(idx); setOpen(false) }} />
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Instructions screen ─── */
function Instructions({ paper, hasSaved, onStart, onResume }: { paper: Paper; hasSaved: boolean; onStart: () => void; onResume: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href="/mock-tests" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All Mock Tests
        </Link>
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <span className="rounded-md bg-[#4A235A] px-2.5 py-1 text-xs font-bold text-white">GATE {paper.year}</span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">GATE {paper.year} — Full Mock Test</h1>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoTile icon={<Hash className="h-4 w-4" />} label="Questions" value={paper.totalQuestions} />
            <InfoTile icon={<CheckCircle2 className="h-4 w-4" />} label="Max Marks" value={paper.totalMarks} />
            <InfoTile icon={<Clock className="h-4 w-4" />} label="Duration" value={`${Math.round(paper.durationMin / 60)} hours`} />
            <InfoTile icon={<ListChecks className="h-4 w-4" />} label="Sections" value={paper.sections.length} />
          </div>

          <div className="mt-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">Instructions</h2>
            <ul className="space-y-2 text-sm text-foreground/90">
              <li className="flex gap-2"><span className="text-[#4A235A] dark:text-violet-300">•</span> The clock counts down from {Math.round(paper.durationMin / 60)} hours and the test auto-submits at zero.</li>
              <li className="flex gap-2"><span className="text-[#4A235A] dark:text-violet-300">•</span> <b>MCQ</b>: one correct option, with <b>negative marking</b> (−1/3 of the marks for a wrong answer).</li>
              <li className="flex gap-2"><span className="text-[#4A235A] dark:text-violet-300">•</span> <b>MSQ</b> &amp; <b>NAT</b>: no negative marking. MSQ needs all correct options selected.</li>
              <li className="flex gap-2"><span className="text-[#4A235A] dark:text-violet-300">•</span> Use the palette to jump between questions and <b>mark for review</b>.</li>
              <li className="flex gap-2"><span className="text-[#4A235A] dark:text-violet-300">•</span> Your progress is saved on this device — you can resume if you leave.</li>
            </ul>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button onClick={onStart} className="rounded-xl bg-[#4A235A] px-6 py-3 text-sm font-bold text-white hover:opacity-90">
              {hasSaved ? 'Start Over' : 'Start Test'}
            </button>
            {hasSaved && (
              <button onClick={onResume} className="inline-flex items-center gap-1.5 rounded-xl border px-6 py-3 text-sm font-bold hover:bg-accent">
                <RotateCcw className="h-4 w-4" /> Resume Saved Attempt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}<span className="text-[11px]">{label}</span></div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  )
}

/* ─── Results screen ─── */
function Results({
  paper, flat, result, answers, sectionOf, year,
}: {
  paper: Paper; flat: Q[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any
  answers: Record<string, Ans>; sectionOf: (q: Q) => string; year: string
}) {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all')
  const pct = result.maxMarks > 0 ? Math.max(0, (result.score / result.maxMarks) * 100) : 0

  const shown = flat.filter((q) => {
    const st = result.detail[q.id]?.state
    if (filter === 'all') return true
    if (filter === 'correct') return st === 'correct' || st === 'bonus'
    if (filter === 'incorrect') return st === 'incorrect'
    if (filter === 'unattempted') return st === 'unattempted'
    return true
  })

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link href="/mock-tests" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All Mock Tests
        </Link>

        {/* Score card */}
        <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-[#4A235A] to-[#6b2f80] p-6 text-white sm:p-8">
          <div className="text-sm text-white/70">GATE {paper.year} — Result</div>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-5xl font-extrabold tabular-nums">{result.score}</span>
            <span className="mb-1.5 text-xl text-white/70">/ {result.maxMarks}</span>
          </div>
          <div className="mt-1 text-sm text-white/80">{pct.toFixed(1)}% score</div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResTile label="Correct" value={result.correct} cls="text-emerald-300" />
            <ResTile label="Incorrect" value={result.incorrect} cls="text-rose-300" />
            <ResTile label="Unattempted" value={result.unattempted} cls="text-white/70" />
            <ResTile label="Negative" value={`−${result.negative}`} cls="text-amber-300" />
          </div>
        </div>

        {/* Section breakdown */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {Object.entries(result.perSection).map(([name, s]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sec = s as any
            return (
              <div key={name} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{name}</span>
                  <span className="text-sm font-bold">{Math.round(sec.score * 100) / 100} / {sec.max}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{sec.correct} correct of {sec.total}</div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold">Review</span>
          {(['all', 'correct', 'incorrect', 'unattempted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize ${filter === f ? 'bg-[#4A235A] text-white' : 'border text-muted-foreground hover:bg-accent'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Question review */}
        <div className="mt-4 space-y-3 pb-12">
          {shown.map((q) => (
            <ReviewCard key={q.id} q={q} ans={answers[q.id]} state={result.detail[q.id]?.state} delta={result.detail[q.id]?.delta} />
          ))}
        </div>
      </div>
    </div>
  )
}
function ResTile({ label, value, cls }: { label: string; value: React.ReactNode; cls: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <div className={`text-2xl font-extrabold tabular-nums ${cls}`}>{value}</div>
      <div className="text-[11px] text-white/70">{label}</div>
    </div>
  )
}

function ReviewCard({ q, ans, state, delta }: { q: Q; ans?: Ans; state?: string; delta?: number }) {
  const [open, setOpen] = useState(false)
  const stateMeta: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
    correct: { icon: <CheckCircle2 className="h-4 w-4" />, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300', label: 'Correct' },
    incorrect: { icon: <XCircle className="h-4 w-4" />, cls: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-300', label: 'Incorrect' },
    unattempted: { icon: <Circle className="h-4 w-4" />, cls: 'text-muted-foreground bg-muted', label: 'Unattempted' },
    bonus: { icon: <CheckCircle2 className="h-4 w-4" />, cls: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300', label: 'Bonus (awarded)' },
    ungraded: { icon: <AlertTriangle className="h-4 w-4" />, cls: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300', label: 'Descriptive' },
  }
  const sm = stateMeta[state || 'unattempted'] || stateMeta.unattempted
  const yourAns = q.isNat ? (ans?.nat || '—') : (ans?.keys?.length ? ans.keys.join(', ') : '—')
  const correctAns = q.isNat ? q.answer : (q.correctOptions?.length ? q.correctOptions.join(', ') : '—')

  return (
    <div className="rounded-xl border bg-card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-3 p-4 text-left">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold">{q.no}</span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${sm.cls}`}>{sm.icon}{sm.label}</span>
            <TypeBadge type={q.isNat ? 'NAT' : q.type} />
            <span className="text-[11px] text-muted-foreground">{q.subject}</span>
            {typeof delta === 'number' && delta !== 0 && (
              <span className={`text-[11px] font-bold ${delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{delta > 0 ? '+' : ''}{Math.round(delta * 100) / 100}</span>
            )}
          </div>
          <div className="line-clamp-2 text-sm text-foreground"><MathRenderer text={q.stem} /></div>
        </div>
        <ChevronRight className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="border-t px-4 py-4 sm:px-5">
          <div className="mb-4 whitespace-pre-wrap text-[15px] leading-[1.9]"><MathRenderer text={q.stem} /></div>

          {!q.isNat && q.options.length > 0 && (
            <ul className="mb-4 space-y-2">
              {q.options.map((o) => {
                const isCorrect = q.correctOptions.includes(o.key)
                const isChosen = ans?.keys?.includes(o.key)
                return (
                  <li key={o.key} className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${isCorrect ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10' : isChosen ? 'border-rose-300 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10' : ''}`}>
                    <span className="font-bold">{o.key}</span>
                    <span className="flex-1"><MathRenderer text={o.text} /></span>
                    {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                    {isChosen && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-rose-600" />}
                  </li>
                )
              })}
            </ul>
          )}

          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <div><span className="text-muted-foreground">Your answer: </span><b className={state === 'correct' ? 'text-emerald-600' : state === 'incorrect' ? 'text-rose-600' : ''}>{yourAns}</b></div>
            <div><span className="text-muted-foreground">Correct answer: </span><b className="text-emerald-600">{correctAns}</b></div>
          </div>

          <Solution q={q} />
        </div>
      )}
    </div>
  )
}

function Solution({ q }: { q: Q }) {
  const sol = q.solution
  const hasSteps = sol && Array.isArray(sol.steps) && sol.steps.length > 0
  if (!hasSteps && !q.understand?.plain && !sol?.result) {
    return <p className="text-sm text-muted-foreground">No detailed solution available for this question.</p>
  }
  return (
    <div className="rounded-lg bg-muted/40 p-4">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Solution</div>
      {q.understand?.plain && (
        <div className="mb-3 text-sm leading-relaxed text-foreground/90"><MathRenderer text={q.understand.plain} /></div>
      )}
      {hasSteps && (
        <ol className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {sol.steps.map((s: any, i: number) => (
            <li key={i} className="text-sm">
              {s.title && <div className="font-semibold text-foreground">{i + 1}. <MathRenderer text={s.title} /></div>}
              {s.formula_raw && <div className="my-1 overflow-x-auto"><MathRenderer text={s.formula_raw} /></div>}
              {s.apply && <div className="text-foreground/85"><MathRenderer text={s.apply} /></div>}
              {s.note && <div className="mt-0.5 text-xs text-muted-foreground"><MathRenderer text={s.note} /></div>}
            </li>
          ))}
        </ol>
      )}
      {sol?.result && (
        <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
          <MathRenderer text={sol.result} />
        </div>
      )}
    </div>
  )
}
