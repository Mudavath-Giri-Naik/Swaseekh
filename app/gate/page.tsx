'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

interface TopicFromDB {
  _id: string
  subjectId: string
  name: string
  order: number
  concepts?: { _id: string; title: string }[]
}

interface SyllabusSection {
  section: string
  subjects: {
    subject: SubjectFromDB
    topics: TopicFromDB[]
  }[]
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function GateSyllabusPage() {
  const [sections, setSections] = useState<SyllabusSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
                concepts: (t.concepts || []).map((c: any) => ({ _id: c._id, title: c.title }))
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

        setSections(sectionOrder.map((s) => sectionMap.get(s)!))
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* Document container */}
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-6 font-serif">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold text-black underline">
            GATE 2026
          </span>
          <span className="text-sm text-black font-semibold">
            IIT Guwahati | Organizing Institute
          </span>
        </div>

        {/* Purple header bar */}
        <div
          className="flex items-center gap-0 mb-8 rounded-sm overflow-hidden"
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
            <div className="w-6 h-6 border-2 border-gray-300 border-t-[#4A235A] rounded-full animate-spin" />
          </div>
        )}

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
                  className="text-[15px] leading-[1.8] text-black mb-3"
                >
                  {/* Serial Number */}
                  <span className="font-semibold" style={{ color: '#C0392B' }}>
                    {Number(subject._id.replace(/\D/g, ''))}.{" "}
                  </span>
                  
                  {/* Subject name link */}
                  <Link
                    href={`/gate/${subject._id}`}
                    className="font-semibold hover:underline"
                    style={{ color: '#C0392B' }}
                  >
                    {subject.name}
                  </Link>

                  {/* Colon separator */}
                  <span className="text-black">: </span>

                  {/* Topic names — each links to anchor in the document */}
                  {topics.map((topic, idx) => (
                    <span key={topic._id}>
                      <Link
                        href={`/gate/${subject._id}#${topic._id}`}
                        className="text-black hover:text-[#4A235A] hover:underline transition-colors cursor-pointer"
                        style={{ textDecorationColor: '#4A235A' }}
                      >
                        {topic.name}
                      </Link>
                      
                      {/* Concepts */}
                      {topic.concepts && topic.concepts.length > 0 && (
                        <span className="text-black">
                          : {topic.concepts.map((concept, cIdx) => (
                            <span key={concept._id}>
                              <Link
                                href={`/gate/${subject._id}#${concept._id}`}
                                className="text-gray-700 hover:text-[#4A235A] hover:underline transition-colors cursor-pointer"
                                style={{ textDecorationColor: '#4A235A' }}
                              >
                                {concept.title}
                              </Link>
                              {cIdx < topic.concepts!.length - 1 && (
                                <span className="text-black">, </span>
                              )}
                            </span>
                          ))}
                        </span>
                      )}

                      {idx < topics.length - 1 ? (
                        <span className="text-black">. </span>
                      ) : (
                        <span className="text-black">.</span>
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
