'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronsRight } from 'lucide-react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const NAV_LINKS = [
  { label: 'Home', href: '/', active: true },
  { label: 'Features', href: '#' },
  { label: 'About us', href: '#' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '#' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className={`absolute top-[24px] left-0 right-0 z-50 flex justify-center px-4 ${inter.className}`}>
      {/* ─── Desktop & Tablet navbar ─────────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-between bg-white rounded-[50px] border border-[#EBE5DE] px-[24px] py-[18px] w-full max-w-[820px] mx-auto">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center text-[#F26419]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor"/>
              <path d="M12 7L7 12L12 17L17 12L12 7Z" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-[18px] tracking-tight text-[#1A1A2E]">Swaseekh</span>
        </Link>

        {/* Center: Links */}
        <nav>
          <ul className="flex items-center gap-[28px]">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`text-[14px] transition-colors ${link.active ? 'text-[#F26419] font-semibold' : 'text-[#555] font-medium hover:text-[#1A1A2E]'}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: CTA */}
        <Link 
          href="/dashboard"
          className="group flex items-center gap-3 bg-[#F26419] hover:bg-[#d95815] text-white rounded-[50px] pl-1.5 pr-5 py-1.5 transition-all"
        >
          <div className="bg-white text-[#F26419] rounded-full p-1 flex items-center justify-center">
            <ChevronsRight size={16} strokeWidth={3} />
          </div>
          <span className="text-[14px] font-medium">Contact Us</span>
        </Link>
      </div>

      {/* ─── Mobile navbar ───────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col w-full bg-white rounded-3xl border border-[#EBE5DE] p-4">
        <div className="flex items-center justify-between w-full pl-2 pr-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center text-[#F26419]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="currentColor"/>
                <path d="M12 7L7 12L12 17L17 12L12 7Z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-[18px] tracking-tight text-[#1A1A2E]">Swaseekh</span>
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
                className={`text-base font-medium ${link.active ? 'text-[#F26419]' : 'text-slate-600'}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-3 bg-[#F26419] text-white rounded-full pl-1.5 pr-5 py-1.5"
            >
              <div className="bg-white text-[#F26419] rounded-full p-1.5 flex items-center justify-center">
                <ChevronsRight size={16} strokeWidth={3} />
              </div>
              <span className="text-base font-medium">Contact Us</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
