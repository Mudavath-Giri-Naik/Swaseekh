'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import TopicQuestionsView from '@/components/concept/TopicQuestionsView'
import { useSidebarData } from '@/components/sidebar-context'

interface Subtopic {
  _id: string
  name: string
  slug: string
  questionCount: number
}

interface Topic {
  _id: string
  name: string
  slug: string
  subtopics: Subtopic[]
  questionCount: number
}

interface SubjectData {
  _id: string
  name: string
  slug: string
  topics: Topic[]
}

export default function QuestionsPage() {
  const params = useParams<{ subject: string }>()
  const sidebarData = useSidebarData()

  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectData, setSubjectData] = useState<SubjectData | null>(null)
  const [allSubjects, setAllSubjects] = useState<any[]>([])

  // Fetch current subject
  useEffect(() => {
    fetch(`/api/subjects/${params.subject}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.subject) {
          setSubjectData(data.subject)
        }
      })
      .catch(() => {})
  }, [params.subject])

  // Fetch all subjects for dropdown
  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => {
        if (data.subjects) setAllSubjects(data.subjects)
      })
      .catch(() => {})
  }, [])

  // When subject data loads, push it into sidebar context
  useEffect(() => {
    if (subjectData) {
      sidebarData.setSubjectData(
        subjectData.topics, 
        subjectData.name, 
        subjectData.slug, 
        subjectData.questionCount || 0
      )
      sidebarData.setIsQuestionsMode(true)
      sidebarData.setConceptName(subjectData.name)
      
      // Set initial active topic if not set
      if (subjectData.topics.length > 0 && !sidebarData.selectedTopicId) {
        sidebarData.setSelectedTopicId(subjectData.topics[0]._id)
      }
    }
    
    return () => {
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
    qs.set('limit', '1000')

    fetch(`/api/questions?${qs.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.subject])

  if (loading || !subjectData) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ background: '#F8F7FF', minHeight: 'calc(100vh - 48px)' }}>
      <div className="max-w-[1000px] mx-auto py-6 px-4">
        <TopicQuestionsView questions={questions} topics={subjectData.topics} allSubjects={allSubjects} currentSubjectSlug={params.subject} />
      </div>
    </div>
  )
}
