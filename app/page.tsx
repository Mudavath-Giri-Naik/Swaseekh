import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AvatarGroup from '@/components/AvatarGroup'
import { NoiseBackground } from '@/components/ui/noise-background'
import {
  LeftCardStack,
  RightCardStack,
  MobileCardStack,
} from '@/components/HeroCardStack'
import ProductPreview from '@/components/ProductPreview'

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#FAFAFB] font-sans">
      {/* Dotted pattern — only the initial viewport, doesn't follow the scroll */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-screen [mask-image:radial-gradient(ellipse_55%_55%_at_50%_38%,transparent_0%,transparent_22%,black_72%,black_100%)]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgb(99 102 241 / 0.22) 1.1px, transparent 1.3px)',
          backgroundSize: '22px 22px',
        }}
      />

      <Navbar />

      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative">
        {/* Content zone — bigger gap on mobile, tighter on desktop */}
        <div className="relative px-4 pt-16 md:pt-8 lg:pt-10">
          {/* Tilted card stack — LEFT (xl+) */}
          <div
            className="pointer-events-none absolute top-[55%] hidden xl:block"
            style={{
              left: 'max(0.75rem, calc(50% - 42rem))',
              transform: 'translateY(-50%) rotate(-9deg)',
            }}
          >
            <LeftCardStack />
          </div>

          {/* Tilted card stack — RIGHT (xl+) */}
          <div
            className="pointer-events-none absolute top-[55%] hidden xl:block"
            style={{
              right: 'max(0.75rem, calc(50% - 42rem))',
              transform: 'translateY(-50%) rotate(9deg)',
            }}
          >
            <RightCardStack />
          </div>

          {/* Center column — uses CSS order so mobile shows CTA above the trust row */}
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
            {/* 1 — Slot indicator pill */}
            <div className="order-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm md:px-3.5 md:py-1.5 md:text-xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>GATE 2026 syllabus mapped &amp; ready</span>
            </div>

            {/* 2 — Headline (longer wording wraps to ~3 lines on mobile, like CodeDale) */}
            <h1 className="order-2 mt-4 font-display font-bold leading-[1.1] tracking-[-0.02em] text-slate-900 text-[clamp(1.7rem,4.6vw,3.25rem)] md:mt-5">
              Your AI Co-Pilot, <br className="hidden sm:inline" />
              built to crack <span className="text-indigo-600">GATE</span> CSE
              smarter
            </h1>

            {/* 3 — Subheading */}
            <p className="order-3 mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:mt-4 md:text-[15px]">
              Every PYQ, organised. Mapped to concepts, theory, and solutions —
              all in one place. Crack GATE smarter, not harder.
            </p>

            {/* 4 — CTA (mobile shows CTA before trust; desktop swaps via md:order) */}
            <div className="order-4 mt-5 flex w-full flex-col items-center px-4 sm:w-auto sm:px-0 md:order-5 md:mt-5">
              <NoiseBackground
                containerClassName="w-full sm:w-fit p-2 rounded-full transition-transform duration-200 hover:scale-[1.02]"
                gradientColors={[
                  'rgb(255, 100, 150)',
                  'rgb(100, 150, 255)',
                  'rgb(255, 200, 100)',
                ]}
              >
                <Link
                  href="/gate"
                  className="block h-full w-full cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white px-7 py-3 text-center text-sm font-semibold text-black shadow-[0px_2px_0px_0px_rgba(250,250,250,1)_inset,0px_0.5px_1px_0px_rgba(163,163,163,1)] transition-all duration-100 active:scale-[0.98] md:px-8 md:py-3.5 md:text-base"
                >
                  Start Preparing now &rarr;
                </Link>
              </NoiseBackground>

              <p className="mt-2 text-[11px] text-slate-400">
                No sign-up required to browse PYQs
              </p>
            </div>

            {/* 5 — Trust row (mobile after CTA; desktop appears between subhead and CTA) */}
            <div className="order-5 mt-5 flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 shadow-sm backdrop-blur md:order-4 md:mt-5 md:px-3 md:py-1.5">
              <AvatarGroup />
              <span className="pr-1.5 text-[11px] font-medium text-slate-600 sm:text-sm">
                Trusted by 20+ GATE aspirants
              </span>
            </div>
          </div>
        </div>

        {/* ─── Bottom showcase: stack on mobile, big card on tablet+ ──────── */}
        {/* Mobile: auto-cycling stack matching the big card's footprint */}
        <div className="relative z-10 mt-10 px-4 pb-10 md:hidden">
          <div className="mx-auto w-full max-w-md">
            <MobileCardStack />
          </div>
        </div>

        {/* Tablet+: full product-preview card */}
        <div className="relative z-10 mt-12 hidden px-4 pb-24 md:block">
          <ProductPreview />
        </div>
      </section>
    </div>
  )
}
