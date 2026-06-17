'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardCheck, Clock, FileText, Trophy, ArrowRight } from 'lucide-react'
import { AppHeader } from '@/components/app-header'

interface YearInfo {
  year: number
  totalQuestions: number
  totalMarks: number
  durationMin: number
  typeCounts: { MCQ: number; MSQ: number; NAT: number }
  subjectCount: number
}

export default function MockTestsPage() {
  const [years, setYears] = useState<YearInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/mock-tests')
      .then((r) => r.json())
      .then((d) => {
        setYears(d.years ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  return (
    <div className="flex flex-col">
      <AppHeader title="Mock Tests" />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {/* Hero */}
        <div className="mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br from-[#4A235A] to-[#6b2f80] p-6 text-white sm:p-8 dark:border-transparent">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">GATE CS — Previous Year Papers</h1>
              <p className="mt-1.5 max-w-2xl text-sm text-white/80">
                Full exam simulation with the real GATE interface — live timer, question palette,
                mark-for-review, section navigation and authentic GATE marking (negative marking on MCQs).
                Tap a year to start.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border bg-muted/40" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border bg-card px-4 py-16 text-center text-muted-foreground">
            Failed to load mock tests. Please refresh.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {years.map((y) => (
              <Link
                key={y.year}
                href={`/mock-tests/${y.year}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-[#4A235A]/40 hover:shadow-lg dark:border-white/[0.06] dark:hover:border-violet-400/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold tracking-tight text-foreground">
                      GATE {y.year}
                    </span>
                    <span className="rounded-md bg-[#4A235A]/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#4A235A] dark:bg-violet-400/10 dark:text-violet-300">
                      Full Test
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Stat icon={<FileText className="h-4 w-4" />} label="Questions" value={y.totalQuestions} />
                    <Stat icon={<Trophy className="h-4 w-4" />} label="Marks" value={y.totalMarks} />
                    <Stat icon={<Clock className="h-4 w-4" />} label="Duration" value={`${Math.round(y.durationMin / 60)} hr`} />
                    <Stat
                      icon={<ClipboardCheck className="h-4 w-4" />}
                      label="Subjects"
                      value={y.subjectCount}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <TypePill label={`${y.typeCounts.MCQ} MCQ`} />
                    {y.typeCounts.MSQ > 0 && <TypePill label={`${y.typeCounts.MSQ} MSQ`} />}
                    {y.typeCounts.NAT > 0 && <TypePill label={`${y.typeCounts.NAT} NAT`} />}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-sm font-semibold text-[#4A235A] dark:text-violet-300">
                  Start Test
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="leading-tight">
        <div className="font-bold text-foreground">{value}</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function TypePill({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground dark:bg-white/[0.06]">
      {label}
    </span>
  )
}
