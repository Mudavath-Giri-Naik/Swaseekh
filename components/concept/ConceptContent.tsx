'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, BookOpen } from 'lucide-react'
import MathRenderer from '@/components/MathRenderer'
import ConceptFormulaSheet from '@/components/concept/ConceptFormulaSheet'

/* ─── Types — match the user's MongoDB document shape ─────────────────── */

interface HighLevelView {
  whatItIs?: string
  whyItMatters?: string
  keyMentalMove?: string
}

interface Fundamental {
  id?: string
  title?: string
  order?: number
  intuition?: string
  formalStatement?: string
  formula?: string
  example?: string
  gateTrap?: string
  reference?: string
}

interface Keyword {
  term?: string
  type?: 'compound' | 'singular' | string
  decode?: string
  bridge?: string
  predictsMeaning?: boolean
}

export interface ConceptContentDoc {
  conceptId?: string
  conceptTitle?: string
  reference?: string
  highLevelView?: HighLevelView
  fundamentals?: Fundamental[]
  keywords?: Keyword[]
  compositionNote?: string
  quickRecall?: string[]
  coverageStatement?: string
}

interface Props {
  /** Either the conceptId (e.g. "con_010") or a slug — passed to the API. */
  conceptId: string
  /** Fallback title shown while loading or if content has none. */
  fallbackTitle?: string
  /** Where the back link should point (default: /gate). */
  backHref?: string
  backLabel?: string
}

/* ─── Renderer ────────────────────────────────────────────────────────── */

