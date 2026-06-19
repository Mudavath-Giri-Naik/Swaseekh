"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  BookOpen,
  HelpCircle,
  ClipboardCheck,
  CreditCard,
  Settings,
  LogOut,
  LayoutDashboard,
  Sparkles,
  User as UserIcon,
  Bell,
  ChevronsUpDown,
  TrendingUp,
} from "lucide-react"

import { useSidebarData } from "@/components/sidebar-context"
import { SidebarToc } from "@/components/sidebar-toc"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { subjectTopics } = useSidebarData()
  const { data: session } = useSession()
  const isCCDMode = subjectTopics !== null && subjectTopics.length > 0
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean } | undefined)?.isAdmin)
  const isPro = (session?.user as { plan?: string } | undefined)?.plan === 'pro'

  // Total question count for the "Questions" nav label
  const [questionCount, setQuestionCount] = React.useState<number | null>(null)
  React.useEffect(() => {
    let cancelled = false
    fetch('/api/questions?limit=1')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && typeof d?.total === 'number') {
          setQuestionCount(d.total)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Aptitude question count
  const [aptitudeCount, setAptitudeCount] = React.useState<number | null>(null)
  React.useEffect(() => {
    let cancelled = false
    fetch('/api/aptitude/questions?limit=1')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && typeof d?.total === 'number') {
          setAptitudeCount(d.total)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <Sidebar
      collapsible="icon"
      className="!border-r-0"
      {...props}
    >
      {/* ─── Header: Branding ──────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Swaseekh">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-bold">
                  S
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Swaseekh</span>
                  <span className="truncate text-xs text-muted-foreground">GATE Preparation</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ─── Content ───────────────────────────────────────────── */}
      <SidebarContent>
        {isCCDMode ? (
          /* ─── CCD Mode: Show Table of Contents ─── */
          <SidebarToc />
        ) : (
          /* ─── Default Mode: Navigation Items ─── */
          <>
            {/* General */}
            <SidebarGroup>
              <SidebarGroupLabel>General</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Dashboard — public, first item */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard"}
                      tooltip="Dashboard"
                    >
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Syllabus */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/gate"}
                      tooltip="Syllabus"
                    >
                      <Link href="/gate">
                        <BookOpen className="h-4 w-4" />
                        <span>Syllabus</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Questions */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith("/gate/questions")}
                      tooltip="Questions"
                    >
                      <Link href="/gate/questions">
                        <HelpCircle className="h-4 w-4" />
                        <span>
                          Questions
                          {questionCount !== null && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({questionCount})
                            </span>
                          )}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Aptitude */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith("/aptitude")}
                      tooltip="Aptitude"
                    >
                      <Link href="/aptitude">
                        <TrendingUp className="h-4 w-4" />
                        <span>
                          Aptitude
                          {aptitudeCount !== null && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({aptitudeCount})
                            </span>
                          )}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Mock Tests */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith("/mock-tests")}
                      tooltip="Mock Tests"
                    >
                      <Link href="/mock-tests">
                        <ClipboardCheck className="h-4 w-4" />
                        <span>Mock Tests</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Account */}
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/pricing"}
                      tooltip="Pricing"
                    >
                      <Link href="/pricing">
                        <CreditCard className="h-4 w-4" />
                        <span>Pricing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/contact"}
                      tooltip="Contact"
                    >
                      <Link href="/contact">
                        <Settings className="h-4 w-4" />
                        <span>Contact</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Admin (visible only when the session email is allow-listed) */}
            {isAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/admin"}
                        tooltip="Overview"
                      >
                        <Link href="/admin">
                          <Sparkles className="h-4 w-4" />
                          <span>Overview</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith("/admin/users")}
                        tooltip="Users"
                      >
                        <Link href="/admin/users">
                          <UserIcon className="h-4 w-4" />
                          <span>Users</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>

      {/* ─── Footer: shadcn-admin style user dropdown ──────────── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold">
                      {session?.user?.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold flex items-center gap-1.5">
                      {session?.user?.name || 'Student'}
                      {isPro && (
                        <span className="bg-[#4A235A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                          Pro
                        </span>
                      )}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {session?.user?.email || 'Free Plan'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="size-8 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold">
                        {session?.user?.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                    )}
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user?.name || 'Student'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {session?.user?.email || ''}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isPro && (
                  <>
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/pricing" className="cursor-pointer">
                          <Sparkles className="mr-2 size-4" />
                          Upgrade to Pro
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <UserIcon className="mr-2 size-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing" className="cursor-pointer">
                      <CreditCard className="mr-2 size-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Bell className="mr-2 size-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}
