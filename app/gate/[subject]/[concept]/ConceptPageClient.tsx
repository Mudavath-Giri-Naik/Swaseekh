'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Question, Subject, Subtopic, Topic, Difficulty, QuestionType } from '@/types'
import QuestionList from '@/components/questions/QuestionList'
import FilterBar from '@/components/questions/FilterBar'
import { ArrowLeft, BookOpen, Construction, ChevronLeft, ChevronRight } from 'lucide-react'

interface ConceptPageClientProps {
  subjectSlug: string
  conceptSlug: string
  subject: Subject | null
  subtopic: Subtopic | null
  topic: Topic | null
}

const LIMIT = 20

export default function ConceptPageClient({
  subjectSlug,
  conceptSlug,
  subject,
  subtopic,
  topic,
}: ConceptPageClientProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null)
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null)

  // Derive available years from loaded questions
  const [availableYears, setAvailableYears] = useState<number[]>([])

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('subtopicId', conceptSlug)
      params.set('page', String(page))
      params.set('limit', String(LIMIT))
      if (selectedYear) params.set('year', String(selectedYear))
      if (selectedDifficulty) params.set('difficulty', selectedDifficulty)
      if (selectedType) params.set('type', selectedType)

      const res = await fetch(`/api/questions?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 1)

        // Build year list from first fetch (no filters)
        if (!selectedYear && !selectedDifficulty && !selectedType && page === 1) {
          const years = Array.from(
            new Set<number>((data.questions as Question[]).map((q: Question) => q.examMeta.year))
          ).sort((a, b) => b - a)
          setAvailableYears(years)
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [conceptSlug, page, selectedYear, selectedDifficulty, selectedType])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  // Reset to page 1 on filter change
  const handleYearChange = (y: number | null) => { setPage(1); setSelectedYear(y) }
  const handleDifficultyChange = (d: Difficulty | null) => { setPage(1); setSelectedDifficulty(d) }
  const handleTypeChange = (t: QuestionType | null) => { setPage(1); setSelectedType(t) }

  const hasCCD = subtopic?.ccdStatus === 'completed' && subtopic?.ccdId

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Breadcrumb Header */}
      <div className="border-b border-[#2A2A2A] bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <nav className="flex items-center gap-2 text-sm text-[#808080] mb-3">
            <Link href="/gate" className="hover:text-white transition-colors">Syllabus</Link>
            <span>/</span>
            <Link href={`/gate/${subjectSlug}`} className="hover:text-white transition-colors capitalize">
              {subject?.shortCode ?? subjectSlug}
            </Link>
            <span>/</span>
            <span className="text-[#A0A0A0]">{subtopic?.name ?? conceptSlug}</span>
          </nav>

          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <Link
                href={`/gate/${subjectSlug}`}
                className="inline-flex items-center gap-1.5 text-[#A0A0A0] hover:text-white text-sm mb-2 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {subject?.name}
              </Link>
              <h1 className="text-2xl font-bold text-white">
                {subtopic?.name ?? conceptSlug}
              </h1>
              {topic && (
                <p className="text-sm text-[#808080] mt-1">{topic.name}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xl font-bold text-white">{total || subtopic?.questionCount || 0}</p>
                <p className="text-xs text-[#808080]">Questions</p>
              </div>
              {subtopic?.ccdStatus && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  subtopic.ccdStatus === 'completed'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : subtopic.ccdStatus === 'in-progress'
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    : 'bg-zinc-700/30 text-zinc-500 border-zinc-600/20'
                }`}>
                  {subtopic.ccdStatus === 'completed' ? 'CCD Ready' :
                   subtopic.ccdStatus === 'in-progress' ? 'CCD In Progress' : 'CCD Coming Soon'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-8">
          {/* LEFT — CCD Section */}
          <div>
            <div className="sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
                  Concept Coverage Document
                </h2>
              </div>

              {hasCCD ? (
                <div className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
                  <p className="text-[#A0A0A0] text-sm">
                    CCD content for <strong className="text-white">{subtopic?.name}</strong> is available.
                    Full CCD viewer coming soon.
                  </p>
                  <p className="text-xs text-[#808080] mt-2">CCD ID: {subtopic?.ccdId}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#2A2A2A] border-dashed bg-[#1A1A1A]/50 p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#2A2A2A] flex items-center justify-center mx-auto mb-4">
                    <Construction className="w-6 h-6 text-[#808080]" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    Content Coming Soon
                  </h3>
                  <p className="text-sm text-[#808080] leading-relaxed">
                    The Concept Coverage Document for{' '}
                    <strong className="text-[#A0A0A0]">{subtopic?.name ?? conceptSlug}</strong>{' '}
                    is being prepared. Check back soon!
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-xs text-yellow-500/70">In progress</span>
                  </div>
                </div>
              )}

              {/* Quick nav */}
              {subject && topic && (
                <div className="mt-4 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                  <p className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    More in {topic.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {topic.subtopics
                      .filter(s => s.slug !== conceptSlug)
                      .slice(0, 8)
                      .map((s) => (
                        <Link
                          key={s._id}
                          href={`/gate/${subjectSlug}/${s.slug}`}
                          className="text-xs text-[#A0A0A0] hover:text-white bg-[#2A2A2A] hover:bg-[#3A3A3A] px-2 py-1 rounded transition-colors"
                        >
                          {s.name}
                        </Link>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Questions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#A0A0A0] uppercase tracking-wider">
                Previous Year Questions
              </h2>
              {total > 0 && (
                <span className="text-xs text-[#808080]">
                  {total} question{total !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <FilterBar
              years={availableYears}
              selectedYear={selectedYear}
              selectedDifficulty={selectedDifficulty}
              selectedType={selectedType}
              onYearChange={handleYearChange}
              onDifficultyChange={handleDifficultyChange}
              onTypeChange={handleTypeChange}
              total={total}
            />

            <QuestionList questions={questions} loading={loading} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-sm text-[#A0A0A0] hover:border-[#7C3AED]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-[#808080]">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-sm text-[#A0A0A0] hover:border-[#7C3AED]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
