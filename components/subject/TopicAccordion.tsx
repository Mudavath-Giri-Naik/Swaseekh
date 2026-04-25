'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import SubtopicRow from './SubtopicRow'

interface Subtopic {
  _id: string
  name: string
  slug: string
  questionCount: number
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
}

interface TopicAccordionProps {
  name: string
  questionCount: number
  subtopics: Subtopic[]
  subjectSlug: string
}

export default function TopicAccordion({ name, questionCount, subtopics, subjectSlug }: TopicAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        marginBottom: '12px',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChevronRight
            size={18}
            color="#6B7280"
            style={{
              transition: 'transform 200ms ease',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          />
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
            {name}
          </span>
        </div>
        <span style={{ fontSize: '14px', color: '#6B7280' }}>
          {questionCount} Questions
        </span>
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ borderTop: '1px solid #E5E7EB' }}>
            {subtopics.map((sub) => (
              <SubtopicRow
                key={sub._id}
                name={sub.name}
                slug={sub.slug}
                questionCount={sub.questionCount}
                ccdStatus={sub.ccdStatus}
                href={`/gate/${subjectSlug}/${sub.slug}`}
              />
            ))}
            {subtopics.length === 0 && (
              <div style={{ padding: '16px 20px 16px 40px', fontSize: '14px', color: '#9CA3AF' }}>
                No subtopics available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
