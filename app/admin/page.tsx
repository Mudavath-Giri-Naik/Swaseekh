'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CircleDollarSign,
  Users,
  CreditCard,
  Activity,
  BookOpen,
  GraduationCap,
  Layers,
  ListChecks,
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
import RevenueChart from './_components/revenue-chart'
import RecentSales from './_components/recent-sales'

/* ─── Stat types — match the shape returned by /api/admin/stats ──────── */

interface RecentSale {
  id: string
  amount: number
  paidAt: string | null
  user: { name: string; email: string; image: string }
}

interface Stats {
  totals: {
    revenue: number
    revenueThisMonth: number
    revenueLastMonth: number
    users: number
    newUsersThisMonth: number
    newUsersLastMonth: number
    proUsers: number
    salesThisMonth: number
    salesLastMonth: number
    activeNow: number
    questions: number
    subjects: number
    topics: number
    concepts: number
  }
  planBreakdown: Record<string, number>
  monthlyRevenue: { name: string; total: number }[]
  recentSales: RecentSale[]
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function pctDelta(curr: number, prev: number): string {
  if (!prev) return curr > 0 ? '+100%' : '+0%'
  const delta = ((curr - prev) / prev) * 100
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(1)}%`
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error((await res.json())?.error ?? 'Failed to load')
        }
        return res.json() as Promise<Stats>
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto mt-24 max-w-md px-6 text-center">
        <p className="text-sm font-medium text-destructive">{error ?? 'Failed to load'}</p>
        <Link
          href="/gate"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
    )
  }

  const t = data.totals
  const proCount = data.planBreakdown.pro ?? 0
  const freeCount = data.planBreakdown.free ?? 0

  return (
    <div className="flex flex-col">
      <AppHeader title="Admin" />
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time stats for Swaseekh.
          </p>
        </div>
        <Link
          href="/gate"
          className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="mt-6 space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* ─── Overview ─────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={INR.format(t.revenue)}
              hint={`${pctDelta(t.revenueThisMonth, t.revenueLastMonth)} from last month`}
              icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Subscribers"
              value={`+${t.newUsersThisMonth}`}
              hint={`${pctDelta(t.newUsersThisMonth, t.newUsersLastMonth)} from last month`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Sales"
              value={`+${t.salesThisMonth}`}
              hint={`${pctDelta(t.salesThisMonth, t.salesLastMonth)} from last month`}
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Active Now"
              value={`+${t.activeNow}`}
              hint="logged in within the last hour"
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Revenue by month (last 12)</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart data={data.monthlyRevenue} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>
                  {t.salesThisMonth} sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales items={data.recentSales} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Content stats ───────────────────────────────────── */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Subjects"
              value={String(t.subjects)}
              hint="from MongoDB `subjects`"
              icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Topics"
              value={String(t.topics)}
              hint="from MongoDB `topics`"
              icon={<Layers className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Concepts"
              value={String(t.concepts)}
              hint="from MongoDB `concepts`"
              icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Questions"
              value={String(t.questions)}
              hint="from MongoDB `questions`"
              icon={<ListChecks className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </TabsContent>

        {/* ─── User breakdown ──────────────────────────────────── */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Total Users"
              value={String(t.users)}
              hint="across all plans"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Pro"
              value={String(proCount)}
              hint={`${((proCount / Math.max(1, t.users)) * 100).toFixed(1)}% of users`}
              icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Free"
              value={String(freeCount)}
              hint={`${((freeCount / Math.max(1, t.users)) * 100).toFixed(1)}% of users`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

/* ─── Stat card ──────────────────────────────────────────────────────── */

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}
