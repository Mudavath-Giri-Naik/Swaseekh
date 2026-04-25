import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/auth-provider'



export const metadata: Metadata = {
  title: {
    default: 'Swaseekh',
    template: '%s | Swaseekh',
  },
  description:
    'Master every concept. Crack any exam. Structured preparation for GATE, NEET, UPSC, JEE with previous year questions and detailed explanations.',
  keywords: [
    'GATE',
    'GATE CS',
    'Computer Science',
    'GATE preparation',
    'PYQ',
    'previous year questions',
    'exam preparation',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black font-sans antialiased">
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
