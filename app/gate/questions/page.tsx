'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSidebarData } from '@/components/sidebar-context'
import MathRenderer from '@/components/MathRenderer'
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, Circle, Search, Filter, ChevronDown } from "lucide-react"

interface Question {
  _id: string
  questionText: string
  questionType: string
  options: string[]
  correctAnswer: string
  explanation: string
  marks: number
  difficulty: string
  year: number
  subjectId: string
  topicId: string
  conceptId: string
  angle: string
  cognitiveOperation: string
  depthLevel: string
  distractorStrategy: string | null
  keyConstraint: string | null
  statementStructure: string
  trap: string
  // Resolved names
  subjectName: string
  topicName: string
  conceptName: string
}

// Helpers
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const diffColors: Record<string, { bg: string; text: string; border: string }> = {
  easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  Easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  hard: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  Hard: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
}

export default function QuestionsListPage() {
  const sidebarData = useSidebarData()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [solvedStatuses, setSolvedStatuses] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  // Set sidebar state
  useEffect(() => {
    sidebarData.setIsQuestionsMode(true)
    sidebarData.setConceptName('Questions')
    return () => {
      sidebarData.clearSubjectData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch all questions
  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams()
    qs.set('limit', '5000')

    fetch(`/api/questions?${qs.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Derived filter options
  const subjects = useMemo(() => {
    const map = new Map<string, string>()
    questions.forEach((q) => map.set(q.subjectId, q.subjectName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [questions])

  const topics = useMemo(() => {
    const map = new Map<string, string>()
    questions
      .filter((q) => !selectedSubject || q.subjectId === selectedSubject)
      .forEach((q) => map.set(q.topicId, q.topicName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [questions, selectedSubject])

  const years = useMemo(() => {
    const set = new Set<number>()
    questions.forEach((q) => set.add(q.year))
    return Array.from(set).sort((a, b) => b - a)
  }, [questions])

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        if (selectedSubject && q.subjectId !== selectedSubject) return false
        if (selectedTopic && q.topicId !== selectedTopic) return false
        if (selectedYear && q.year !== Number(selectedYear)) return false
        if (selectedDifficulty && q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false
        if (selectedType && q.questionType !== selectedType) return false
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (
            !q.questionText.toLowerCase().includes(query) &&
            !q.subjectName.toLowerCase().includes(query) &&
            !q.topicName.toLowerCase().includes(query) &&
            !q.conceptName.toLowerCase().includes(query)
          ) return false
        }
        return true
      })
      .sort((a, b) => sortOrder === 'desc' ? b.year - a.year : a.year - b.year)
  }, [questions, selectedSubject, selectedTopic, selectedYear, selectedDifficulty, selectedType, searchQuery, sortOrder])

  const selectClass =
    'px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white ' +
    'focus:outline-none focus:border-[#4A235A] focus:ring-1 focus:ring-[#4A235A]/20 transition-colors appearance-none'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ background: '#F8F7FF', minHeight: 'calc(100vh - 48px)' }}>
      <div className="max-w-[1100px] mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Questions Bank</h1>
          <p className="text-sm text-gray-500">
            {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-3 mb-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white
                         focus:outline-none focus:border-[#4A235A] focus:ring-1 focus:ring-[#4A235A]/20 transition-colors"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-3">
            {/* Subject */}
            <select
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setSelectedTopic('') }}
              className={selectClass}
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Topic */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className={selectClass}
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {/* Year */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={selectClass}
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>GATE {y}</option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className={selectClass}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={selectClass}
            >
              <option value="">All Types</option>
              <option value="MCQ">MCQ</option>
              <option value="MSQ">MSQ</option>
              <option value="NAT">NAT</option>
            </select>
          </div>
        </div>

        {/* Questions Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="min-w-[280px] max-w-[400px]">Question</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-gray-900 select-none whitespace-nowrap group"
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                >
                  Year <span className="text-gray-400 group-hover:text-gray-700">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                </TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                    No questions found for this selection.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const dColor = diffColors[q.difficulty] || diffColors.medium
                  const questionUrl = `/gate/questions/${slugify(q.subjectName)}/${slugify(q.topicName)}/${slugify(q.conceptName)}/${q._id}`

                  return (
                    <TableRow
                      key={q._id}
                      className="cursor-pointer hover:bg-gray-50 group"
                    >
                      <TableCell className="text-center text-gray-500 font-medium">
                        {idx + 1}
                      </TableCell>

                      <TableCell>
                        <Link href={questionUrl} className="block">
                          <div className="line-clamp-1 max-w-[400px] text-gray-800 text-[14px] group-hover:text-[#4A235A] transition-colors">
                            <MathRenderer text={q.questionText} />
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="text-gray-600 font-medium whitespace-nowrap">
                        GATE {q.year}
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 whitespace-nowrap">
                          {q.marks} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {q.questionType}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={`${dColor.bg} ${dColor.text} ${dColor.border} text-[10px] uppercase font-bold border shadow-none`}>
                          {q.difficulty}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-gray-600 truncate max-w-[120px]" title={q.subjectName}>
                          {q.subjectName}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]" title={q.topicName}>
                          {q.topicName}
                        </div>
                      </TableCell>

                      <TableCell
                        className="whitespace-nowrap cursor-pointer hover:bg-gray-100/50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSolvedStatuses(prev => ({ ...prev, [q._id]: !prev[q._id] }));
                        }}
                      >
                        <div className="flex items-center h-full">
                          {solvedStatuses[q._id] ? (
                            <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium leading-none">
                              <CheckCircle2 className="w-[14px] h-[14px]" /> Solved
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-gray-400 text-xs font-medium leading-none">
                              <Circle className="w-[14px] h-[14px]" /> Unsolved
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
