'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Subtopic {
  _id: string
  name: string
  slug: string
  questionCount: number
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
}

interface Topic {
  _id: string
  name: string
  slug: string
  shortCode: string
  questionCount: number
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
  subtopics: Subtopic[]
}

interface Subject {
  _id: string
  name: string
  slug: string
  shortCode: string
  questionCount: number
  topics: Topic[]
}



export default function SubjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ subject: string }>()
  const pathname = usePathname()
  
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/subjects/${params.subject}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data?.subject) setSubject(data.subject)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.subject])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !subject) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Coming Soon</h1>
        <p className="text-gray-500 mb-6 text-center">
          This subject is not available yet. Check back soon!
        </p>
        <Link
          href="/gate"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A235A] text-white rounded-lg text-sm font-medium hover:bg-[#5c2d72] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Syllabus
        </Link>
      </div>
    )
  }

  // Determine active topic based on pathname
  // Pathname is usually /gate/[subject]/[concept]
  // Concept could be a topic slug or a subtopic slug.
  const conceptSlug = pathname.split('/').pop()
  
  let activeTopicSlug = subject.topics[0]?.slug
  for (const topic of subject.topics) {
    if (topic.slug === conceptSlug) {
      activeTopicSlug = topic.slug
      break
    }
    if (topic.subtopics.some(sub => sub.slug === conceptSlug)) {
      activeTopicSlug = topic.slug
      break
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-100 shrink-0">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-10 py-5">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-4">
            <Link href="/gate" className="hover:text-gray-700 transition-colors">
              GATE
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-medium">{subject.name}</span>
          </nav>

          {/* Subject title row */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-[11px] font-semibold tracking-wider text-[#4A235A] bg-[#4A235A]/8 border border-[#4A235A]/15 px-2 py-0.5 rounded uppercase">
                  {subject.shortCode || 'SUB'}
                </span>
              </div>
              <h1 className="text-[22px] sm:text-[26px] font-bold text-gray-900 tracking-tight">
                {subject.name}
              </h1>
            </div>

            <div className="flex items-center gap-5 pb-0.5">
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 leading-none">{subject.questionCount}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Questions</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 leading-none">{subject.topics.length}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Topics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body (Sidebar + Content) */}
      <div className="flex-1 max-w-[1100px] w-full mx-auto px-6 sm:px-10 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left Sidebar: Topics */}
          <div className="md:w-[280px] shrink-0">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
              Topics
            </h3>
            <div className="flex flex-col gap-1">
              {subject.topics.map((topic) => {
                const isActive = topic.slug === activeTopicSlug
                return (
                  <Link
                    key={topic._id}
                    href={`/gate/${subject.slug}/${topic.slug}`}
                    className={`group flex items-center gap-2.5 w-full text-left px-3.5 py-3 rounded-lg transition-all duration-150
                      ${isActive
                        ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                        : 'bg-transparent border border-transparent text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm hover:border-gray-100'
                      }`}
                  >

                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                        {topic.name}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {topic.questionCount} Qs · {topic.subtopics.length} subtopics
                      </p>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

        </div>
      </div>
    </div>
  )
}
