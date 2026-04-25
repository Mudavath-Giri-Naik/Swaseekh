'use client'

import { useState } from 'react'
import MathRenderer from '../MathRenderer'

interface FullQuestionCardProps {
  question: {
    _id: string
    questionLatex: string
    questionType: 'MCQ' | 'MSQ' | 'NAT'
    optionsLatex: string[]
    correctAnswer: number | number[] | string
    explanationLatex: string
    marks: 1 | 2
    difficulty: 'easy' | 'medium' | 'hard'
    examMeta: { year: number; questionNumber: number }
  }
  index: number
}

const diffColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: '#DCFCE7', text: '#15803D' },
  medium: { bg: '#FEF9C3', text: '#854D0E' },
  hard: { bg: '#FEE2E2', text: '#991B1B' },
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

export default function FullQuestionCard({ question, index }: FullQuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const d = diffColors[question.difficulty] || diffColors.medium

  const correctIndices: number[] = Array.isArray(question.correctAnswer)
    ? (question.correctAnswer as number[])
    : typeof question.correctAnswer === 'number'
      ? [question.correctAnswer]
      : []

  return (
    <div
      id={`full-q-${question._id}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
        scrollMarginTop: '80px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: '#DBEAFE', color: '#1D4ED8' }}>
          GATE {question.examMeta.year}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: '#F3F4F6', color: '#374151' }}>
          {question.marks} Mark{question.marks > 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: d.bg, color: d.text }}>
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', border: '1px solid #D1D5DB', color: '#6B7280' }}>
          {question.questionType}
        </span>
      </div>

      {/* Q number + text */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>
          Q{index + 1}
        </span>
        <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#1F2937' }}>
          <MathRenderer text={question.questionLatex} />
        </div>
      </div>

      {/* Options */}
      {question.questionType !== 'NAT' && question.optionsLatex.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {question.optionsLatex.map((opt, i) => {
            const isCorrect = correctIndices.includes(i)
            const highlighted = showAnswer && isCorrect
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  background: highlighted ? '#F0FDF4' : '#F9FAFB',
                  border: highlighted ? '1px solid #BBF7D0' : '1px solid transparent',
                  transition: 'all 200ms',
                }}
              >
                <span style={{ fontWeight: 600, color: highlighted ? '#15803D' : '#6B7280', flexShrink: 0 }}>
                  {optionLabels[i]}.
                </span>
                <span style={{ color: highlighted ? '#166534' : '#374151' }}>
                  <MathRenderer text={opt} />
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Show/Hide Answer */}
      <button
        onClick={() => setShowAnswer(!showAnswer)}
        style={{
          padding: '8px 20px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#6B7280',
          background: '#FFFFFF',
          cursor: 'pointer',
          transition: 'all 150ms',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#F9FAFB' }}
        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#FFFFFF' }}
      >
        {showAnswer ? 'Hide Answer' : 'Show Answer'}
      </button>

      {/* Answer + Explanation */}
      {showAnswer && (
        <div style={{ marginTop: '16px' }}>
          {question.questionType === 'NAT' && (
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#15803D', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 16px', marginBottom: '12px' }}>
              Answer: {String(question.correctAnswer)}
            </div>
          )}
          {question.explanationLatex && (
            <div style={{ background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Explanation
              </p>
              <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#374151' }}>
                <MathRenderer text={question.explanationLatex} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
