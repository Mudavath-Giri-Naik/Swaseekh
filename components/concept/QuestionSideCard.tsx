'use client'

import { forwardRef, useState, useRef, useEffect } from 'react'
import MathRenderer from '../MathRenderer'
import QuestionHoverPopup from './QuestionHoverPopup'

interface QuestionData {
  _id: string
  questionText: string
  questionType: string
  options: string[]
  marks: number
  difficulty: string
  year: number
}

interface QuestionSideCardProps {
  questionNumber: number
  question: QuestionData
  isActive: boolean
  isDimmed: boolean
  side: 'left' | 'right'
  onClick: () => void
  onViewFull: () => void
  hoveredId: string | null
  onHover: (id: string | null) => void
}

const diffDotColors: Record<string, string> = {
  easy: '#22C55E',
  Easy: '#22C55E',
  medium: '#F59E0B',
  Medium: '#F59E0B',
  hard: '#EF4444',
  Hard: '#EF4444',
}

const QuestionSideCard = forwardRef<HTMLDivElement, QuestionSideCardProps>(
  function QuestionSideCard(
    { questionNumber, question, isActive, isDimmed, side, onClick, onViewFull, hoveredId, onHover },
    ref
  ) {
    const preview = question.questionText.length > 120
      ? question.questionText.slice(0, 120) + '…'
      : question.questionText

    const isHovered = hoveredId === question._id
    const cardRef = useRef<HTMLDivElement>(null)
    const [popupFlip, setPopupFlip] = useState(false)

    // Check if popup would go off-screen and flip it
    useEffect(() => {
      if (isHovered && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const popupWidth = 352
        if (side === 'left') {
          if (rect.right + popupWidth + 20 > window.innerWidth) setPopupFlip(true)
          else setPopupFlip(false)
        } else {
          if (rect.left - popupWidth - 20 < 0) setPopupFlip(true)
          else setPopupFlip(false)
        }
      }
    }, [isHovered, side])

    const stripColor = side === 'left' ? '#8B5CF6' : '#3B82F6'
    const diffDot = diffDotColors[question.difficulty] || diffDotColors.medium

    const cls = `q-side-card${isActive ? ' active' : ''}${isDimmed ? ' dimmed' : ''}`

    return (
      <div
        ref={(el) => {
          // Merge refs
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
        }}
        className={cls}
        onClick={onClick}
        onMouseEnter={() => onHover(question._id)}
        onMouseLeave={() => onHover(null)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
        }}
        style={{ position: 'relative' }}
      >
        {/* Side strip */}
        <div className="side-strip" style={{ background: stripColor }} />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: '#7C3AED',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '20px',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Q{questionNumber}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: '#6B7280',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              GATE {question.year} · {question.marks} Mark{question.marks > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Preview text */}
        <div
          className="line-clamp-3"
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#1F2937',
            fontFamily: "'Inter', system-ui, sans-serif",
            marginBottom: '8px',
          }}
        >
          <MathRenderer text={preview} />
        </div>

        {/* Difficulty dot */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: diffDot,
              display: 'inline-block',
            }}
          />
        </div>

        {/* Hover popup */}
        {isHovered && (
          <QuestionHoverPopup
            question={question}
            side={popupFlip ? (side === 'left' ? 'right' : 'left') : side}
            onViewFull={onViewFull}
          />
        )}
      </div>
    )
  }
)

export default QuestionSideCard
