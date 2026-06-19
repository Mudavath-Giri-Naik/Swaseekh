'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'
import SyllabusLegend from '@/components/SyllabusLegend'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface SubjectFromDB {
  _id: string
  name: string
  code: string
  order: number
  section: string
  totalTopics: number
  totalConcepts: number
}

interface ConceptFromDB {
  _id: string
  title: string
  /** Optional confidence indicator: drives the concept title's text colour. */
  guaranteeLevel?: 'green' | 'yellow' | 'red' | string
}

interface TopicFromDB {
  _id: string
  subjectId: string
  name: string
  order: number
  concepts?: ConceptFromDB[]
}

/* Map a guaranteeLevel to a Tailwind text-colour class.
   - green  → emerald (readable on white)
   - yellow → dark amber #b58900 (NEVER bright yellow on white)
   - red    → red-700
   - missing/unknown → default slate gray */
function guaranteeTextClass(level?: string): string {
  switch (level) {
    case 'green':
      return 'text-emerald-700'
    case 'yellow':
      return 'text-[#b58900]'
    case 'red':
      return 'text-red-700'
    default:
      return 'text-foreground/80'
  }
}

interface SyllabusSection {
  section: string
  subjects: {
    subject: SubjectFromDB
    topics: TopicFromDB[]
  }[]
}

let _cachedSyllabus: SyllabusSection[] | null = null

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function GateSyllabusPage() {
  const [sections, setSections] = useState<SyllabusSection[]>(_cachedSyllabus ?? [])
  const [loading, setLoading] = useState(!_cachedSyllabus)

  useEffect(() => {
    if (_cachedSyllabus) return;

    async function fetchData() {
      try {
        // Fetch all subjects
        const subRes = await fetch('/api/subjects')
        const subData = await subRes.json()
        const subjects: SubjectFromDB[] = subData.subjects || []

        // Fetch topics for all subjects in parallel
        const topicPromises = subjects.map((s) =>
          fetch(`/api/subjects/${s._id}`)
            .then((res) => res.json())
            .then((data) => ({
              subject: s,
              topics: (data.topics || []).map((t: any) => ({
                _id: t._id,
                subjectId: t.subjectId,
                name: t.name,
                order: t.order,
                concepts: (t.concepts || []).map((c: any) => ({
                  _id: c._id,
                  title: c.title,
                  guaranteeLevel: c.guaranteeLevel,
                })),
              })) as TopicFromDB[],
            }))
            .catch(() => ({ subject: s, topics: [] as TopicFromDB[] }))
        )

        const subjectWithTopics = await Promise.all(topicPromises)

        // Group by section, maintaining subject order
        const sectionMap = new Map<string, SyllabusSection>()
        const sectionOrder: string[] = []

        for (const item of subjectWithTopics) {
          const sec = item.subject.section
          if (!sectionMap.has(sec)) {
            sectionMap.set(sec, { section: sec, subjects: [] })
            sectionOrder.push(sec)
          }
          sectionMap.get(sec)!.subjects.push(item)
        }

        const finalSections = sectionOrder.map((s) => sectionMap.get(s)!)
        _cachedSyllabus = finalSections
        setSections(finalSections)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-background">

      {/* Document container */}
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-6 font-serif">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-foreground underline">
            GATE 2026
          </span>
          <span className="text-sm text-foreground font-semibold">
            IIT Guwahati | Organizing Institute
          </span>
        </div>

        {/* Purple header bar */}
        <div
          className="flex items-center gap-0 mb-4 rounded-sm overflow-hidden"
          style={{ backgroundColor: '#4A235A' }}
        >
          <div className="px-4 py-3 border-r border-white/20">
            <span className="text-white font-bold text-lg tracking-wide">CS</span>
          </div>
          <div className="px-4 py-3">
            <span className="text-white font-bold text-base sm:text-lg">
              Computer Science and Information Technology
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-border border-t-[#4A235A] rounded-full animate-spin" />
          </div>
        )}

        {/* Legend + Know more dialog (shown once syllabus is loaded) */}
        {!loading && sections.length > 0 && <SyllabusLegend />}

        {/* Syllabus sections */}
        {!loading &&
          sections.map((section, sectionIdx) => (
            <div key={section.section} className="mb-6">
              {/* Section heading */}
              <h2
                className="text-base font-bold mb-2"
                style={{ color: '#8B0000' }}
              >
                Section {sectionIdx + 1}: {section.section}
              </h2>

              {/* Subject entries */}
              {section.subjects.map(({ subject, topics }, subjectIdx) => (
                <p
                  key={subject._id}
                  className="text-[15px] leading-[1.8] text-foreground mb-3"
                >
                  {/* Serial Number */}
                  <span className="font-semibold" style={{ color: '#C0392B' }}>
                    {Number(subject._id.replace(/\D/g, ''))}.{" "}
                  </span>
                  
                  {/* Subject name link — always black */}
                  <Link
                    href={`/dashboard/subject/${subject._id}`}
                    className="font-semibold text-foreground hover:underline"
                    style={{ textDecorationColor: '#4A235A' }}
                  >
                    {subject.name}
                  </Link>

                  {/* Colon separator */}
                  <span className="text-foreground">: </span>

                  {/* Topic names — each links to anchor in the document */}
                  {topics.map((topic, idx) => (
                    <span key={topic._id}>
                      <Link
                        href={`/gate/${slugify(subject.name)}/${slugify(topic.name)}`}
                        className="text-foreground hover:text-[#4A235A] hover:underline transition-colors cursor-pointer"
                        style={{ textDecorationColor: '#4A235A' }}
                      >
                        {topic.name}
                      </Link>
                      
                      {/* Concepts */}
                      {topic.concepts && topic.concepts.length > 0 && (
                        <span className="text-foreground">
                          : {topic.concepts.map((concept, cIdx) => (
                            <span key={concept._id}>
                              <Link
                                href={`/gate/${slugify(subject.name)}/${slugify(topic.name)}/${slugify(concept.title)}`}
                                className={`${guaranteeTextClass(concept.guaranteeLevel)} hover:underline cursor-pointer`}
                                style={{ textDecorationColor: 'currentColor' }}
                              >
                                {concept.title}
                              </Link>
                              {cIdx < topic.concepts!.length - 1 && (
                                <span className="text-foreground">, </span>
                              )}
                            </span>
                          ))}
                        </span>
                      )}

                      {idx < topics.length - 1 ? (
                        <span className="text-foreground">. </span>
                      ) : (
                        <span className="text-foreground">.</span>
                      )}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}
