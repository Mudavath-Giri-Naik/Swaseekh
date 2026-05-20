'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ArrowUpRight, LogOut, Menu, User, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'PYQs', href: '/gate/questions' },
  { label: 'Subjects', href: '/gate' },
  { label: 'Resources', href: '/gate' },
  { label: 'Mock Tests', href: '/gate' },
  { label: 'Pricing', href: '/pricing' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session, status } = useSession()
  const isAuthed = status === 'authenticated'

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ─── Desktop navbar (md+) ─────────────────────────────────────── */}
      <div className="mx-auto hidden h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:flex lg:px-8">
        {/* Left: Logo — wordmark + hand-drawn arrow */}
        <Link
          href="/"
          aria-label="Swaseekh home"
          className="relative flex shrink-0 items-center"
        >
          <span className="font-display text-xl font-extrabold tracking-[-0.04em] text-blue-500 sm:text-[1.5rem]">
            Swaseekh
          </span>

          <svg
            aria-hidden
            viewBox="0 0 90 110"
            fill="none"
            className="pointer-events-none absolute left-full top-1 ml-0.5 hidden h-12 w-12 overflow-visible md:block"
          >
            <circle cx="8" cy="8" r="3.2" fill="#ef4444" />
            <path
              d="M 11 10 C 38 4, 60 32, 60 92"
              stroke="#22c55e"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M 52 80 L 60 94 L 70 82"
              stroke="#0f172a"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {/* Center pill nav */}
        <nav className="absolute left-1/2 -translate-x-1/2">
          <ul className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-2 py-1.5 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] backdrop-blur">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:px-4"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: CTA / account */}
        <div className="flex items-center">
          {status === 'loading' ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          ) : isAuthed ? (
            <UserMenu
              name={session?.user?.name ?? ''}
              email={session?.user?.email ?? ''}
              image={session?.user?.image ?? null}
            />
          ) : (
            <Link
              href="/gate"
              className="group inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.4)] transition-transform hover:scale-[1.02]"
            >
              Get Started
              <ArrowUpRight
                size={16}
                strokeWidth={2.5}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>
      </div>

      {/* ─── Mobile navbar — single floating pill ─────────────────────── */}
      <div className="px-3 pt-3 md:hidden">
        <div className="flex items-center justify-between rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)]">
          <Link
            href="/"
            aria-label="Swaseekh home"
            className="font-display text-xl font-extrabold tracking-[-0.04em] text-blue-500"
          >
            Swaseekh
          </Link>

          <div className="flex items-center gap-2.5">
            {isAuthed && (
              <Avatar
                src={session?.user?.image ?? null}
                name={session?.user?.name ?? ''}
                size={30}
              />
            )}
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center text-slate-700"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="mx-3 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg md:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3">
              {isAuthed ? (
                <>
                  <div className="flex items-center gap-3 px-1 py-2">
                    <Avatar
                      src={session?.user?.image ?? null}
                      name={session?.user?.name ?? ''}
                      size={36}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {session?.user?.name}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {session?.user?.email}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-700"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/gate"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Get Started
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

/* ─── Avatar ─────────────────────────────────────────────────────────── */

function Avatar({
  src,
  name,
  size = 36,
}: {
  src: string | null
  name: string
  size?: number
}) {
  const initial = (name?.trim()?.[0] ?? 'U').toUpperCase()
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white ring-2 ring-white"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || 'User'}
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  )
}

/* ─── Desktop user menu ──────────────────────────────────────────────── */

function UserMenu({
  name,
  email,
  image,
}: {
  name: string
  email: string
  image: string | null
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-slate-900 py-1.5 pl-1.5 pr-4 transition-transform hover:scale-[1.02]"
      >
        <Avatar src={image} name={name} size={28} />
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-white lg:inline">
          {name?.split(' ')[0] || 'Account'}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Avatar src={image} name={name} size={40} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {name}
              </div>
              <div className="truncate text-xs text-slate-500">{email}</div>
            </div>
          </div>
          <div className="p-1.5">
            <Link
              href="/gate"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <User size={14} className="text-slate-500" /> My GATE workspace
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={14} className="text-slate-500" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
