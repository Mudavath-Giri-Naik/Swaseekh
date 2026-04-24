'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import FilterBar from '@/components/FilterBar'
import QuestionCard from '@/components/QuestionCard'

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
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectData, setSubjectData] = useState<SubjectData | null>(null)

  // Filters
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedType, setSelectedType] = useState('')

  // Determine real names and active topic from DB
  const resolvedInfo = useMemo(() => {
    if (!subjectData) return null

    // Check if concept matches a topic slug
    const matchedTopic = subjectData.topics.find((t) => t.slug === params.concept)
    if (matchedTopic) {
      return {
        isTopic: true,
        topic: matchedTopic,
        activeSubtopicSlug: null
      }
    }

    // Check if concept matches a subtopic slug
    for (const topic of subjectData.topics) {
      const matchedSub = topic.subtopics.find((s) => s.slug === params.concept)
      if (matchedSub) {
        return {
          isTopic: false,
          topic: topic,
          activeSubtopicSlug: matchedSub.slug,
          subtopic: matchedSub
        }
      }
    }

    return null
  }, [subjectData, params.concept])

  // Fetch subject data
  useEffect(() => {
    fetch(`/api/subjects/${params.subject}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.subject) setSubjectData(data.subject)
      })
      .catch(() => { })
  }, [params.subject])

  // Fetch questions
  useEffect(() => {
    setLoading(true)
    setQuestions([])

    // First try subtopicId
    const qs1 = new URLSearchParams()
    qs1.set('subtopicId', params.concept)
    qs1.set('limit', '200')

    fetch(`/api/questions?${qs1.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const results = data.questions ?? []
        if (results.length > 0) {
          setQuestions(results)
          setLoading(false)
          return
        }

        // If no subtopic results, try topicId
        const qs2 = new URLSearchParams()
        qs2.set('topicId', params.concept)
        qs2.set('limit', '200')

        return fetch(`/api/questions?${qs2.toString()}`)
          .then((res) => res.json())
          .then((data2) => {
            setQuestions(data2.questions ?? [])
            setLoading(false)
          })
      })
      .catch(() => setLoading(false))
  }, [params.concept])

  // Unique years
  const years = useMemo(() => {
    const set = new Set<number>()
    questions.forEach((q) => set.add(q.examMeta.year))
    return Array.from(set).sort((a, b) => b - a)
  }, [questions])

  // Client-side filter
  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (selectedYear && q.examMeta.year !== Number(selectedYear)) return false
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false
      if (selectedType && q.questionType !== selectedType) return false
      return true
    })
  }, [questions, selectedYear, selectedDifficulty, selectedType])

  const handleYearChange = useCallback((v: string) => setSelectedYear(v), [])
  const handleDifficultyChange = useCallback((v: string) => setSelectedDifficulty(v), [])
  const handleTypeChange = useCallback((v: string) => setSelectedType(v), [])

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (loading || !subjectData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    )
  }

  if (!resolvedInfo) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 text-center py-20 px-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Concept not found</h2>
        <p className="text-gray-400 mb-6">Could not find topic or subtopic "{params.concept}"</p>
      </div>
    )
  }

  const { topic, activeSubtopicSlug } = resolvedInfo

  return (
    <div className="space-y-5">
      {/* Topic Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                {topic.shortCode || 'TOPIC'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {topic.name}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-400 shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{topic.questionCount} Total Qs</span>
          </div>
        </div>

        {/* Subtopic Filters (Chips) */}
        {topic.subtopics.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
              Filter by Subtopic
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/gate/${params.subject}/${topic.slug}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-all duration-150
                  ${!activeSubtopicSlug
                    ? 'border-[#4A235A] bg-[#4A235A] text-white font-medium'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#4A235A]/30 hover:text-[#4A235A]'
                  }`}
              >
                All Questions
              </Link>

              {topic.subtopics.map((sub) => (
                <Link
                  key={sub._id}
                  href={`/gate/${params.subject}/${sub.slug}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-all duration-150
                    ${activeSubtopicSlug === sub.slug
                      ? 'border-[#4A235A] bg-[#4A235A] text-white font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#4A235A]/30 hover:text-[#4A235A]'
                    }`}
                >
                  <span>{sub.name}</span>
                  {sub.questionCount > 0 && (
                    <span className={`text-[11px] ml-0.5 ${activeSubtopicSlug === sub.slug ? 'text-white/80' : 'text-gray-400'}`}>
                      {sub.questionCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Questions Section */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-20 px-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No questions available yet
          </h2>
          <p className="text-gray-400">
            Check back later for updates.
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <FilterBar
              years={years}
              selectedYear={selectedYear}
              selectedDifficulty={selectedDifficulty}
              selectedType={selectedType}
              onYearChange={handleYearChange}
              onDifficultyChange={handleDifficultyChange}
              onTypeChange={handleTypeChange}
            />

            <div className="text-[13px] text-gray-500 font-medium shrink-0">
              {filtered.length} {filtered.length === 1 ? 'Question' : 'Questions'}
            </div>
          </div>

          {/* Question list */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
              <p className="text-gray-400">No questions match your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((q, i) => (
                <QuestionCard key={q._id} question={q} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
