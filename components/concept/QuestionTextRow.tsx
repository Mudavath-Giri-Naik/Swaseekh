'use client'

import { forwardRef, useState, useRef, useEffect } from 'react'
import MathRenderer from '../MathRenderer'
import QuestionHoverPopup from './QuestionHoverPopup'

interface QuestionData {
  _id: string
  questionLatex: string
  questionType: 'MCQ' | 'MSQ' | 'NAT'
  optionsLatex: string[]
  marks: 1 | 2
  difficulty: 'easy' | 'medium' | 'hard'
  examMeta: { year: number }
}

interface QuestionTextRowProps {
  questionNumber: number
  question: QuestionData
  side: 'left' | 'right'
  onClick: () => void
  hoveredId: string | null
  onHover: (id: string | null) => void
}

const QuestionTextRow = forwardRef<HTMLDivElement, QuestionTextRowProps>(
  function QuestionTextRow(
    { questionNumber, question, side, onClick, hoveredId, onHover },
    ref
  ) {
    const isHovered = hoveredId === question._id
    const rowRef = useRef<HTMLDivElement>(null)
    const [popupFlip, setPopupFlip] = useState(false)

    // Check if popup would go off-screen and flip it
    useEffect(() => {
      if (isHovered && rowRef.current) {
        const rect = rowRef.current.getBoundingClientRect()
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

    return (
      <div
        ref={(el) => {
          (rowRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
        }}
        className="q-text-row"
        onClick={onClick}
        onMouseEnter={() => onHover(question._id)}
        onMouseLeave={() => onHover(null)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() }
        }}
      >
        <span style={{ fontWeight: 600, marginRight: '4px' }}>{questionNumber}.</span>
        <MathRenderer text={question.questionLatex} />

        {/* Hover popup */}
        {isHovered && (
          <QuestionHoverPopup
            question={question}
            side={popupFlip ? (side === 'left' ? 'right' : 'left') : side}
            onViewFull={onClick}
          />
        )}
      </div>
    )
  }
)

export default QuestionTextRow
