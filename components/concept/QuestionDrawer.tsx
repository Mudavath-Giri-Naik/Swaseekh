'use client'

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import MathRenderer from '../MathRenderer'

interface QuestionDrawerProps {
  question: any | null
  isOpen: boolean
  onClose: () => void
  topicName: string
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

export default function QuestionDrawer({ question, isOpen, onClose, topicName }: QuestionDrawerProps) {
  const [showAnswer, setShowAnswer] = useState(false)

  // Reset showAnswer when question changes
  React.useEffect(() => {
    setShowAnswer(false)
  }, [question])

  if (!question) return null

  const d = diffColors[question.difficulty] || diffColors.medium

  // For the new schema, correctAnswer is a string like "A", "B", etc.
  // Coerce defensively — older records can be numbers or null.
  const correctAnswerLetter = String(question.correctAnswer ?? '')
    .trim()
    .toUpperCase()
  const correctIndex = optionLabels.indexOf(correctAnswerLetter)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[90vw] sm:max-w-[600px] md:max-w-[700px] overflow-y-auto p-0 flex flex-col bg-white">
        <SheetHeader className="px-6 py-4 border-b bg-white shrink-0">
          <SheetTitle className="text-lg font-bold">Question Details</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 bg-white">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                GATE {question.year}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                {question.marks} Mark{question.marks > 1 ? 's' : ''}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: d.bg, color: d.text }}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-300 text-gray-500">
                {question.questionType}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-700">
                {topicName}
              </span>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <div className="text-[15px] leading-relaxed text-gray-900">
                <MathRenderer text={question.questionText} />
              </div>
            </div>

            {/* Options */}
            {question.questionType !== 'NAT' && question.options && question.options.length > 0 && (
              <div className="flex flex-col gap-2.5 mb-8">
                {question.options.map((opt: string, i: number) => {
                  const isCorrect = showAnswer && i === correctIndex
                  return (
                    <div
                      key={i}
                      className={`flex gap-3 px-4 py-3 rounded-lg text-[14px] leading-relaxed transition-all ${
                        isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-transparent'
                      }`}
                    >
                      <span className={`font-semibold shrink-0 ${isCorrect ? 'text-green-700' : 'text-gray-500'}`}>
                        {optionLabels[i]}.
                      </span>
                      <span className={isCorrect ? 'text-green-900' : 'text-gray-800'}>
                        <MathRenderer text={opt} />
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Actions */}
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>

            {/* Answer + Explanation */}
            {showAnswer && (
              <div className="mt-6">
                {/* Answer display */}
                <div className="text-[14px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-4">
                  Correct Answer: {question.correctAnswer}
                </div>

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

                {/* Extra metadata */}
                {(question.trap || question.angle || question.cognitiveOperation) && (
                  <div className="mt-4 space-y-2">
                    {question.trap && (
                      <div className="text-[13px] text-gray-600">
                        <span className="font-semibold text-amber-700">Trap:</span> {question.trap}
                      </div>
                    )}
                    {question.angle && (
                      <div className="text-[13px] text-gray-600">
                        <span className="font-semibold text-blue-700">Angle:</span> {question.angle}
                      </div>
                    )}
                    {question.cognitiveOperation && (
                      <div className="text-[13px] text-gray-600">
                        <span className="font-semibold text-purple-700">Cognitive Op:</span> {question.cognitiveOperation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
      </SheetContent>
    </Sheet>
  )
}
