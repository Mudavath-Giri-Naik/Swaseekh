"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarDataProvider, useSidebarData } from "@/components/sidebar-context"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function GateHeader() {
  const pathname = usePathname()
  const { subjectName, subjectSlug, conceptName } = useSidebarData()

  // Pages with their own top bar (back link / filters / etc.) suppress the
  // layout's default GateHeader to avoid double-stacking.
  const isQuestionDetail =
    /^\/gate\/questions\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/.test(pathname)
  const isQuestionsList = pathname === '/gate/questions'
  if (isQuestionDetail || isQuestionsList) return null

  const isSyllabus = pathname === "/gate"
  const isQuestions = pathname.startsWith("/gate/questions/")
  const isCCD = !isSyllabus && !isQuestions && pathname.startsWith("/gate/")

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4 sticky top-0 z-40">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/gate">GATE</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {isSyllabus && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Syllabus</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}

          {isQuestions && conceptName && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href="/gate/questions">PYQ's</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{conceptName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}

          {isCCD && subjectName && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href={`/gate/${subjectSlug}`}>{subjectName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{conceptName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

export default function GateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarDataProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <GateHeader />
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </SidebarDataProvider>
  )
}
