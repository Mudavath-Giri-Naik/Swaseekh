import type { Metadata, Viewport } from 'next'
import { AppShell } from "@/components/app-shell"

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

export default function AptitudeLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
