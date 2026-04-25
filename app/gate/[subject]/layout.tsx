'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import MinimalHeader from '@/components/concept/MinimalHeader'

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
  const pathSegments = pathname.split('/').filter(Boolean)
  const conceptSlug = pathSegments.length > 2 ? pathSegments[pathSegments.length - 1] : null
  const isConceptPage = pathSegments.length > 2 // /gate/subject/concept = 3 segments
  
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

  if (isConceptPage) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex flex-col">
        <div className="flex-1 w-full min-w-0">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Header bar */}
      <MinimalHeader
        subjectName={subject.name}
        subjectSlug={subject.slug}
        questionCount={subject.questionCount}
        subtopicCount={subject.topics.length}
        secondaryLabel="Topics"
      />

      {/* Main Body (Sidebar + Content) */}
      <div className="flex-1 w-full mx-auto px-6 sm:px-10 py-6 max-w-[1100px]">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Main Content */}

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

        </div>
      </div>
    </div>
  )
}
