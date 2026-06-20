'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { slugify } from '@/lib/utils'
import ConceptContent from '@/components/concept/ConceptContent'
import ConceptInline from '@/components/concept/ConceptInline'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ConceptData {
  _id: string
  subjectId: string
  topicId: string
  title: string
  order: number
  tags?: string[]
  blocks?: { type: string; content: unknown }[]
  /** Optional confidence indicator: "green" | "yellow" | "red". Drives the
   *  concept title's text colour via the `guarantee-*` class. */
  guaranteeLevel?: 'green' | 'yellow' | 'red' | string
}

interface TopicData {
  _id: string
  subjectId: string
  name: string
  order: number
  concepts?: ConceptData[]
}

interface SubjectData {
  _id: string
  name: string
  code: string
  order: number
  section: string
  totalTopics: number
  totalConcepts: number
}

interface APIResponse {
  subject: SubjectData
  topics?: TopicData[]
}

/* Map an optional guaranteeLevel value to a CSS class name. Falls back to
   no extra class when the value is missing or unrecognised — the default
   slate text colour applies. */
function guaranteeClass(level?: string): string {
  switch (level) {
    case 'green':
      return 'guarantee-green'
    case 'yellow':
      return 'guarantee-yellow'
    case 'red':
      return 'guarantee-red'
    default:
      return ''
  }
}

/* ─── Document Page Component ────────────────────────────────────────────── */

