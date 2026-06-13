import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Questions | Swaseekh GATE',
  description: 'Practice previous year questions for GATE CS',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function QuestionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
