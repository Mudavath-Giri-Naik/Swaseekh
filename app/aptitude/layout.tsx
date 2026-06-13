import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aptitude | Swaseekh',
  description: 'Quantitative Aptitude practice with RS Agarwal questions, formulas, and step-by-step solutions.',
}

export default function AptitudeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
