'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

/**
 * Legend strip for the GATE syllabus page.
 * Shows a centered row of three colour-coded dots + labels, with a
 * "Know more" button that opens a popup explaining how to read the syllabus.
 */
export default function SyllabusLegend() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  /* Auto-open the dialog the first time this user lands on /gate in the
     current browser-tab session. sessionStorage is cleared when the tab
     closes, so the next browser session / new login shows it again. The
     flag is keyed by user identity so logging in as a different user also
     re-triggers the popup. */
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Wait until next-auth has resolved the session so we key by real user
    if (status === 'loading') return

    const identity =
      (session?.user as { id?: string } | undefined)?.id ??
      session?.user?.email ??
      'guest'
    const key = `swaseekh-gate-legend-seen-${identity}`

    if (sessionStorage.getItem(key) !== '1') {
      setOpen(true)
      sessionStorage.setItem(key, '1')
    }
  }, [session, status])

  return (
    <div className="-mx-2 mb-3 mt-1 flex w-auto items-center justify-center gap-1 sm:mx-0 sm:gap-2">
      <LegendBadge className="border-transparent bg-emerald-50 text-emerald-700">
        Guaranteed
      </LegendBadge>
      <LegendBadge className="border-transparent bg-amber-50 text-[#b58900]">
        Likely
      </LegendBadge>
      <LegendBadge className="border-transparent bg-red-50 text-red-700">
        Practice
      </LegendBadge>
      <LegendBadge className="border-transparent bg-slate-100 text-slate-900">
        Subjects
      </LegendBadge>
      <LegendBadge className="border-transparent bg-slate-50 text-slate-500">
        Topics
      </LegendBadge>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="How to read this syllabus"
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100 sm:h-6 sm:w-6"
          >
            <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
          </button>
        </DialogTrigger>
        <DialogContent className="gap-0 p-0 sm:max-w-xl">
          {/* Sticky header */}
          <DialogHeader className="px-5 pt-6 pb-3 sm:px-6 sm:pt-7">
            <DialogTitle className="text-xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-2xl">
              How to read this syllabus
            </DialogTitle>
            <DialogDescription className="text-[13px] text-slate-500 sm:text-sm">
              13 subjects · 40 topics · 82 concepts — the complete GATE CS
              syllabus, fully mapped.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="max-h-[60vh] overflow-y-auto border-y border-slate-100 px-5 py-5 [-ms-overflow-style:none] [scrollbar-width:none] sm:max-h-[55vh] sm:px-6 sm:py-6 [&::-webkit-scrollbar]:hidden">
            <SyllabusExplainerBody />
          </div>

          {/* Sticky footer */}
          <DialogFooter className="px-5 py-4 sm:px-6">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─── Small primitives ──────────────────────────────────────────────── */

/* Pill badge — colored bg + matching text, used for each legend chip. */
function LegendBadge({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <Badge
      className={`shrink-0 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:px-2.5 sm:text-xs ${className ?? ''}`}
    >
      {children}
    </Badge>
  )
}

/* ─── Dialog body — scrollable middle content (header/footer are sticky) ── */

function SyllabusExplainerBody() {
  return (
    <article className="text-[15px] text-slate-700">
      <p className="leading-7">
        Everything in GATE is built from a small set of fundamentals.
        We&apos;ve gone through every concept and marked how it behaves — so
        you know exactly how to study each one.
      </p>

      {/* H2 — The structure */}
      <h2 className="mt-7 scroll-m-20 border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight text-slate-900">
        The structure
      </h2>
      <ul className="my-5 ml-6 list-disc leading-7 [&>li]:mt-2">
        <li>
          <span className="font-semibold text-slate-900">
            Subjects (dark bold)
          </span>{' '}
          — the 13 big areas of GATE.
        </li>
        <li>
          <span className="font-semibold text-slate-700">
            Topics (lighter)
          </span>{' '}
          — the chapters inside each subject.
        </li>
        <li>
          <span className="font-semibold text-slate-900">
            Concepts (colored)
          </span>{' '}
          — the actual ideas you learn and get tested on.
        </li>
      </ul>
      <p className="leading-7">The colors tell you what kind of concept it is:</p>

      {/* H3 — Green */}
      <h3 className="mt-6 scroll-m-20 text-lg font-semibold tracking-tight">
        <span className="text-emerald-700">🟢 Green — Guaranteed</span>{' '}
        <span className="text-sm font-medium text-slate-500">
          · 47 concepts
        </span>
      </h3>
      <p className="mt-2 leading-7">
        These are closed: every possible question is built from a fixed set of
        fundamentals. Learn each one fully and you can solve anything GATE
        asks here — nothing can surprise you.{' '}
        <span className="font-semibold text-slate-900">
          Master these first; they&apos;re guaranteed marks.
        </span>
      </p>

      {/* H3 — Yellow */}
      <h3 className="mt-6 scroll-m-20 text-lg font-semibold tracking-tight">
        <span className="text-[#b58900]">🟡 Yellow — Likely</span>{' '}
        <span className="text-sm font-medium text-slate-500">
          · 27 concepts
        </span>
      </h3>
      <p className="mt-2 leading-7">
        Mostly fixed, but examiners can ask them in new ways. Learn the
        fundamentals well, then notice how they combine. Know the rules,
        glance at the variations, and you&apos;ll handle almost everything.
      </p>

      {/* H3 — Red */}
      <h3 className="mt-6 scroll-m-20 text-lg font-semibold tracking-tight">
        <span className="text-red-700">🔴 Red — Practice-heavy</span>{' '}
        <span className="text-sm font-medium text-slate-500">· 8 concepts</span>
      </h3>
      <p className="mt-2 leading-7">
        These are open: GATE invents fresh problems you can&apos;t just
        memorize. We give you every fundamental plus plenty of solved
        examples. Master the tools, then practice — that&apos;s exactly how
        these are cracked.
      </p>

      {/* H2 — What this means for you */}
      <h2 className="mt-8 scroll-m-20 border-b border-slate-200 pb-2 text-xl font-semibold tracking-tight text-slate-900">
        What this means for you
      </h2>
      <p className="mt-4 leading-7">
        <span className="font-semibold text-slate-900">
          90% of concepts (74 of 82) are Green or Yellow
        </span>{' '}
        — learn the fundamentals and the questions fall into place. Only 8
        concepts are truly open, and even those are crackable once you&apos;ve
        mastered the tools and practiced.
      </p>
      <p className="mt-4 leading-7">
        So your path is clear: lock in the{' '}
        <span className="font-semibold text-emerald-700">47 Green</span>{' '}
        concepts for guaranteed marks, get comfortable with the{' '}
        <span className="font-semibold text-[#b58900]">27 Yellow</span>, and
        put your hardest practice into the{' '}
        <span className="font-semibold text-red-700">8 Red</span>. Cover the
        fundamentals everywhere, and there&apos;s nowhere left for GATE to
        surprise you.
      </p>
    </article>
  )
}
