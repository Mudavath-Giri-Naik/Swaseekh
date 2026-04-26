'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ConceptData {
  _id: string
  subjectId: string
  topicId: string
  title: string
  order: number
  tags: string[]
  blocks: { type: string; content: unknown }[]
}

interface TopicData {
  _id: string
  subjectId: string
  name: string
  order: number
  concepts: ConceptData[]
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
  topics: TopicData[]
}

/* ─── Document Page Component ────────────────────────────────────────────── */

export default function SubjectDocumentPage() {
  const params = useParams<{ subject: string }>()
  const subjectId = params.subject // e.g. "sub_001"

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

    fetch(`/api/subjects/${subjectId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((json: APIResponse) => {
        setData(json)
        if (json.topics.length > 0) {
          setActiveTopicId(json.topics[0]._id)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [subjectId])

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
    for (const topic of data.topics) {
      const el = topicRefs.current[topic._id]
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [data])

  /* ── Scroll to topic ────────────────────────────────────────────────── */

  const scrollToTopic = useCallback((topicId: string) => {
    const el = topicRefs.current[topicId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  /* ── Handle hash on initial load ────────────────────────────────────── */

  useEffect(() => {
    if (!data) return
    const hash = window.location.hash.slice(1) // remove '#'
    if (hash) {
      // Small delay so DOM is ready
      setTimeout(() => {
        const el = document.getElementById(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [data])

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

  const { subject, topics } = data

  /* ── Render ─────────────────────────────────────────────────────────── */

  return (
    <div style={{ background: '#fafaf8', minHeight: 'calc(100vh - 48px)' }}>

      {/* ── Mobile Topic Dropdown ─────────────────────────────────────── */}
      <div className="doc-mobile-dropdown" style={{ display: 'none' }}>
        <select
          value={activeTopicId || ''}
          onChange={(e) => scrollToTopic(e.target.value)}
        >
          {topics.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Desktop Layout: Sidebar + Content ─────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 40,
          maxWidth: 1080,
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {/* ─── Left Sidebar (Desktop only) ─────────────────────────── */}
        <aside className="doc-sidebar" style={{ flexShrink: 0 }}>
          <div className="doc-sidebar-title">{subject.name}</div>
          <nav>
            {topics.map((topic) => (
              <a
                key={topic._id}
                className={`doc-sidebar-link${activeTopicId === topic._id ? ' active' : ''}`}
                onClick={() => scrollToTopic(topic._id)}
              >
                {topic.name}
              </a>
            ))}
          </nav>
        </aside>

        {/* ─── Main Content ────────────────────────────────────────── */}
        <main className="doc-reader" style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>

          {/* Subject Header */}
          <h1>{subject.name}</h1>
          <div className="doc-section-label">{subject.section}</div>
          <hr className="doc-divider" />

          {/* Topics & Concepts */}
          {topics.map((topic, topicIdx) => (
            <section key={topic._id}>
              {/* Topic separator (not before first) */}
              {topicIdx > 0 && <hr className="doc-topic-rule" />}

              {/* Topic Heading */}
              <h2
                id={topic._id}
                className="doc-topic-heading"
                ref={(el) => { topicRefs.current[topic._id] = el }}
              >
                {topic.name}
              </h2>

              {/* Concepts */}
              {topic.concepts.length === 0 ? (
                <p className="doc-coming-soon">Coming soon...</p>
              ) : (
                topic.concepts.map((concept) => (
                  <div key={concept._id} style={{ marginBottom: 24 }}>
                    <h3 id={concept._id} className="doc-concept-title">{concept.title}</h3>

                    {concept.blocks.length === 0 ? (
                      <p className="doc-coming-soon">Coming soon...</p>
                    ) : (
                      <p className="doc-content-loaded">Content loaded.</p>
                    )}
                  </div>
                ))
              )}
            </section>
          ))}

          {/* Bottom spacer for scroll */}
          <div style={{ height: 200 }} />
        </main>
      </div>

      {/* ── Responsive: show mobile dropdown, hide desktop sidebar ──── */}
      <style>{`
        @media (max-width: 768px) {
          .doc-sidebar { display: none !important; }
          .doc-mobile-dropdown { display: block !important; }
        }
        @media (min-width: 769px) {
          .doc-mobile-dropdown { display: none !important; }
        }
      `}</style>
    </div>
  )
}
