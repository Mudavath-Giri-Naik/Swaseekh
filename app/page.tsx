import type { Metadata } from 'next'
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
import JsonLd from '@/components/JsonLd'
import { websiteSchema, organizationSchema } from '@/lib/seo'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a good GATE CS score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A good GATE CS score depends on your goal. The qualifying cutoff for the general category typically falls around 25-30 marks (out of 100), but admission to the top IITs/IISc for the MTech programme usually needs a much higher score — often a 700+ GATE score with an AIR within the low hundreds. For PSU recruitment and most NITs, a score in the 500-650 range is generally competitive.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many previous year questions (PYQs) does Swaseekh have?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Swaseekh has 2000+ GATE CS previous year questions (PYQs), each mapped to the exact concept in the syllabus it tests. This concept mapping lets you study by topic and instantly see how frequently and how deeply each concept has been asked across years.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Swaseekh free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Swaseekh is free to start and browse — you can explore the syllabus and concept map without signing up. Full access to all PYQs, solutions and mock tests is available through Swaseekh Pro at ₹999/year.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which years of GATE CS questions are covered?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Swaseekh covers GATE CS previous year questions spanning 1989 to 2025, along with year-wise mock tests so you can practise full papers from individual exam years.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Swaseekh have GATE CS mock tests?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Swaseekh offers year-wise, full-length GATE CS mock tests that simulate the real exam, complete with a countdown timer and detailed step-by-step solutions for every question.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the GATE CS syllabus cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The GATE CS syllabus covers core computer science subjects — Programming & Data Structures, Algorithms, Theory of Computation, Compiler Design, Operating Systems, Databases, Computer Networks, Digital Logic and Computer Organisation & Architecture — plus Engineering Mathematics, Discrete Mathematics and General Aptitude.',
      },
    },
    {
      '@type': 'Question',
      name: 'How should I start GATE CS preparation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A concept-first approach works best: learn each concept thoroughly, then solve PYQs topic by topic to see how that concept is tested, and finally attempt full-length mock tests under timed conditions. Swaseekh maps every PYQ to its concept so you can follow exactly this progression.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes Swaseekh different from other GATE CS prep tools?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Swaseekh focuses on what GATE actually asks. Instead of unfiltered material, every one of its 2000+ PYQs is mapped to a specific concept in the GATE CSE syllabus, so you can see what gets asked, how deep it goes, and what you still have not covered — and then practise it with year-wise mock tests.',
      },
    },
  ],
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#FAFAFB] font-sans">
      <JsonLd data={[websiteSchema(), organizationSchema(), faqSchema]} />
      {/* Dotted pattern — strongest at the top, fades to nothing at the bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-screen [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_95%)]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgb(99 102 241 / 0.22) 1.1px, transparent 1.3px)',
          backgroundSize: '22px 22px',
        }}
      />

      <Navbar />

      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative">
        {/* Content zone — airier mobile spacing, tighter on desktop */}
        <div className="relative px-4 pt-20 md:pt-4 lg:pt-6">
          {/* Tilted card stack — LEFT (xl+) */}
          <div
            className="pointer-events-none absolute top-[68%] hidden animate-hero-fade xl:block"
            style={{
              left: 'max(0.75rem, calc(50% - 42rem))',
              transform: 'translateY(-50%) rotate(-9deg)',
              animationDelay: '700ms',
            }}
          >
            <LeftCardStack />
          </div>

          {/* Tilted card stack — RIGHT (xl+) */}
          <div
            className="pointer-events-none absolute top-[68%] hidden animate-hero-fade xl:block"
            style={{
              right: 'max(0.75rem, calc(50% - 42rem))',
              transform: 'translateY(-50%) rotate(9deg)',
              animationDelay: '850ms',
            }}
          >
            <RightCardStack />
          </div>

          {/* Center column — pill, headline, subhead, trust row, then CTA */}
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
            {/* 1 — Slot indicator pill */}
            <div
              className="inline-flex animate-hero-in items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm md:px-3.5 md:py-1.5 md:text-xs"
              style={{ animationDelay: '0ms' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>GATE 2026 · 2000+ PYQs mapped &amp; ready</span>
            </div>

            {/* 2 — Headline (bigger on mobile, original size on desktop) */}
            <h1
              className="mt-7 animate-hero-in font-display font-bold leading-[1.1] tracking-[-0.02em] text-slate-900 text-[clamp(1.6rem,4.4vw,3.5rem)] md:mt-5"
              style={{ animationDelay: '120ms' }}
            >
              <span className="block whitespace-nowrap">Cut the noise.</span>
              <span className="block whitespace-nowrap">
                Study what <span className="text-indigo-600">GATE</span> asks.
              </span>
              <span className="block whitespace-nowrap">
                Nothing more, nothing less.
              </span>
            </h1>

            {/* 3 — Subheading */}
            <p
              className="mt-6 max-w-xs animate-hero-in text-[15px] leading-relaxed text-slate-600 sm:max-w-xl md:mt-4 md:text-[15px]"
              style={{ animationDelay: '240ms' }}
            >
              2000+ PYQs mapped to every concept in the GATE CSE syllabus. Know
              exactly what gets asked, how deep it goes, and what you still
              haven&apos;t covered.
            </p>

            {/* 4 — Trust row (above CTA on every breakpoint) */}
            <div
              className="mt-7 flex animate-hero-in items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 shadow-sm backdrop-blur md:mt-5 md:px-3 md:py-1.5"
              style={{ animationDelay: '360ms' }}
            >
              <AvatarGroup />
              <span className="pr-1.5 text-[11px] font-medium text-slate-600 sm:text-sm">
                Trusted by 500+ GATE CSE 2027 aspirants
              </span>
            </div>

            {/* 5 — CTA */}
            <div
              className="mt-7 flex animate-hero-in flex-col items-center md:mt-5"
              style={{ animationDelay: '480ms' }}
            >
              <NoiseBackground
                containerClassName="w-fit p-2 rounded-full transition-transform duration-200 hover:scale-[1.02]"
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
                  Explore the syllabus &rarr;
                </Link>
              </NoiseBackground>

              <p className="mt-2 text-[11px] text-slate-400">
                No sign-up needed · Free to start
              </p>
            </div>
          </div>
        </div>

        {/* ─── Bottom showcase: stack on mobile, big card on tablet+ ──────── */}
        {/* Mobile: auto-cycling stack matching the big card's footprint */}
        <div
          className="relative z-10 mt-20 animate-hero-rise px-4 pb-12 md:hidden"
          style={{ animationDelay: '600ms' }}
        >
          <div className="mx-auto w-full max-w-md">
            <MobileCardStack />
          </div>
        </div>

        {/* Tablet+: full product-preview card */}
        <div
          className="relative z-10 mt-12 hidden animate-hero-rise px-4 pb-24 md:block"
          style={{ animationDelay: '650ms' }}
        >
          <ProductPreview />
        </div>
      </section>
    </div>
  )
}
