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

                {question.whatToFind && (
                  <Section label="What to find">
                    <MathRenderer text={question.whatToFind} />
                  </Section>
                )}

                {question.plainRestatement && (
                  <Section label="In plain words">
                    <MathRenderer text={question.plainRestatement} />
                  </Section>
                )}

                {question.realWorldScenario && (
                  <Section label="Real-world scenario" tone="sky">
                    <MathRenderer text={question.realWorldScenario} />
                  </Section>
                )}

                {question.formulaUsed && (
                  <Section label="Formula used" tone="violet">
                    <div className="text-[14px] font-semibold text-violet-900">
                      {question.formulaUsed.name}
                    </div>
                    <div className="mt-2 rounded bg-white px-2.5 py-1.5 font-mono text-[13px] text-slate-900 ring-1 ring-violet-100">
                      <MathRenderer text={question.formulaUsed.plain} />
                    </div>
                    {question.formulaUsed.termsExplained?.length > 0 && (
                      <ul className="mt-2 ml-4 list-disc space-y-0.5 text-[12.5px] text-slate-700">
                        {question.formulaUsed.termsExplained.map((t: string, i: number) => (
                          <li key={i}>
                            <MathRenderer text={t} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </Section>
                )}

                {question.solutionSteps && question.solutionSteps.length > 0 && (
                  <Section label="Solution">
                    <ol className="space-y-2">
                      {question.solutionSteps.map((step: string, i: number) => (
                        <li key={i} className="flex gap-2 text-[13px] leading-6 text-gray-800">
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                            {i + 1}
                          </span>
                          <span className="flex-1">
                            <MathRenderer text={step} />
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Section>
                )}

                {question.finalAnswer && (
                  <Section label="Final answer" tone="emerald">
                    <div className="text-[15px] font-semibold text-emerald-900">
                      <MathRenderer text={question.finalAnswer} />
                    </div>
                  </Section>
                )}

                {question.commonTrap && (
                  <Section label="Common trap" tone="amber">
                    <MathRenderer text={question.commonTrap} />
                  </Section>
                )}

                {question.formulaNote && question.formulaNote.trim() !== '' && (
                  <p className="mt-3 text-[12px] italic text-slate-500">
                    Note: {question.formulaNote}
                  </p>
                )}
              </div>
            )}
          </div>
      </SheetContent>
    </Sheet>
  )
}

/* ─── Section helper: labelled card used for each explanation block ──── */

const TONES: Record<string, { card: string; label: string }> = {
  gray:    { card: 'bg-gray-50 border-gray-200',         label: 'text-gray-500' },
  sky:     { card: 'bg-sky-50/60 border-sky-200',        label: 'text-sky-700' },
  violet:  { card: 'bg-violet-50/60 border-violet-200',  label: 'text-violet-700' },
  emerald: { card: 'bg-emerald-50 border-emerald-200',   label: 'text-emerald-700' },
  amber:   { card: 'bg-amber-50 border-amber-200',       label: 'text-amber-700' },
}

function Section({
  label,
  tone = 'gray',
  children,
}: {
  label: string
  tone?: keyof typeof TONES
  children: React.ReactNode
}) {
  const t = TONES[tone] ?? TONES.gray
  return (
    <div className={`mt-4 rounded-lg border px-4 py-3 ${t.card}`}>
      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-wider ${t.label}`}>
        {label}
      </p>
      <div className="text-[14px] leading-relaxed text-gray-800">{children}</div>
    </div>
  )
}
