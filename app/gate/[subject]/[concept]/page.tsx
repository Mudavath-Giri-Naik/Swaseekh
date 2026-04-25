'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useSidebarData } from '@/components/sidebar-context'
import ThreeColumnLayout from '@/components/concept/ThreeColumnLayout'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Question {
  _id: string
  questionLatex: string
  questionType: 'MCQ' | 'MSQ' | 'NAT'
  optionsLatex: string[]
  correctAnswer: number | number[] | string
  explanationLatex: string
  marks: 1 | 2
  difficulty: 'easy' | 'medium' | 'hard'
  taxonomy: {
    subjectId: string
    topicId: string
    subtopicId: string
  }
  examMeta: {
    exam: string
    stream: string
    year: number
    shift: string | null
    questionNumber: number
  }
}

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
  subtopics: Subtopic[]
  questionCount: number
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
}

interface SubjectData {
  _id: string
  name: string
  slug: string
  topics: Topic[]
}

export default function ConceptPage() {
  const params = useParams<{ subject: string; concept: string }>()
  const sidebarData = useSidebarData()

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectData, setSubjectData] = useState<SubjectData | null>(null)

  // Fetch subject
  useEffect(() => {
    fetch(`/api/subjects/${params.subject}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.subject) setSubjectData(data.subject) })
      .catch(() => {})
  }, [params.subject])

  // When subject data loads, push it into sidebar context
  useEffect(() => {
    if (subjectData) {
      sidebarData.setSubjectData(subjectData.topics, subjectData.name, subjectData.slug)
    }
    return () => {
      // Clean up when leaving CCD page
      sidebarData.clearSubjectData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectData])

  // Fetch all questions for the subject
  useEffect(() => {
    setLoading(true)
    setQuestions([])

    const qs = new URLSearchParams()
    qs.set('subjectId', params.subject)
    qs.set('limit', '1000') // fetch all questions for the subject

    fetch(`/api/questions?${qs.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.subject])

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (loading || !subjectData) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ background: '#F9FAFB', minHeight: 'calc(100vh - 48px)' }}>
      <div style={{ padding: '24px 16px' }}>
        <ThreeColumnLayout
          questions={questions}
          topics={subjectData.topics}
          subjectSlug={params.subject}
          conceptSlug={params.concept}
        />
      </div>
    </div>
  )
}
