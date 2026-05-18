'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MathRenderer from '@/components/MathRenderer'
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Lightbulb, AlertTriangle, Target, Brain, Layers } from "lucide-react"

interface QuestionDetail {
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
  subjectName: string
  topicName: string
  conceptName: string
}

const diffColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: '#DCFCE7', text: '#15803D' },
  Easy: { bg: '#DCFCE7', text: '#15803D' },
  medium: { bg: '#FEF9C3', text: '#854D0E' },
  Medium: { bg: '#FEF9C3', text: '#854D0E' },
  hard: { bg: '#FEE2E2', text: '#991B1B' },
  Hard: { bg: '#FEE2E2', text: '#991B1B' },
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

export default function QuestionDetailPage() {
  const params = useParams<{
    subject: string
    topic: string
    concept: string
    questionId: string
  }>()

  const [question, setQuestion] = useState<QuestionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)

  useEffect(() => {
    if (!params.questionId) return

    fetch(`/api/questions/${params.questionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.question) {
          setQuestion(data.question)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.questionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <p className="text-gray-500 text-lg">Question not found</p>
        <Link
          href="/gate/questions"
          className="text-[#4A235A] hover:underline text-sm font-medium"
        >
          ← Back to Questions
        </Link>
      </div>
    )
  }

  const d = diffColors[question.difficulty] || diffColors.medium

  // Check which option is the correct answer
  const correctAnswerLetter = question.correctAnswer?.trim()?.toUpperCase()
  const correctIndex = optionLabels.indexOf(correctAnswerLetter)

  return (
    <div style={{ background: '#F8F7FF', minHeight: 'calc(100vh - 48px)' }}>
      <div className="max-w-[900px] mx-auto py-6 px-4">
        {/* Back link */}
        <Link
          href="/gate/questions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#4A235A] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </Link>

        {/* Main Question Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Badges header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                GATE {question.year}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                {question.marks} Mark{question.marks > 1 ? 's' : ''}
              </span>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: d.bg, color: d.text }}
              >
                {question.difficulty}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-300 text-gray-500">
                {question.questionType}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-700">
                {question.subjectName}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700">
                {question.topicName}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-700">
                {question.conceptName}
              </span>
            </div>
          </div>

          {/* Question text */}
          <div className="px-6 py-6">
            <div className="text-[15px] leading-relaxed text-gray-900 mb-8">
              <MathRenderer text={question.questionText} />
            </div>

            {/* Options */}
            {question.questionType !== 'NAT' && question.options && question.options.length > 0 && (
              <div className="flex flex-col gap-2.5 mb-8">
                {question.options.map((opt, i) => {
                  const isCorrect = showAnswer && i === correctIndex
                  const isWrongSelected = showAnswer && selectedOption === i && i !== correctIndex
                  const isSelected = selectedOption === i && !showAnswer

                  let bgClass = 'bg-gray-50 border border-transparent hover:border-gray-200'
                  if (isCorrect) bgClass = 'bg-green-50 border border-green-200'
                  else if (isWrongSelected) bgClass = 'bg-red-50 border border-red-200'
                  else if (isSelected) bgClass = 'bg-blue-50 border border-blue-200'

                  return (
                    <button
                      key={i}
                      onClick={() => !showAnswer && setSelectedOption(i)}
                      className={`flex gap-3 px-4 py-3 rounded-lg text-[14px] leading-relaxed transition-all text-left ${bgClass} ${!showAnswer ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className={`font-semibold shrink-0 ${isCorrect ? 'text-green-700' : isWrongSelected ? 'text-red-700' : isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {optionLabels[i]}.
                      </span>
                      <span className={isCorrect ? 'text-green-900' : isWrongSelected ? 'text-red-900' : isSelected ? 'text-blue-900' : 'text-gray-800'}>
                        <MathRenderer text={opt} />
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Show/Hide Answer button */}
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>

            {/* Answer + Explanation */}
            {showAnswer && (
              <div className="mt-6 space-y-4">
                {/* Correct Answer */}
                <div className="text-[14px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                  Correct Answer: {question.correctAnswer}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Explanation
                    </p>
                    <div className="text-[14px] leading-relaxed text-gray-700">
                      <MathRenderer text={question.explanation} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Meta Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* Cognitive Operation */}
          {question.cognitiveOperation && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cognitive Operation</span>
              </div>
              <p className="text-sm text-gray-800">{question.cognitiveOperation}</p>
            </div>
          )}

          {/* Angle */}
          {question.angle && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Angle</span>
              </div>
              <p className="text-sm text-gray-800">{question.angle}</p>
            </div>
          )}

          {/* Trap */}
          {question.trap && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trap</span>
              </div>
              <p className="text-sm text-gray-800">{question.trap}</p>
            </div>
          )}

          {/* Key Constraint */}
          {question.keyConstraint && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Constraint</span>
              </div>
              <p className="text-sm text-gray-800">{question.keyConstraint}</p>
            </div>
          )}

          {/* Depth Level */}
          {question.depthLevel && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Depth Level</span>
              </div>
              <p className="text-sm text-gray-800">{question.depthLevel}</p>
            </div>
          )}

          {/* Statement Structure */}
          {question.statementStructure && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statement Structure</span>
              </div>
              <p className="text-sm text-gray-800">{question.statementStructure}</p>
            </div>
          )}

          {/* Distractor Strategy */}
          {question.distractorStrategy && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Distractor Strategy</span>
              </div>
              <p className="text-sm text-gray-800">{question.distractorStrategy}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
