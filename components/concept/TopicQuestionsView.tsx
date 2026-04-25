'use client'

import { useState, useMemo } from 'react'
import FilterBar from '../FilterBar'
import { useSidebarData } from '@/components/sidebar-context'
import QuestionDrawer from './QuestionDrawer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import MathRenderer from '../MathRenderer'
import { CheckCircle2, XCircle, Bookmark, Circle } from "lucide-react"

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
}

interface Topic {
  _id: string
  name: string
  slug: string
  subtopics: Subtopic[]
  questionCount: number
}

interface TopicQuestionsViewProps {
  questions: Question[]
  topics: Topic[]
  allSubjects?: any[]
  currentSubjectSlug?: string
}

const diffColors: Record<string, { bg: string; text: string; border: string }> = {
  easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  hard: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
}

export default function TopicQuestionsView({ questions, topics, allSubjects, currentSubjectSlug }: TopicQuestionsViewProps) {
  const { selectedTopicId, selectedSubtopicId } = useSidebarData()
  const [solvedStatuses, setSolvedStatuses] = useState<Record<string, boolean>>({})

  const [selectedYear, setSelectedYear] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedType, setSelectedType] = useState('')
  
  // Drawer state
  const [selectedQuestion, setSelectedQuestion] = useState<{ q: Question, topicName: string } | null>(null)
  
  // Sorting state for year
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  const years = useMemo(() => {
    const set = new Set<number>()
    questions.forEach((q) => set.add(q.examMeta.year))
    return Array.from(set).sort((a, b) => b - a)
  }, [questions])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Topic match
      if (selectedTopicId && q.taxonomy.topicId !== selectedTopicId) return false
      // Subtopic match
      if (selectedSubtopicId && q.taxonomy.subtopicId !== selectedSubtopicId) return false

      if (selectedYear && q.examMeta.year !== Number(selectedYear)) return false
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false
      if (selectedType && q.questionType !== selectedType) return false
      return true
    }).sort((a, b) => sortOrder === 'desc' ? b.examMeta.year - a.examMeta.year : a.examMeta.year - b.examMeta.year)
  }, [questions, selectedTopicId, selectedSubtopicId, selectedYear, selectedDifficulty, selectedType, sortOrder])

  // Helper to get topic name
  const getTopicName = (topicId: string) => {
    const t = topics.find(t => t._id === topicId)
    return t ? t.name : 'Unknown Topic'
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="pt-2">
        <FilterBar
          years={years}
          selectedYear={selectedYear}
          selectedDifficulty={selectedDifficulty}
          selectedType={selectedType}
          allSubjects={allSubjects}
          currentSubjectSlug={currentSubjectSlug}
          onYearChange={setSelectedYear}
          onDifficultyChange={setSelectedDifficulty}
          onTypeChange={setSelectedType}
        />
      </div>

      {/* Table container */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="min-w-[300px] max-w-[400px]">Question</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-gray-900 select-none whitespace-nowrap group"
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              >
                Year <span className="text-gray-400 group-hover:text-gray-700">{sortOrder === 'desc' ? '↓' : '↑'}</span>
              </TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="max-w-[150px]">Topic</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  No questions found for this selection.
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((q, idx) => {
                const topicName = getTopicName(q.taxonomy.topicId)
                const dColor = diffColors[q.difficulty] || diffColors.medium
                
                return (
                  <TableRow 
                    key={q._id} 
                    className="cursor-pointer hover:bg-gray-50 group"
                    onClick={() => setSelectedQuestion({ q, topicName })}
                  >
                    <TableCell className="text-center text-gray-500 font-medium">
                      {idx + 1}
                    </TableCell>
                    
                    <TableCell>
                      <div className="line-clamp-1 max-w-[400px] text-gray-800 text-[14px]">
                        <MathRenderer text={q.questionLatex} />
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-gray-600 font-medium whitespace-nowrap">
                      GATE {q.examMeta.year}
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

                    <TableCell>
                      <div className="text-xs text-gray-500 truncate max-w-[120px]" title={topicName}>
                        {topicName}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDrawer 
        question={selectedQuestion?.q || null} 
        topicName={selectedQuestion?.topicName || ''}
        isOpen={!!selectedQuestion} 
        onClose={() => setSelectedQuestion(null)} 
      />
    </div>
  )
}
