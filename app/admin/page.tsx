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
  ArrowUpDown,
  MoreHorizontal,
  Trash,
  RefreshCw,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

/* ─── Stat types — match the shape returned by /api/admin/stats ──────── */

interface RecentSale {
  id: string
  amount: number
  paidAt: string | null
  user: { name: string; email: string; image: string }
}

interface UserInfo {
  id: string
  name: string
  email: string
  image: string
  plan: string
  createdAt: string | null
  lastLoginAt: string | null
  isAdmin?: boolean
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
    dailyActive: number
    questions: number
    subjects: number
    topics: number
    concepts: number
  }
  planBreakdown: Record<string, number>
  monthlyRevenue: { name: string; total: number }[]
  recentSales: RecentSale[]
  allUsers: UserInfo[]
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(date)
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (['overview', 'content', 'users'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [])

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    window.history.replaceState(null, '', `#${val}`)
  }

  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userFilter, setUserFilter] = useState<'all' | 'pro' | 'free' | 'active_now' | 'daily_active'>('all')
  
  type SortField = 'name' | 'email' | 'plan' | 'createdAt' | 'lastLoginAt'
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const fetchData = () => {
    setLoading(true)
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
  }

  useEffect(() => {
    fetchData()
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

  const handleFilterClick = (filter: 'all' | 'pro' | 'free' | 'active_now' | 'daily_active') => {
    setUserFilter((prev) => (prev === filter ? 'all' : filter))
  }

  const nowTime = new Date().getTime()
  const oneHourMs = 60 * 60 * 1000
  const oneDayMs = 24 * 60 * 60 * 1000

  const filteredUsers = data.allUsers.filter((u) => {
    if (userFilter === 'all') return true
    if (userFilter === 'pro') return u.plan === 'pro'
    if (userFilter === 'free') return u.plan !== 'pro'
    
    if (userFilter === 'active_now') {
      if (!u.lastLoginAt) return false
      return nowTime - new Date(u.lastLoginAt).getTime() <= oneHourMs
    }
    if (userFilter === 'daily_active') {
      if (!u.lastLoginAt) return false
      return nowTime - new Date(u.lastLoginAt).getTime() <= oneDayMs
    }
    return true
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]
    
    // Handle nulls
    if (valA === null) valA = ''
    if (valB === null) valB = ''

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6 space-y-4">
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
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            <StatCard
              title="Total Users"
              value={String(t.users)}
              hint="across all plans"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              isActive={userFilter === 'all'}
              onClick={() => handleFilterClick('all')}
              compactOnMobile
            />
            <StatCard
              title="Pro"
              value={String(proCount)}
              hint={`${((proCount / Math.max(1, t.users)) * 100).toFixed(1)}% of users`}
              icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />}
              isActive={userFilter === 'pro'}
              onClick={() => handleFilterClick('pro')}
              compactOnMobile
            />
            <StatCard
              title="Free"
              value={String(freeCount)}
              hint={`${((freeCount / Math.max(1, t.users)) * 100).toFixed(1)}% of users`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              isActive={userFilter === 'free'}
              onClick={() => handleFilterClick('free')}
              compactOnMobile
            />
            <StatCard
              title="Active Now"
              value={String(t.activeNow)}
              hint="logged in < 1h ago"
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              isActive={userFilter === 'active_now'}
              onClick={() => handleFilterClick('active_now')}
              onRefresh={(e) => { e.stopPropagation(); fetchData() }}
              compactOnMobile
            />
            <StatCard
              title="Daily Active"
              value={String(t.dailyActive)}
              hint="logged in < 24h ago"
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              isActive={userFilter === 'daily_active'}
              onClick={() => handleFilterClick('daily_active')}
              compactOnMobile
            />
          </div>

          <div className="mt-6 w-full mx-auto [&>div]:rounded-sm [&>div]:border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="bg-background md:sticky left-0 z-20 w-[50px] md:w-[60px]">ID</TableHead>
                  <TableHead className="bg-background md:sticky md:left-[60px] z-20 w-[200px] md:w-[300px]">
                    <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('name')}>
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('email')}>
                      Email
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('plan')}>
                      Plan
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('createdAt')}>
                      Joined
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('lastLoginAt')}>
                      Last Login
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user, index) => (
                  <TableRow key={user.id} className="hover:bg-transparent">
                    <TableCell className="bg-background md:sticky left-0 z-10 font-medium border-r border-transparent">
                      {index + 1}
                    </TableCell>
                    <TableCell className="bg-background md:sticky md:left-[60px] z-10 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border">
                          {user.image ? (
                            <img 
                              src={user.image} 
                              alt={user.name} 
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-slate-500">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border border-blue-200 bg-blue-100 text-blue-700">
                          Admin
                        </div>
                      ) : (
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${user.plan === 'pro' ? 'border-orange-200 bg-orange-100 text-[#F26419]' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                          {user.plan === 'pro' ? 'Pro' : 'Free'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 hidden md:table-cell">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-slate-500 hidden lg:table-cell">{formatDateTime(user.lastLoginAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                            Copy email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                            Copy User ID
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash className="mr-2 h-4 w-4" /> Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {sortedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
  isActive = false,
  onClick,
  compactOnMobile = false,
  onRefresh,
}: {
  title: string
  value: string
  hint: string
  icon: React.ReactNode
  isActive?: boolean
  onClick?: () => void
  compactOnMobile?: boolean
  onRefresh?: (e: React.MouseEvent) => void
}) {
  return (
    <Card 
      onClick={onClick} 
      className={`relative ${onClick ? 'cursor-pointer transition-colors hover:border-[#F26419]/50' : ''} ${isActive ? 'border-[#F26419] ring-1 ring-[#F26419]' : ''} ${compactOnMobile ? 'p-1.5 sm:p-0' : ''}`}
    >
      <CardHeader className={`flex flex-row items-center space-y-0 ${compactOnMobile ? 'p-0 sm:p-6 sm:pb-2 pb-1 justify-center sm:justify-between' : 'pb-2 justify-between'}`}>
        <CardTitle className={`font-medium ${compactOnMobile ? 'text-[10px] leading-[1.1] sm:text-sm text-center sm:text-left truncate w-full sm:w-auto' : 'text-sm'} ${isActive ? 'text-[#F26419]' : ''}`}>
          {title}
        </CardTitle>
        <div className={`flex items-center gap-1 sm:gap-2 ${compactOnMobile ? 'absolute top-1 right-1 sm:static sm:flex' : ''}`}>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="p-1 sm:p-1.5 rounded-full hover:bg-slate-100 text-muted-foreground hover:text-slate-900 transition-colors z-10 bg-white shadow-sm sm:bg-transparent sm:shadow-none border sm:border-transparent"
              title="Refresh Data"
            >
              <RefreshCw className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
            </button>
          )}
          <div className={compactOnMobile ? 'hidden sm:block' : ''}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent className={compactOnMobile ? 'p-0 sm:p-6 sm:pt-0 text-center sm:text-left' : ''}>
        <div className={`font-bold ${compactOnMobile ? 'text-sm sm:text-2xl' : 'text-2xl'} ${isActive ? 'text-[#F26419]' : ''}`}>{value}</div>
        <p className={`text-xs text-muted-foreground ${compactOnMobile ? 'hidden sm:block mt-1' : 'mt-1'}`}>{hint}</p>
      </CardContent>
    </Card>
  )
}
