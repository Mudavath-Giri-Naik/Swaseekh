'use client'

import { forwardRef } from 'react'
import KeyIdeaBox from './KeyIdeaBox'
import ExampleBox from './ExampleBox'

interface ContentSectionProps {
  sectionNumber: string
  subtopicName: string
  subtopicSlug: string
  topicName: string
  showKeyIdea: boolean
  showExample: boolean
  isFirst: boolean
}

const ContentSection = forwardRef<HTMLDivElement, ContentSectionProps>(
  function ContentSection(
    { sectionNumber, subtopicName, subtopicSlug, topicName, showKeyIdea, showExample, isFirst },
    ref
  ) {
    const p1 = `${subtopicName} is a core component of ${topicName} in Discrete Mathematics. It deals with systematic methods for analyzing and solving structured problems. This appears in GATE CS almost every year, testing both conceptual clarity and problem-solving speed.`

    const p2 = isFirst
      ? `The key to mastering ${subtopicName} lies in understanding its foundational principle. Every GATE question on this subtopic — regardless of how complex it appears — reduces to applying this principle correctly.`
      : `Building on earlier foundations, ${subtopicName.toLowerCase()} introduces techniques that extend the basic principles of ${topicName.toLowerCase()}. Every GATE question on this subtopic — regardless of how complex it appears — reduces to applying this principle correctly.`

    const keyIdeaContent = `Once you understand why ${subtopicName} works the way it does, solving any question on it becomes a matter of recognizing the pattern and applying the formula correctly.`

    const exampleContent = `Example: A simple application of ${subtopicName} would be: consider a set of elements where the principle directly applies. This exact pattern appears in multiple GATE questions mapped to this section.`

    return (
      <div
        ref={ref}
        id={`section-${subtopicSlug}`}
        style={{ scrollMarginTop: '80px' }}
      >
        <h3 className="concept-section-heading" style={{ fontSize: '20px', fontWeight: 700, color: '#000', marginBottom: '24px', fontFamily: "Georgia, serif" }}>
          {sectionNumber} {subtopicName}
        </h3>

        <div className="concept-body-text" style={{ marginBottom: '20px', fontSize: '15px', lineHeight: 1.8, color: '#333', fontFamily: "Georgia, serif" }}>
          {p1}
        </div>

        <div className="concept-body-text" style={{ marginBottom: '24px', fontSize: '15px', lineHeight: 1.8, color: '#333', fontFamily: "Georgia, serif" }}>
          {p2}
        </div>

        {showKeyIdea && <KeyIdeaBox content={keyIdeaContent} />}
        {showExample && <ExampleBox content={exampleContent} />}
      </div>
    )
  }
)

export default ContentSection
