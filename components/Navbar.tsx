'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ChevronRight, Menu, X } from 'lucide-react'
import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'], display: 'swap' })

const NAV_LINKS = [
  { label: 'GATE', href: '/gate' },
  { label: 'Aptitude', href: '/aptitude' },
  { label: 'Mock Tests', href: '/mock-tests' },
  { label: 'Pricing', href: '/pricing' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session, status } = useSession()
  const isAuthed = status === 'authenticated'

  return (
    <header className={`fixed top-4 left-0 right-0 z-50 flex justify-center px-4 ${outfit.className}`}>
      {/* ─── Desktop & Tablet navbar ─────────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-full border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] px-3 py-2 w-full max-w-5xl">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 pl-4">
          <div className="flex items-center justify-center text-[#FF6000]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor"/>
              <path d="M12 7L7 12L12 17L17 12L12 7Z" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-800">Swaseekh</span>
        </Link>

        {/* Center: Links */}
        <nav>
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: CTA */}
        <Link 
          href={isAuthed ? "/dashboard" : "/gate"} 
          className="group flex items-center gap-2 border border-[#FF6000] text-slate-800 rounded-full pl-2 pr-5 py-1.5 hover:bg-orange-50 transition-colors"
        >
          <div className="bg-[#FF6000] text-white rounded-full p-1.5 transition-transform group-hover:scale-105">
            <ChevronRight size={14} strokeWidth={3} />
          </div>
          <span className="text-sm font-semibold text-slate-800">
            {isAuthed ? 'Dashboard' : 'Contact Us'}
          </span>
        </Link>
      </div>

      {/* ─── Mobile navbar ───────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col w-full bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] p-3">
        <div className="flex items-center justify-between w-full pl-2 pr-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center text-[#FF6000]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor"/>
                <path d="M12 7L7 12L12 17L17 12L12 7Z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Swaseekh</span>
          </Link>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-full bg-slate-50 text-slate-600"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="flex flex-col items-center gap-4 pt-6 pb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-base font-medium text-slate-600"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href={isAuthed ? "/dashboard" : "/gate"} 
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-2 bg-[#FF6000] text-white rounded-full pl-2 pr-5 py-1.5"
            >
              <div className="bg-white text-[#FF6000] rounded-full p-1.5">
                <ChevronRight size={14} strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold">{isAuthed ? 'Dashboard' : 'Contact Us'}</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
