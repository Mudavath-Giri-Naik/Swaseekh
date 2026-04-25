'use client'

import QuestionTextRow from './QuestionTextRow'

interface QuestionData {
  _id: string
  questionLatex: string
  questionType: 'MCQ' | 'MSQ' | 'NAT'
  optionsLatex: string[]
  marks: 1 | 2
  difficulty: 'easy' | 'medium' | 'hard'
  examMeta: { year: number }
}

interface QuestionGroupProps {
  questions: { q: QuestionData; globalIdx: number }[]
  side: 'left' | 'right'
  hoveredQuestionId: string | null
  setHoveredQuestionId: (id: string | null) => void
  onQuestionClick: (id: string) => void
}

export default function QuestionGroup({
  questions,
  side,
  hoveredQuestionId,
  setHoveredQuestionId,
  onQuestionClick,
}: QuestionGroupProps) {
  if (questions.length === 0) return null

  const isHovered = questions.some((item) => item.q._id === hoveredQuestionId)
  const bracketColor = isHovered ? '#7C3AED' : '#A78BFA'
  const bracketWidth = isHovered ? '2px' : '1.5px'

  return (
    <div style={{ position: 'relative', padding: '8px 0' }}>
      {/* List of questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {questions.map(({ q, globalIdx }) => (
          <QuestionTextRow
            key={q._id}
            questionNumber={globalIdx + 1}
            question={q}
            side={side}
            onClick={() => onQuestionClick(q._id)}
            hoveredId={hoveredQuestionId}
            onHover={setHoveredQuestionId}
          />
        ))}
      </div>

      {/* Bracket visuals */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [side === 'left' ? 'right' : 'left']: 0,
          width: bracketWidth,
          background: bracketColor,
          transition: 'all 150ms ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          [side === 'left' ? 'right' : 'left']: '-32px',
          width: '32px',
          height: bracketWidth,
          background: bracketColor,
          transition: 'all 150ms ease',
        }}
      />
    </div>
  )
}
