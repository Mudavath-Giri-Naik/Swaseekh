import type { Metadata, Viewport } from 'next'

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarDataProvider } from "@/components/sidebar-context"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: 'Aptitude | Swaseekh',
  description: 'Quantitative Aptitude practice with RS Agarwal questions, formulas, and step-by-step solutions.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

function readSidebarCookie(): boolean {
  if (typeof document === "undefined") return true
  const m = document.cookie.match(/(?:^|; )sidebar:state=(true|false)/)
  return !m ? true : m[1] === "true"
}

export default function AptitudeLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = readSidebarCookie()
  
  return (
    <SidebarDataProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar variant="floating" />
        <SidebarInset>
          <div className="flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </SidebarDataProvider>
  )
}
