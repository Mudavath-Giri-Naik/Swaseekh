'use client'

import { useState } from 'react'
import MathRenderer from '../MathRenderer'

interface FullQuestionCardProps {
  question: {
    _id: string
    questionText: string
    questionType: string
    options: string[]
    correctAnswer: string
    marks: number
    difficulty: string
    year: number
    // New rich-explanation fields (all optional — older docs may omit them)
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
  index: number
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

export default function FullQuestionCard({ question, index }: FullQuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const d = diffColors[question.difficulty] || diffColors.medium

  // Coerce to string — API/DB may return a number or null.
  const correctAnswerLetter = String(question.correctAnswer ?? '')
    .trim()
    .toUpperCase()
  const correctIndex = optionLabels.indexOf(correctAnswerLetter)

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
          GATE {question.year}
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
          <MathRenderer text={question.questionText} />
        </div>
      </div>

      {/* Options */}
      {question.questionType !== 'NAT' && question.options.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {question.options.map((opt, i) => {
            const isCorrect = i === correctIndex
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
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#15803D', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 16px', marginBottom: '12px' }}>
            Answer: {question.correctAnswer}
          </div>
          {question.whatToFind && (
            <FQSection label="What to find">
              <MathRenderer text={question.whatToFind} />
            </FQSection>
          )}
          {question.plainRestatement && (
            <FQSection label="In plain words">
              <MathRenderer text={question.plainRestatement} />
            </FQSection>
          )}
          {question.realWorldScenario && (
            <FQSection label="Real-world scenario" bg="#F0F9FF" border="#BAE6FD">
              <MathRenderer text={question.realWorldScenario} />
            </FQSection>
          )}
          {question.formulaUsed && (
            <FQSection label="Formula used" bg="#FAF5FF" border="#E9D5FF">
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#5B21B6' }}>
                {question.formulaUsed.name}
              </div>
              <div style={{ marginTop: 8, background: '#FFFFFF', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', fontSize: '13px' }}>
                <MathRenderer text={question.formulaUsed.plain} />
              </div>
              {question.formulaUsed.termsExplained?.length > 0 && (
                <ul style={{ marginTop: 8, marginLeft: 18, listStyle: 'disc', fontSize: '13px', color: '#475569' }}>
                  {question.formulaUsed.termsExplained.map((t: string, i: number) => (
                    <li key={i}><MathRenderer text={t} /></li>
                  ))}
                </ul>
              )}
            </FQSection>
          )}
          {question.solutionSteps && question.solutionSteps.length > 0 && (
            <FQSection label="Solution">
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {question.solutionSteps.map((step: string, i: number) => (
                  <li key={i} style={{ display: 'flex', gap: 8, marginTop: i === 0 ? 0 : 10 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 999, background: '#0F172A', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                      {i + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: '13.5px', lineHeight: 1.65 }}>
                      <MathRenderer text={step} />
                    </span>
                  </li>
                ))}
              </ol>
            </FQSection>
          )}
          {question.finalAnswer && (
            <FQSection label="Final answer" bg="#ECFDF5" border="#A7F3D0">
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#065F46' }}>
                <MathRenderer text={question.finalAnswer} />
              </div>
            </FQSection>
          )}
          {question.commonTrap && (
            <FQSection label="Common trap" bg="#FFFBEB" border="#FDE68A">
              <MathRenderer text={question.commonTrap} />
            </FQSection>
          )}
          {question.formulaNote && question.formulaNote.trim() !== '' && (
            <p style={{ marginTop: 12, fontSize: 12, fontStyle: 'italic', color: '#64748B' }}>
              Note: {question.formulaNote}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function FQSection({
  label,
  children,
  bg = '#F9FAFB',
  border = '#F3F4F6',
}: {
  label: string
  children: React.ReactNode
  bg?: string
  border?: string
}) {
  return (
    <div style={{ marginTop: 12, background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {label}
      </p>
      <div style={{ fontSize: 14, lineHeight: 1.65, color: '#1F2937' }}>
        {children}
      </div>
    </div>
  )
}
