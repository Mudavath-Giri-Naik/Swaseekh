import type { Metadata } from 'next'
import { Inter, DM_Sans, Caveat } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { AppSettingsProvider } from '@/components/app-settings'
import { GlobalPrefetch } from '@/components/global-prefetch'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

// Handwriting display font — used for notebook-style headings only.
// Body text stays on Inter for readability.
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-handwriting',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://swaseekh.in'),
  title: {
    default: 'Swaseekh — GATE CS Preparation Platform',
    template: '%s | Swaseekh',
  },
  description:
    'Prepare for GATE CS (Computer Science) with Swaseekh: 2000+ previous year questions (PYQs) mapped to every syllabus concept, year-wise full-length mock tests, quantitative aptitude practice, and clear step-by-step solutions — built for GATE 2027 aspirants.',
  keywords: [
    'GATE CS',
    'GATE Computer Science',
    'GATE CS syllabus',
    'GATE CS previous year questions',
    'GATE CS PYQs',
    'GATE CS mock test',
    'GATE 2027 preparation',
    'quantitative aptitude',
    'GATE CSE',
    'previous year questions',
  ],
  applicationName: 'Swaseekh',
  authors: [{ name: 'Swaseekh' }],
  creator: 'Swaseekh',
  publisher: 'Swaseekh',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://swaseekh.in',
    siteName: 'Swaseekh',
    title: 'Swaseekh — GATE CS Preparation Platform',
    description:
      'GATE CS preparation, decoded. 2000+ PYQs mapped to every concept, year-wise mock tests, aptitude practice, and step-by-step solutions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swaseekh — GATE CS Preparation Platform',
    description:
      'GATE CS preparation, decoded. 2000+ PYQs mapped to every concept, year-wise mock tests, aptitude practice, and step-by-step solutions.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSans.variable} ${caveat.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ThemeProvider>
          <AppSettingsProvider>
            <GlobalPrefetch />
            <AuthProvider>
              <main>{children}</main>
            </AuthProvider>
          </AppSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
