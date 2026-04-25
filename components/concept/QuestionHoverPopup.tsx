'use client'

import MathRenderer from '../MathRenderer'

interface QuestionHoverPopupProps {
  question: {
    questionLatex: string
    questionType: 'MCQ' | 'MSQ' | 'NAT'
    optionsLatex: string[]
    marks: 1 | 2
    difficulty: 'easy' | 'medium' | 'hard'
    examMeta: { year: number }
  }
  side: 'left' | 'right'
  onViewFull: () => void
}

const diffColors: Record<string, { bg: string; text: string }> = {
  easy: { bg: '#DCFCE7', text: '#15803D' },
  medium: { bg: '#FEF9C3', text: '#854D0E' },
  hard: { bg: '#FEE2E2', text: '#991B1B' },
}

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']

export default function QuestionHoverPopup({ question, side, onViewFull }: QuestionHoverPopupProps) {
  const d = diffColors[question.difficulty] || diffColors.medium

  return (
    <div
      className="question-hover-popup"
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        ...(side === 'left' ? { left: 'calc(100% + 12px)' } : { right: 'calc(100% + 12px)' }),
        background: '#FFFFFF',
        border: '1px solid #DDD6FE',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        maxWidth: '380px',
        width: '340px',
        padding: '20px',
        zIndex: 100,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '20px',
            background: '#DBEAFE',
            color: '#1D4ED8',
          }}
        >
          GATE {question.examMeta.year}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '20px',
            background: '#F3F4F6',
            color: '#374151',
          }}
        >
          {question.marks} Mark{question.marks > 1 ? 's' : ''}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '20px',
            background: d.bg,
            color: d.text,
          }}
        >
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '20px',
            border: '1px solid #D1D5DB',
            color: '#6B7280',
          }}
        >
          {question.questionType}
        </span>
      </div>

      {/* Full question text */}
      <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#1F2937', marginBottom: '12px' }}>
        <MathRenderer text={question.questionLatex} />
      </div>

      {/* Options if MCQ/MSQ */}
      {question.questionType !== 'NAT' && question.optionsLatex.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {question.optionsLatex.map((opt, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '8px',
                fontSize: '13px',
                lineHeight: 1.6,
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#F9FAFB',
              }}
            >
              <span style={{ fontWeight: 600, color: '#6B7280', flexShrink: 0 }}>
                {optionLabels[i]}.
              </span>
              <span style={{ color: '#374151' }}>
                <MathRenderer text={opt} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* View Full Question button */}
      <button
        onClick={onViewFull}
        style={{
          width: '100%',
          padding: '8px 0',
          background: '#F5F3FF',
          border: '1px solid #DDD6FE',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#7C3AED',
          cursor: 'pointer',
          fontFamily: "'Inter', system-ui, sans-serif",
          transition: 'background 150ms ease',
        }}
        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#EDE9FE' }}
        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#F5F3FF' }}
      >
        View Full Question ↓
      </button>
    </div>
  )
}
