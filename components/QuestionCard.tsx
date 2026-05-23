'use client'

import { useState } from 'react'
import MathRenderer from './MathRenderer'

interface Question {
  _id: string
  questionText: string
  questionType: string
  options: string[]
  correctAnswer: string
  marks: number
  difficulty: string
  year: number
  // New rich-explanation fields (all optional — render only when present)
  whatToFind?: string
  plainRestatement?: string
  realWorldScenario?: string
  formulaUsed?: {
    formulaId: string
    name: string
    plain: string
    termsExplained: string[]
  } | null
  solutionSteps?: string[]
  finalAnswer?: string
  commonTrap?: string
  formulaNote?: string
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

  // Determine correct option index from the letter answer.
  // Coerce to string first — API/DB may return a number or null.
  const correctAnswerLetter = String(question.correctAnswer ?? '')
    .trim()
    .toUpperCase()
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

          {question.whatToFind && (
            <QCBlock label="What to find">
              <MathRenderer text={question.whatToFind} />
            </QCBlock>
          )}
          {question.plainRestatement && (
            <QCBlock label="In plain words">
              <MathRenderer text={question.plainRestatement} />
            </QCBlock>
          )}
          {question.realWorldScenario && (
            <QCBlock label="Real-world scenario" tone="sky">
              <MathRenderer text={question.realWorldScenario} />
            </QCBlock>
          )}
          {question.formulaUsed && (
            <QCBlock label="Formula used" tone="violet">
              <div className="text-sm font-semibold text-violet-900">
                {question.formulaUsed.name}
              </div>
              <div className="mt-2 rounded bg-white px-2.5 py-1.5 font-mono text-[13px] text-slate-900 ring-1 ring-violet-100">
                <MathRenderer text={question.formulaUsed.plain} />
              </div>
              {question.formulaUsed.termsExplained?.length > 0 && (
                <ul className="mt-2 ml-4 list-disc space-y-0.5 text-[12.5px] text-slate-700">
                  {question.formulaUsed.termsExplained.map((t, i) => (
                    <li key={i}>
                      <MathRenderer text={t} />
                    </li>
                  ))}
                </ul>
              )}
            </QCBlock>
          )}
          {question.solutionSteps && question.solutionSteps.length > 0 && (
            <QCBlock label="Solution">
              <ol className="space-y-2">
                {question.solutionSteps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-6 text-gray-800">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="flex-1">
                      <MathRenderer text={step} />
                    </span>
                  </li>
                ))}
              </ol>
            </QCBlock>
          )}
          {question.finalAnswer && (
            <QCBlock label="Final answer" tone="emerald">
              <div className="text-[15px] font-semibold text-emerald-900">
                <MathRenderer text={question.finalAnswer} />
              </div>
            </QCBlock>
          )}
          {question.commonTrap && (
            <QCBlock label="Common trap" tone="amber">
              <MathRenderer text={question.commonTrap} />
            </QCBlock>
          )}
          {question.formulaNote && question.formulaNote.trim() !== '' && (
            <p className="mt-2 text-xs italic text-slate-500">
              Note: {question.formulaNote}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const QC_TONES: Record<string, string> = {
  gray:    'bg-gray-50 border-gray-200 [&_p.label]:text-gray-500',
  sky:     'bg-sky-50/60 border-sky-200 [&_p.label]:text-sky-700',
  violet:  'bg-violet-50/60 border-violet-200 [&_p.label]:text-violet-700',
  emerald: 'bg-emerald-50 border-emerald-200 [&_p.label]:text-emerald-700',
  amber:   'bg-amber-50 border-amber-200 [&_p.label]:text-amber-700',
}

function QCBlock({
  label,
  tone = 'gray',
  children,
}: {
  label: string
  tone?: keyof typeof QC_TONES
  children: React.ReactNode
}) {
  return (
    <div className={`rounded-lg border p-4 ${QC_TONES[tone] ?? QC_TONES.gray}`}>
      <p className="label mb-2 text-xs font-semibold uppercase tracking-wider">
        {label}
      </p>
      <div className="text-sm leading-[1.7] text-gray-800">{children}</div>
    </div>
  )
}