export default function SubjectDocumentPage() {
  const params = useParams<{ slug: string[] }>()
  const subjectSlug = params.slug?.[0] // e.g. "discrete-mathematics"
  const topicSlug = params.slug?.[1]
  const conceptSlug = params.slug?.[2]

  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)

  const topicRefs = useRef<Record<string, HTMLElement | null>>({})
  const observerRef = useRef<IntersectionObserver | null>(null)

  /* ── Fetch Data ─────────────────────────────────────────────────────── */

  useEffect(() => {
    setLoading(true)
    setError(false)

    fetch(`/api/subjects/${encodeURIComponent(subjectSlug)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((json: APIResponse) => {
        // Normalise: always ensure topics is an array so downstream code
        // can safely call .length / .map without optional checks.
        const safe: APIResponse = { ...json, topics: json.topics ?? [] }
        setData(safe)
        if ((safe.topics?.length ?? 0) > 0) {
          setActiveTopicId(slugify(safe.topics![0].name))
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [subjectSlug])

  /* ── IntersectionObserver for Active Topic ──────────────────────────── */

  useEffect(() => {
    if (!data) return

    // Disconnect any previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible topic heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveTopicId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    )

    observerRef.current = observer

    // Observe all topic headings
    for (const topic of data.topics ?? []) {
      const el = topicRefs.current[slugify(topic.name)]
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [data])

  /* ── Scroll to topic ────────────────────────────────────────────────── */

  const scrollToTopic = useCallback((topicName: string) => {
    const el = topicRefs.current[topicName]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  /* ── Handle slug on initial load ────────────────────────────────────── */

  useEffect(() => {
    if (!data) return
    const targetSlug = conceptSlug || topicSlug
    if (targetSlug) {
      // Small delay so DOM is ready
      setTimeout(() => {
        const el = document.getElementById(targetSlug)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [data, topicSlug, conceptSlug])

  /* ── Loading State ──────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid #e0e0dc',
            borderTopColor: '#111',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  /* ── Error / Not Found ──────────────────────────────────────────────── */

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.5rem', color: '#333' }}>
          Subject not found
        </h2>
        <p style={{ color: '#888', fontSize: 15 }}>
          This subject is not available yet. Check back soon!
        </p>
        <Link
          href="/gate"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: '#111',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Back to Syllabus
        </Link>
      </div>
    )
  }

  // Defensive: API may return undefined or null for these fields. Always
  // operate on a normalised, never-undefined array so .map/.length are safe.
  const { subject } = data
  const topics: TopicData[] = data.topics ?? []

  /* ── Concept-detail mode ────────────────────────────────────────────── */
  // When the URL has a concept slug (3rd segment), render the rich
  // long-form ConceptContent view instead of the syllabus reader.
  if (conceptSlug) {
    // Find the matching concept inside the loaded subject so we can
    // resolve the slug -> conceptId and pass a friendly fallback title.
    let matched: { _id: string; title: string } | null = null
    outer: for (const topic of topics) {
      for (const c of topic.concepts ?? []) {
        if (slugify(c.title) === conceptSlug) {
          matched = { _id: c._id, title: c.title }
          break outer
        }
      }
    }

    return (
      <ConceptContent
        conceptId={matched?._id ?? conceptSlug}
        fallbackTitle={matched?.title}
        backHref={`/gate/${subjectSlug}`}
        backLabel={`Back to ${subject.name}`}
      />
    )
  }

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className="bg-background" style={{ minHeight: 'calc(100vh - 48px)' }}>

      {/* ── Mobile Topic Dropdown ─────────────────────────────────────── */}
      <div className="doc-mobile-dropdown" style={{ display: 'none' }}>
        <select
          value={activeTopicId || ''}
          onChange={(e) => scrollToTopic(e.target.value)}
        >
          {topics.map((t) => (
            <option key={t._id} value={slugify(t.name)}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Top Chips Bar (Desktop) ───────────────────────────────────── */}
      <div
        className="doc-chips-bar sticky top-12 z-20 border-b border-border/60 bg-background/80 backdrop-blur dark:border-transparent"
      >
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span className="mr-1.5 whitespace-nowrap text-[13px] font-semibold text-foreground">
            {subject.name}
          </span>
          <span className="text-muted-foreground/60">·</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {topics.map((topic) => {
              const isActive = activeTopicId === slugify(topic.name)
              return (
                <button
                  key={topic._id}
                  type="button"
                  onClick={() => scrollToTopic(slugify(topic.name))}
                  className={
                    isActive
                      ? 'whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-[12.5px] font-medium text-background transition-colors'
                      : 'whitespace-nowrap rounded-full border bg-card px-3 py-1 text-[12.5px] font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-foreground dark:border-transparent dark:bg-white/[0.04] dark:hover:bg-white/[0.07]'
                  }
                >
                  {topic.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        <main className="doc-reader" style={{ margin: '0 auto', maxWidth: 760 }}>

          {/* Subject Header */}
          <h1>{subject.name}</h1>
          <div className="doc-section-label">{subject.section}</div>
          <hr className="doc-divider" />

          {/* Topics & Concepts */}
          {topics.map((topic, topicIdx) => {
            // Normalise the concept list once so we don't repeat optional chaining
            const concepts = topic.concepts ?? []
            return (
              <section key={topic._id}>
                {/* Topic separator (not before first) */}
                {topicIdx > 0 && <hr className="doc-topic-rule" />}

                {/* Topic Heading */}
                <h2
                  id={slugify(topic.name)}
                  className="doc-topic-heading"
                  ref={(el) => { topicRefs.current[slugify(topic.name)] = el }}
                >
                  {topic.name}
                </h2>

                {/* Concepts */}
                {concepts.length === 0 ? (
                  <p className="doc-coming-soon">Coming soon...</p>
                ) : (
                  concepts.map((concept) => {
                    const gClass = guaranteeClass(concept.guaranteeLevel)
                    return (
                      <div key={concept._id} style={{ marginBottom: 24 }}>
                        <h3
                          id={slugify(concept.title)}
                          className={`doc-concept-title${gClass ? ` ${gClass}` : ''}`}
                        >
                          {concept.title}
                        </h3>

                        {/* Lazily fetch this concept's long-form content.
                            Renders the notebook-style formula sheet inline
                            if present, otherwise shows "Coming soon..." */}
                        <ConceptInline conceptId={concept._id} />
                      </div>
                    )
                  })
                )}
              </section>
            )
          })}

          {/* Bottom spacer for scroll */}
          <div style={{ height: 200 }} />
        </main>
      </div>

      {/* ── Responsive: show mobile dropdown, hide chips on mobile ──── */}
      <style>{`
        @media (max-width: 768px) {
          .doc-chips-bar { display: none !important; }
          .doc-mobile-dropdown { display: block !important; }
        }
        @media (min-width: 769px) {
          .doc-mobile-dropdown { display: none !important; }
        }
      `}</style>
    </div>
  )
}
