'use client'

import {
  BookOpen,
  Flame,
  Quote,
  Network,
  Target,
  CheckCircle2,
  Star,
  Layers,
  TrendingUp,
  Bookmark,
  Share2,
  Lightbulb,
  Trophy,
  Clock,
} from 'lucide-react'
import { CardStack, CardStackItem } from '@/components/ui/card-stack'

/* ─── Small card faces (used by the desktop side stacks) ─────────────── */

function PyqCard() {
  return (
    <div className="flex h-full flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold text-indigo-700">
            <BookOpen size={9} /> GATE 2023 · CN
          </span>
          <span className="text-[9px] font-medium text-slate-400">2 marks</span>
        </div>
        <p className="line-clamp-3 text-[11px] leading-snug text-slate-700">
          Q. In selective repeat ARQ, if the sender window size is{' '}
          <span className="font-mono text-indigo-600">2^(n-1)</span>, the max
          sequence number is…
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-[10px]">
          <span className="font-semibold text-indigo-600">View solution →</span>
          <span className="text-slate-400">ARQ</span>
        </div>
      </div>
    </div>
  )
}

function TestimonialCard() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
      <div className="flex flex-1 flex-col p-3">
        <Quote size={14} className="mb-1.5 text-amber-500" />
        <p className="text-[11px] italic leading-snug text-slate-700">
          “Concept maps cracked TOC for me — confused to confident in 2 weeks.{' '}
          <span className="font-semibold not-italic text-slate-900">
            AIR 47.
          </span>
          ”
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">
            R
          </span>
          <div className="leading-tight">
            <div className="text-[10px] font-semibold text-slate-900">
              Riya Patel
            </div>
            <div className="text-[9px] text-slate-500">GATE 2024 · CSE</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConceptCard() {
  const bullets = ['Structural', 'Data hazard', 'Control hazard']
  return (
    <div className="flex h-full flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
          <Network size={11} className="text-emerald-600" />
          Pipelining Hazards
        </div>
        <ul className="space-y-1">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-center gap-1.5 text-[10px] text-slate-600"
            >
              <CheckCircle2 size={10} className="text-emerald-500" />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between pt-2 text-[10px]">
          <span className="font-semibold text-emerald-600">Open concept →</span>
          <span className="text-slate-400">3 PYQs</span>
        </div>
      </div>
    </div>
  )
}

function MockTestCard() {
  const value = 78
  const r = 14
  const c = 2 * Math.PI * r
  const dashOffset = c - (value / 100) * c
  return (
    <div className="flex h-full flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-pink-500" />
      <div className="flex flex-1 items-center gap-3 p-3">
        <div className="relative h-12 w-12 shrink-0">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r={r}
              stroke="#fce7f3"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="18"
              cy="18"
              r={r}
              stroke="url(#mtGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={dashOffset}
            />
            <defs>
              <linearGradient id="mtGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-rose-600">
            {value}%
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
            <Target size={11} className="text-rose-500" />
            Mock #12
          </div>
          <div className="mt-0.5 text-[9px] text-slate-500">
            <span className="font-semibold text-slate-900">39 / 50</span> · Top
            8%
          </div>
          <div className="mt-1.5 inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-semibold text-rose-600">
            +6 from last
          </div>
        </div>
      </div>
    </div>
  )
}

