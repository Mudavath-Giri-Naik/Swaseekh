'use client'

import { useState } from 'react'
import MathRenderer from './MathRenderer'

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
}

interface QuestionCardProps {
  question: Question
  index: number
}

const difficultyColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: 'bg-green-50', text: 'text-green-700' },
  Easy: { bg: 'bg-green-50', text: 'text-green-700' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  Medium: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  hard: { bg: 'bg-red-50', text: 'text-red-700' },
  Hard: { bg: 'bg-red-50', text: 'text-red-700' },
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

export default function QuestionCard({ question, index }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const diff = difficultyColors[question.difficulty] ?? difficultyColors.medium

  // Determine correct option index from the letter answer
  const correctAnswerLetter = question.correctAnswer?.trim()?.toUpperCase()
  const correctIndex = optionLabels.indexOf(correctAnswerLetter)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Year */}
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
          GATE {question.year}
        </span>
        {/* Marks */}
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          {question.marks} Mark{question.marks > 1 ? 's' : ''}
        </span>
        {/* Difficulty */}
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${diff.bg} ${diff.text}`}
        >
          {question.difficulty.charAt(0).toUpperCase() +
            question.difficulty.slice(1)}
        </span>
        {/* Type */}
        <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-600">
          {question.questionType}
        </span>
      </div>

      {/* Question number + text */}
      <div className="mb-4">
        <span className="text-xs font-medium text-gray-400 block mb-1">
          Q{index + 1}
        </span>
        <div className="text-base leading-[1.7] text-black">
          <MathRenderer text={question.questionText} />
        </div>
      </div>

      {/* Options (MCQ / MSQ) */}
      {question.questionType !== 'NAT' && question.options.length > 0 && (
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => {
            const isCorrect = i === correctIndex
            const highlighted = showAnswer && isCorrect

            return (
              <div
                key={i}
                className={`flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${highlighted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-transparent'}`}
              >
                <span
                  className={`font-semibold shrink-0 ${highlighted ? 'text-green-700' : 'text-gray-500'}`}
                >
                  {optionLabels[i]}.
                </span>
                <span className={`leading-[1.7] ${highlighted ? 'text-green-800' : 'text-gray-800'}`}>
                  <MathRenderer text={opt} />
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Show/Hide Answer button */}
      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200
                   px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-150"
      >
        {showAnswer ? 'Hide Answer' : 'Show Answer'}
      </button>

      {/* Answer + Explanation */}
      {showAnswer && (
        <div className="mt-4 space-y-3">
          {/* Answer display */}
          <div className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
            Answer: {question.correctAnswer}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Explanation
              </p>
              <div className="text-sm leading-[1.7] text-gray-700">
                <MathRenderer text={question.explanation} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
