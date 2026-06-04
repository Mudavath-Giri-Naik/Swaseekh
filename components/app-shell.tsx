"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarDataProvider } from "@/components/sidebar-context"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

/**
 * AppShell — shared sidebar + content wrapper. Sidebar variant is locked
 * to "floating" (the user-preferred look). Open/closed state still
 * persists across navigation via the `sidebar:state` cookie that
 * <SidebarProvider> writes on toggle.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const defaultOpen = readSidebarCookie()
  return (
    <SidebarDataProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar variant="floating" />
        <SidebarInset className="min-w-0 overflow-x-hidden">{children}</SidebarInset>
      </SidebarProvider>
    </SidebarDataProvider>
  )
}

/** Read `sidebar:state` from document.cookie. Defaults to `true` (open). */
function readSidebarCookie(): boolean {
  if (typeof document === "undefined") return true
  const match = document.cookie.match(/(?:^|; )sidebar:state=(true|false)/)
  if (!match) return true
  return match[1] === "true"
}