function StreakCard() {
  const days = [1, 1, 1, 1, 0, 1, 1]
  return (
    <div className="flex h-full flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-cyan-500" />
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-700">
            <Flame size={11} className="text-orange-500" />
            12-day streak
          </span>
          <span className="text-[9px] font-medium text-sky-600">On track</span>
        </div>
        <div className="flex items-center gap-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`h-5 w-full rounded ${
                  days[i]
                    ? 'bg-gradient-to-b from-sky-400 to-cyan-500'
                    : 'bg-slate-100'
                }`}
              />
              <span className="text-[8px] font-medium text-slate-400">{d}</span>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-1 text-[10px] text-slate-600">
          Today:{' '}
          <span className="font-semibold text-slate-900">Algorithms · 2h</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Big mobile faces (rich content for the taller mobile stack) ──── */

function BigPyqCard() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-3.5 py-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold tracking-wide text-indigo-700">
          <BookOpen size={10} /> GATE 2024 · Algorithms
        </span>
        <span className="text-[9px] font-semibold text-slate-400">2 marks</span>
      </div>

      <div className="flex flex-1 flex-col px-3.5 py-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Question 12
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold text-amber-700">
            <span className="h-1 w-1 rounded-full bg-amber-500" /> Medium
          </span>
        </div>

        <p className="text-[12px] font-semibold leading-snug text-slate-900">
          Time complexity of inserting{' '}
          <span className="font-mono text-indigo-600">n</span> elements into a
          balanced BST is:
        </p>

        <div className="mt-2 space-y-1">
          {[
            { label: 'A', text: 'O(n)' },
            { label: 'B', text: 'O(n log n)', selected: true },
            { label: 'C', text: 'O(n²)' },
          ].map((o) => (
            <div
              key={o.label}
              className={`flex items-center gap-2 rounded-md border px-2 py-1 text-[10px] ${
                o.selected
                  ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${
                  o.selected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {o.label}
              </span>
              {o.text}
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {['BST', 'AVL Trees', 'Time Complexity'].map((c) => (
            <span
              key={c}
              className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-700"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-[10px] font-bold text-indigo-600">
            View solution →
          </span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Bookmark size={11} />
            <Share2 size={11} />
          </div>
        </div>
      </div>
    </div>
  )
}

function BigMockCard() {
  const value = 78
  const r = 32
  const c = 2 * Math.PI * r
  const dashOffset = c - (value / 100) * c
  const bars = [40, 50, 45, 55, 60, 72, 78]
  const subjects = [
    { name: 'Algorithms', pct: 88 },
    { name: 'OS', pct: 75 },
    { name: 'DBMS', pct: 82 },
  ]
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white px-3.5 py-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
          <Target size={11} className="text-rose-500" />
          Mock Test #14
        </span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
          Top 8%
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3.5 py-2.5">
        <div className="flex items-center gap-3">
          <div className="relative h-[72px] w-[72px] shrink-0">
            <svg className="h-[72px] w-[72px] -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={r}
                stroke="#fce7f3"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r={r}
                stroke="url(#bigMockGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={c}
                strokeDashoffset={dashOffset}
              />
              <defs>
                <linearGradient id="bigMockGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-rose-600">
                {value}%
              </span>
              <span className="text-[8px] font-medium text-slate-400">
                accuracy
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div>
              <div className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                Correct
              </div>
              <div className="text-[12px] font-bold text-slate-900">
                39 / 50
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-600">
              <Clock size={9} className="text-slate-400" />
              <span className="font-semibold text-slate-900">2h 18m</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
              <TrendingUp size={9} /> +6 from last
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          {subjects.map((s) => (
            <div key={s.name}>
              <div className="mb-0.5 flex items-center justify-between text-[10px]">
                <span className="font-medium text-slate-700">{s.name}</span>
                <span className="font-bold text-rose-600">{s.pct}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500"
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Last 7 mocks
            </span>
            <span className="text-[9px] font-bold text-rose-600">
              ↗ improving
            </span>
          </div>
          <div className="flex h-4 items-end gap-1">
            {bars.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-b from-rose-300 to-pink-500"
                style={{ height: `${v}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BigTestimonialCard() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="flex items-center justify-between border-b border-amber-100/60 px-3.5 py-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={11}
              className="fill-amber-400 stroke-amber-400"
            />
          ))}
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
          AIR 47 · GATE 2024
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3.5 py-2.5">
        <Quote size={16} className="mb-1 text-amber-400" />
        <p className="text-[11px] font-medium italic leading-snug text-slate-700">
          “Swaseekh&apos;s concept maps cracked TOC for me — confused to
          confident in 2 weeks. The PYQ tagging is{' '}
          <span className="not-italic font-bold text-slate-900">
            brilliant
          </span>
          .”
        </p>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[
            { label: 'Rank', value: '47', icon: Trophy },
            { label: 'Mock avg', value: '82%', icon: Target },
            { label: 'Prep', value: '6 mo', icon: Clock },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-md border border-amber-100 bg-white/70 px-1.5 py-1 text-center"
            >
              <s.icon size={10} className="mx-auto text-amber-500" />
              <div className="text-[11px] font-extrabold text-slate-900">
                {s.value}
              </div>
              <div className="text-[7px] font-semibold uppercase tracking-wide text-slate-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2.5 border-t border-amber-100/60 pt-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white shadow-sm">
            R
          </span>
          <div className="leading-tight">
            <div className="text-[11px] font-bold text-slate-900">
              Riya Patel
            </div>
            <div className="text-[9px] text-slate-500">
              IIT Bombay · M.Tech CSE
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BigSubjectCard() {
  const topics = [
    { name: 'Process Scheduling', progress: 100 },
    { name: 'Synchronization', progress: 82 },
    { name: 'Deadlocks', progress: 65 },
    { name: 'Memory Management', progress: 40 },
    { name: 'File Systems', progress: 22 },
  ]
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-3.5 py-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
          <Layers size={11} className="text-emerald-600" />
          Operating Systems
        </span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
          8 / 12 mastered
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3.5 py-2.5">
        <div className="space-y-1.5">
          {topics.map((t) => (
            <div key={t.name}>
              <div className="mb-0.5 flex items-center justify-between text-[10px]">
                <span className="font-medium text-slate-700">{t.name}</span>
                <span
                  className={`font-bold ${
                    t.progress === 0 ? 'text-slate-400' : 'text-emerald-600'
                  }`}
                >
                  {t.progress}%
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  style={{ width: `${t.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[
            { v: '42', l: 'concepts' },
            { v: '128', l: 'PYQs' },
            { v: '14h', l: 'spent' },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-md bg-emerald-50/60 px-1.5 py-1 text-center"
            >
              <div className="text-[11px] font-extrabold text-emerald-700">
                {s.v}
              </div>
              <div className="text-[8px] font-semibold uppercase tracking-wide text-slate-500">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-[9px] font-medium text-slate-500">
            Last opened:{' '}
            <span className="font-semibold text-slate-700">2h ago</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-600">
            Continue →
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Stacks (split by side) ────────────────────────────────────────── */

const LEFT_ITEMS: CardStackItem[] = [
  { id: 'pyq', rotate: -5, content: <PyqCard /> },
  { id: 'concept', rotate: -3, content: <ConceptCard /> },
  { id: 'streak', rotate: -7, content: <StreakCard /> },
]

const RIGHT_ITEMS: CardStackItem[] = [
  { id: 'mock', rotate: 6, content: <MockTestCard /> },
  { id: 'testimonial', rotate: 4, content: <TestimonialCard /> },
]

const MOBILE_BIG_ITEMS: CardStackItem[] = [
  { id: 'm-pyq', rotate: -2.5, content: <BigPyqCard /> },
  { id: 'm-mock', rotate: 2, content: <BigMockCard /> },
  { id: 'm-testimonial', rotate: -2, content: <BigTestimonialCard /> },
  { id: 'm-subject', rotate: 2.5, content: <BigSubjectCard /> },
]

/** Left-side desktop stack */
export function LeftCardStack() {
  return (
    <CardStack
      items={LEFT_ITEMS}
      interval={2000}
      offset={7}
      className="h-32 w-40 xl:h-36 xl:w-44 2xl:h-40 2xl:w-48"
    />
  )
}

/** Right-side desktop stack */
export function RightCardStack() {
  return (
    <CardStack
      items={RIGHT_ITEMS}
      interval={2000}
      offset={7}
      className="h-32 w-40 xl:h-36 xl:w-44 2xl:h-40 2xl:w-48"
    />
  )
}

/** Mobile-only big stack — compact, content-rich faces (fits in one viewport) */
export function MobileCardStack() {
  return (
    <CardStack
      items={MOBILE_BIG_ITEMS}
      interval={2000}
      offset={8}
      className="h-[18rem] w-full sm:h-[19rem]"
    />
  )
}
