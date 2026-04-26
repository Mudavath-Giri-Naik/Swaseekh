"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  BookOpen,
  ClipboardList,
  FileText,
  CreditCard,
  Settings,
  ChevronRight,
  GraduationCap,
  LogOut,
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
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

/* ─── Subjects list for the Questions dropdown ──────────────────────────── */
const questionSubjects = [
  { name: "Discrete Mathematics", slug: "discrete-mathematics" },
  { name: "Linear Algebra", slug: "linear-algebra" },
  { name: "Calculus", slug: "calculus" },
  { name: "Probability & Statistics", slug: "probability-statistics" },
  { name: "Digital Logic", slug: "digital-logic" },
  { name: "Computer Organization", slug: "computer-organization" },
  { name: "Programming & DS", slug: "programming-ds" },
  { name: "Algorithms", slug: "algorithms" },
  { name: "Theory of Computation", slug: "theory-of-computation" },
  { name: "Compiler Design", slug: "compiler-design" },
  { name: "Operating System", slug: "operating-systems" },
  { name: "Databases", slug: "databases" },
]

const mockTests = [
  { name: "Full Length Test 1", slug: "flt-1" },
  { name: "Full Length Test 2", slug: "flt-2" },
  { name: "Subject Test — DM", slug: "subject-dm" },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { subjectTopics } = useSidebarData()
  const { data: session } = useSession()
  const [showLogout, setShowLogout] = React.useState(false)
  const isCCDMode = subjectTopics !== null && subjectTopics.length > 0

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* ─── Header: Branding ──────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white text-sm font-bold">
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
            {/* Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Syllabus */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/gate"}>
                      <Link href="/gate">
                        <BookOpen className="h-4 w-4" />
                        <span>Syllabus</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Questions */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/gate/questions")}>
                      <Link href="/gate/questions">
                        <ClipboardList className="h-4 w-4" />
                        <span>Questions</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Mock Tests — Collapsible */}
                  <Collapsible asChild className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip="Mock Tests">
                          <FileText className="h-4 w-4" />
                          <span>Mock Tests</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                          {mockTests.map((test) => (
                            <li key={test.slug}>
                              <span className="block rounded-md px-2 py-1.5 text-xs text-muted-foreground cursor-not-allowed">
                                {test.name}
                                <span className="ml-1 text-[10px] opacity-60">Soon</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Settings */}
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/pricing"}>
                      <Link href="/pricing">
                        <CreditCard className="h-4 w-4" />
                        <span>Pricing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/contact"}>
                      <Link href="/contact">
                        <Settings className="h-4 w-4" />
                        <span>Contact</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* ─── Footer ────────────────────────────────────────────── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="relative">
            {/* Logout Popover */}
            {showLogout && (
              <div className="absolute bottom-full left-0 right-0 mb-1 mx-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setShowLogout(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
            <SidebarMenuButton size="lg" onClick={() => setShowLogout(prev => !prev)} className="cursor-pointer">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-bold">
                  {session?.user?.name?.[0]?.toUpperCase() || 'S'}
                </div>
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold">{session?.user?.name || 'Student'}</span>
                  {(session?.user as any)?.plan === 'pro' && (
                    <span className="bg-[#4A235A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                      Pro
                    </span>
                  )}
                </div>
                <span className="truncate text-xs text-muted-foreground">{session?.user?.email || 'Free Plan'}</span>
                {(session?.user as any)?.plan === 'pro' && (session?.user as any)?.subscriptionExpiresAt && (
                  <span className="truncate text-[10px] text-muted-foreground/80 mt-0.5">
                    Valid till: {new Date((session?.user as any).subscriptionExpiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
