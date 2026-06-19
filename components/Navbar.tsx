'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { Menu, X, ChevronsRight } from 'lucide-react'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import { ShimmerButton } from '@/components/ui/shimmer-button'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const NAV_LINKS = [
  { label: 'Syllabus', href: '/gate' },
  { label: 'PYQs', href: '/gate/questions' },
  { label: 'Aptitude', href: '/aptitude' },
  { label: 'Mock Tests', href: '/mock-tests' },
  { label: 'Pricing', href: '/pricing' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      {/* Mobile Menu Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-white/30 backdrop-blur-md z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <header className={`absolute top-[24px] left-0 right-0 z-50 flex justify-center px-4 ${inter.className}`}>
        {/* ─── Desktop & Tablet navbar ─────────────────────────────────────── */}
        <div className="hidden md:flex items-center justify-between bg-white rounded-[50px] border border-[#EBE5DE] px-[24px] py-[16px] w-full max-w-[960px] mx-auto">
          
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center text-[#F26419]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor"/>
                <path d="M12 7L7 12L12 17L17 12L12 7Z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-[22px] tracking-tight text-[#1A1A2E]">Swaseekh</span>
          </Link>

          {/* Center: Links */}
          <nav>
            <ul className="flex items-center gap-[28px]">
              {NAV_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href)
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`text-[16px] transition-colors whitespace-nowrap ${isActive ? 'text-[#F26419] font-semibold' : 'text-[#555] font-medium hover:text-[#1A1A2E]'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Right: CTA */}
          <div className="shrink-0">
            {session?.user ? (
              <ShimmerButton 
                href="/dashboard"
                className="pl-2.5 pr-6 py-2 shadow-2xl"
              >
                <div className="bg-white rounded-full flex items-center justify-center w-[30px] h-[30px] overflow-hidden shrink-0">
                  {session.user.image ? (
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || 'User'} 
                      width={30} 
                      height={30} 
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <span className="font-bold text-black text-sm">
                      {session.user.name?.[0]?.toUpperCase() || 'S'}
                    </span>
                  )}
                </div>
                <span className="text-[16px] font-medium text-white">
                  {session.user.name 
                    ? (session.user.name.length > 15 ? session.user.name.slice(0, 15) + '...' : session.user.name) 
                    : 'Dashboard'}
                </span>
              </ShimmerButton>
            ) : (
              <ShimmerButton 
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="pl-1.5 pr-6 py-2 shadow-2xl"
              >
                <div className="bg-white text-black rounded-full p-1.5 flex items-center justify-center w-[30px] h-[30px]">
                  <ChevronsRight size={18} strokeWidth={3} />
                </div>
                <span className="text-[16px] font-medium text-white">Sign in</span>
              </ShimmerButton>
            )}
          </div>
        </div>

        {/* ─── Mobile navbar ───────────────────────────────────────────────── */}
        <div className="flex md:hidden flex-col w-full bg-white rounded-3xl border border-[#EBE5DE] py-3.5 px-4 relative z-50">
          <div className="flex items-center justify-between w-full pl-2 pr-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center text-[#F26419]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor"/>
                  <path d="M12 7L7 12L12 17L17 12L12 7Z" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-[22px] tracking-tight text-[#1A1A2E]">Swaseekh</span>
            </Link>
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-full bg-slate-50 text-slate-600"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileOpen && (
            <nav className="flex flex-col items-center gap-5 pt-8 pb-4">
              {NAV_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-[18px] font-medium ${isActive ? 'text-[#F26419]' : 'text-slate-600'}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              
              <div className="mt-3">
                {session?.user ? (
                  <ShimmerButton 
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="pl-2.5 pr-6 py-2 shadow-2xl w-full"
                  >
                    <div className="bg-white rounded-full flex items-center justify-center w-[30px] h-[30px] overflow-hidden shrink-0">
                      {session.user.image ? (
                        <Image 
                          src={session.user.image} 
                          alt={session.user.name || 'User'} 
                          width={30} 
                          height={30} 
                          className="rounded-full object-cover w-full h-full"
                        />
                      ) : (
                        <span className="font-bold text-black text-sm">
                          {session.user.name?.[0]?.toUpperCase() || 'S'}
                        </span>
                      )}
                    </div>
                    <span className="text-[18px] font-medium text-white">
                      {session.user.name 
                        ? (session.user.name.length > 15 ? session.user.name.slice(0, 15) + '...' : session.user.name) 
                        : 'Dashboard'}
                    </span>
                  </ShimmerButton>
                ) : (
                  <ShimmerButton 
                    onClick={() => { setMobileOpen(false); signIn('google', { callbackUrl: '/dashboard' }); }}
                    className="pl-1.5 pr-6 py-2 shadow-2xl w-full"
                  >
                    <div className="bg-white text-black rounded-full p-1.5 flex items-center justify-center w-[30px] h-[30px]">
                      <ChevronsRight size={18} strokeWidth={3} />
                    </div>
                    <span className="text-[18px] font-medium text-white">Sign in</span>
                  </ShimmerButton>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