export default function ConceptContent({
  conceptId,
  fallbackTitle,
  backHref = '/gate',
  backLabel = 'Back to syllabus',
}: Props) {
  const [content, setContent] = useState<ConceptContentDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!conceptId) return
    let cancelled = false

    setLoading(true)
    setError(null)

    fetch(`/api/content/${encodeURIComponent(conceptId)}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('not-found')
          throw new Error('fetch-failed')
        }
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setContent(data?.content ?? null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message === 'not-found' ? 'not-found' : 'error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [conceptId])

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    )
  }

  /* ── Error / Not found ───────────────────────────────────────────── */
  if (error || !content) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          {error === 'not-found'
            ? `${fallbackTitle ?? 'This concept'} is being written.`
            : 'Could not load this concept'}
        </h2>
        <p className="max-w-md text-sm text-slate-500">
          {error === 'not-found'
            ? 'Long-form content for this concept hasn’t been published yet. Check back soon!'
            : 'Something went wrong fetching the content. Please refresh and try again.'}
        </p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    )
  }

  /* ── If the doc uses the new formula-sheet shape, delegate to the
        notebook-style renderer instead of the long-form view ─────── */
  const hasFormulaSheetShape =
    Array.isArray((content as unknown as { groups?: unknown[] }).groups) ||
    !!(content as unknown as { decisionGuide?: unknown }).decisionGuide

  if (hasFormulaSheetShape) {
    return (
      <ConceptFormulaSheet
        content={content as unknown as Parameters<typeof ConceptFormulaSheet>[0]['content']}
        backHref={backHref}
        backLabel={backLabel}
      />
    )
  }

  const fundamentals = (content.fundamentals ?? []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  )

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <article className="cc-reader mx-auto max-w-[720px] px-4 py-8 sm:px-6 sm:py-12">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="mt-6 border-b border-slate-200 pb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl">
          {content.conceptTitle || fallbackTitle || 'Untitled concept'}
        </h1>
        {content.reference && (
          <p className="mt-3 text-sm italic text-slate-500">
            <BookOpen className="mr-1.5 inline-block h-3.5 w-3.5 -translate-y-px" />
            {content.reference}
          </p>
        )}
      </header>

      {/* ── High-Level View ───────────────────────────────────────── */}
      {content.highLevelView && (
        <Section title="High-level view">
          <div className="space-y-5">
            <HLBlock
              label="What it is"
              text={content.highLevelView.whatItIs}
            />
            <HLBlock
              label="Why it matters"
              text={content.highLevelView.whyItMatters}
            />
            <HLBlock
              label="The key mental move"
              text={content.highLevelView.keyMentalMove}
            />
          </div>
        </Section>
      )}

      {/* ── Fundamentals ──────────────────────────────────────────── */}
      {fundamentals.length > 0 && (
        <Section title="Fundamentals">
          <div className="space-y-10">
            {fundamentals.map((f, idx) => (
              <FundamentalCard
                key={f.id ?? idx}
                index={f.order ?? idx + 1}
                fundamental={f}
              />
            ))}
          </div>
        </Section>
      )}

      {/* ── Keywords ──────────────────────────────────────────────── */}
      {content.keywords && content.keywords.length > 0 && (
        <Section title="Key terms">
          <p className="-mt-2 mb-5 text-sm text-slate-500">
            Glossary of the words you&apos;ll see in problem statements.
          </p>
          <dl className="grid gap-4 sm:grid-cols-2">
            {content.keywords.map((kw, i) => (
              <KeywordCard key={(kw.term ?? '') + i} keyword={kw} />
            ))}
          </dl>
        </Section>
      )}

      {/* ── Composition Note ─────────────────────────────────────── */}
      {content.compositionNote && (
        <Section title="Composition note">
          <Callout tone="indigo">
            <MathRenderer text={content.compositionNote} />
          </Callout>
        </Section>
      )}

      {/* ── Quick Recall ─────────────────────────────────────────── */}
      {content.quickRecall && content.quickRecall.length > 0 && (
        <Section title="Quick recall">
          <ul className="cc-recall space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            {content.quickRecall.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[15px] leading-7 text-slate-800"
              >
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span className="min-w-0 flex-1 overflow-x-auto">
                  <MathRenderer text={line} />
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Coverage statement (muted footer) ────────────────────── */}
      {content.coverageStatement && (
        <p className="mt-12 border-t border-slate-100 pt-6 text-[13px] italic leading-6 text-slate-400">
          {content.coverageStatement}
        </p>
      )}
    </article>
  )
}

/* ─── Section wrapper — title + body ──────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10 scroll-m-20">
      <h2 className="mb-5 font-display text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  )
}

/* ─── High-level view block ───────────────────────────────────────────── */

function HLBlock({ label, text }: { label: string; text?: string }) {
  if (!text) return null
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <p className="text-[16px] leading-[1.7] text-slate-800">
        <MathRenderer text={text} />
      </p>
    </div>
  )
}

/* ─── Fundamental card ────────────────────────────────────────────────── */

function FundamentalCard({
  index,
  fundamental,
}: {
  index: number
  fundamental: Fundamental
}) {
  const {
    title,
    intuition,
    formalStatement,
    formula,
    example,
    gateTrap,
    reference,
  } = fundamental

  return (
    <div className="cc-fundamental rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      {/* Numbered title */}
      <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
        <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-600">
          {index}
        </span>
        {title || 'Fundamental'}
      </h3>

      <div className="mt-5 space-y-5">
        {intuition && (
          <Field label="Intuition">
            <MathRenderer text={intuition} />
          </Field>
        )}

        {formalStatement && (
          <Field label="Formal statement">
            <MathRenderer text={formalStatement} />
          </Field>
        )}

        {formula && (
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Formula
            </div>
            {/* Block of math: contained, scrollable horizontally on overflow */}
            <div className="cc-formula overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
              <MathRenderer text={asDisplayMath(formula)} />
            </div>
          </div>
        )}

        {example && (
          <Field label="Example">
            <MathRenderer text={example} />
          </Field>
        )}

        {gateTrap && (
          <Callout tone="amber" iconLabel="GATE Trap">
            <MathRenderer text={gateTrap} />
          </Callout>
        )}
      </div>

      {reference && (
        <p className="mt-6 border-t border-slate-100 pt-3 text-[12px] italic text-slate-400">
          <BookOpen className="mr-1 inline-block h-3 w-3 -translate-y-px" />
          {reference}
        </p>
      )}
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="text-[15.5px] leading-[1.7] text-slate-800">
        {children}
      </div>
    </div>
  )
}

/* ─── Keyword card ────────────────────────────────────────────────────── */

function KeywordCard({ keyword }: { keyword: Keyword }) {
  const { term, type, decode, bridge, predictsMeaning } = keyword
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
      <div className="flex items-center gap-2">
        <dt className="font-display text-[15px] font-semibold text-slate-900">
          {term}
        </dt>
        {type && (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {type}
          </span>
        )}
        {predictsMeaning && (
          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            predicts
          </span>
        )}
      </div>
      <dd className="mt-2 space-y-1.5 text-[13.5px] leading-[1.65] text-slate-600">
        {decode && (
          <p>
            <span className="font-semibold text-slate-700">Decode:</span>{' '}
            <MathRenderer text={decode} />
          </p>
        )}
        {bridge && (
          <p>
            <span className="font-semibold text-slate-700">Bridge:</span>{' '}
            <MathRenderer text={bridge} />
          </p>
        )}
      </dd>
    </div>
  )
}

/* ─── Callout (used for GATE traps + composition notes) ──────────────── */

function Callout({
  children,
  tone = 'amber',
  iconLabel,
}: {
  children: React.ReactNode
  tone?: 'amber' | 'indigo'
  iconLabel?: string
}) {
  const palette =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50/70 text-amber-900'
      : 'border-indigo-200 bg-indigo-50/60 text-indigo-900'
  const labelColor = tone === 'amber' ? 'text-amber-700' : 'text-indigo-700'
  return (
    <div className={`rounded-xl border px-4 py-3.5 ${palette}`}>
      {iconLabel && (
        <div className={`mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${labelColor}`}>
          <AlertTriangle className="h-3.5 w-3.5" />
          {iconLabel}
        </div>
      )}
      <div className="text-[15px] leading-[1.7]">{children}</div>
    </div>
  )
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

/** Wrap a raw LaTeX string in $$...$$ so MathRenderer renders it as block
 *  math — but only if the author didn't already include $ delimiters. */
function asDisplayMath(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('$') || trimmed.startsWith('\\begin{')) return raw
  return `$$${trimmed}$$`
}
