'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Layers,
  GraduationCap,
  ListChecks,
  FlaskConical,
  ArrowRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppHeader } from '@/components/app-header'
import YearChart from './_components/year-chart'
import SubjectList from './_components/subject-list'

interface Stats {
  totals: {
    subjects: number
    topics: number
    concepts: number
    questions: number
    formulas: number
  }
  yearSeries: { name: string; total: number }[]
  difficulty: Record<string, number>
  subjectList: { name: string; count: number }[]
}

let _cachedDashboard: Stats | null = null

export default function DashboardPage() {
  const [data, setData] = useState<Stats | null>(_cachedDashboard)
  const [loading, setLoading] = useState(!_cachedDashboard)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => {
        _cachedDashboard = d
        setData(d)
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    )
  }
  if (!data) {
    return (
      <div className="mx-auto mt-24 max-w-md px-6 text-center text-sm text-slate-500">
        Failed to load dashboard.
      </div>
    )
  }

  const t = data.totals
  const totalDifficulty =
    (data.difficulty.easy ?? 0) +
    (data.difficulty.medium ?? 0) +
    (data.difficulty.hard ?? 0)

  return (
    <div className="flex flex-col">
      {/* ── Top bar: sidebar toggle + theme + settings + profile ── */}
      <AppHeader title="Dashboard" />

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live look at the whole Swaseekh question bank.
          </p>
        </div>

        <Tabs defaultValue="overview" className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
            </TabsList>
            <Link
              href="/gate"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Syllabus
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* ── Overview ──────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-4">
            {/* Stat tiles: 4 in a row on mobile too (compact mode), 4 cols
                fully sized from sm and up. */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <StatCard
                title="Subjects"
                value={String(t.subjects)}
                hint="across the syllabus"
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Topics"
                value={String(t.topics)}
                hint="grouped under subjects"
                icon={<Layers className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Concepts"
                value={String(t.concepts)}
                hint="study units with full content"
                icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Questions"
                value={String(t.questions)}
                hint={`${t.formulas} formulas indexed`}
                icon={<ListChecks className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Questions by Year</CardTitle>
                  <CardDescription>
                    Past 10 years of GATE coverage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <YearChart data={data.yearSeries} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Top Subjects</CardTitle>
                  <CardDescription>
                    Question counts per subject.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubjectList items={data.subjectList.slice(0, 8)} total={t.questions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Subjects ──────────────────────────────────────── */}
          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Subjects</CardTitle>
                <CardDescription>
                  {data.subjectList.length} subjects · {t.questions} total questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubjectList items={data.subjectList} total={t.questions} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Difficulty ────────────────────────────────────── */}
          <TabsContent value="difficulty" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <DifficultyCard label="Easy"   color="emerald" count={data.difficulty.easy ?? 0}   total={totalDifficulty} />
              <DifficultyCard label="Medium" color="amber"   count={data.difficulty.medium ?? 0} total={totalDifficulty} />
              <DifficultyCard label="Hard"   color="rose"    count={data.difficulty.hard ?? 0}   total={totalDifficulty} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Formula coverage</CardTitle>
                <CardDescription>
                  {t.formulas} formulas indexed across {t.concepts} concepts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <FlaskConical className="h-5 w-5 text-violet-500" />
                  Hover any formula chip to see its KaTeX preview anywhere in
                  the app.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

/* ─── Cards ──────────────────────────────────────────────────────────── */

function StatCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string
  value: string
  hint: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1 sm:p-6 sm:pb-2">
        <CardTitle className="text-[11px] font-medium sm:text-sm">
          {title}
        </CardTitle>
        <span className="hidden sm:inline">{icon}</span>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        <div className="text-lg font-bold sm:text-2xl">{value}</div>
        <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground sm:mt-1 sm:line-clamp-none sm:text-xs">
          {hint}
        </p>
      </CardContent>
    </Card>
  )
}

const TONE: Record<string, { bar: string; text: string; bg: string }> = {
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  amber:   { bar: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50' },
  rose:    { bar: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50' },
}

function DifficultyCard({
  label,
  color,
  count,
  total,
}: {
  label: string
  color: keyof typeof TONE
  count: number
  total: number
}) {
  const t = TONE[color]
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-semibold ${t.text}`}>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold">{count}</div>
          <div className="text-xs text-muted-foreground">{pct.toFixed(0)}% of total</div>
        </div>
        <div className={`mt-3 h-1.5 w-full overflow-hidden rounded-full ${t.bg} dark:bg-muted`}>
          <div
            className={`h-full rounded-full ${t.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
