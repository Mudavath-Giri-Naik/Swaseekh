'use client'

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import ContentSection from './ContentSection'
import SectionDivider from './SectionDivider'
import FullQuestionCard from './FullQuestionCard'
import FilterBar from '../FilterBar'
import QuestionGroup from './QuestionGroup'
import { useSidebarData } from '@/components/sidebar-context'

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Question {
  _id: string
  questionLatex: string
  questionType: 'MCQ' | 'MSQ' | 'NAT'
  optionsLatex: string[]
  correctAnswer: number | number[] | string
  explanationLatex: string
  marks: 1 | 2
  difficulty: 'easy' | 'medium' | 'hard'
  taxonomy: {
    subjectId: string
    topicId: string
    subtopicId: string
  }
  examMeta: {
    exam: string
    stream: string
    year: number
    shift: string | null
    questionNumber: number
  }
}

interface Subtopic {
  _id: string
  name: string
  slug: string
  questionCount: number
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
}

interface Topic {
  _id: string
  name: string
  slug: string
  shortCode: string
  subtopics: Subtopic[]
  questionCount: number
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
}

interface ThreeColumnLayoutProps {
  questions: Question[]
  topics: Topic[]
  subjectSlug: string
  conceptSlug: string
}
export default function ThreeColumnLayout({
  questions,
  topics,
  subjectSlug,
  conceptSlug,
}: ThreeColumnLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const middleColRef = useRef<HTMLDivElement>(null)
  const sidebarData = useSidebarData()

  // Filter state
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null)

  // Position state for absolute positioning groups
  const [groupPositions, setGroupPositions] = useState<Record<string, number>>({})

  // Refs for tracking DOM elements
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Flattened sections for easy mapping (Topic and Subtopic)
  const allSections = useMemo(() => {
    const flat: Array<{ id: string, slug: string, name: string, isTopic: boolean, topicName?: string }> = []
    topics.forEach((t) => {
      flat.push({ id: t._id, slug: t.slug, name: t.name, isTopic: true })
      if (t.subtopics) {
        t.subtopics.forEach(s => {
          flat.push({ id: s._id, slug: s.slug, name: s.name, isTopic: false, topicName: t.name })
        })
      }
    })
    return flat
  }, [topics])

  // Years for filter
  const years = useMemo(() => {
    const set = new Set<number>()
    questions.forEach((q) => set.add(q.examMeta.year))
    return Array.from(set).sort((a, b) => b - a)
  }, [questions])

  // Filtered + sorted
  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (selectedYear && q.examMeta.year !== Number(selectedYear)) return false
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false
      if (selectedType && q.questionType !== selectedType) return false
      return true
    })
  }, [questions, selectedYear, selectedDifficulty, selectedType])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => b.examMeta.year - a.examMeta.year)
  }, [filtered])

  // Group questions by section, then split left/right within each section
  const { leftBySection, rightBySection } = useMemo(() => {
    const bySection = new Map<string, Question[]>()
    allSections.forEach((s) => bySection.set(s.id, []))
    
    sorted.forEach((q) => {
      const sid = q.taxonomy.subtopicId || q.taxonomy.topicId
      // If we don't have a section for this question, dump it in the first topic
      const targetId = bySection.has(sid) ? sid : (topics[0]?._id || '')
      if (targetId) {
        const arr = bySection.get(targetId) || []
        arr.push(q)
        bySection.set(targetId, arr)
      }
    })

    const leftGroup: Record<string, { q: Question; globalIdx: number }[]> = {}
    const rightGroup: Record<string, { q: Question; globalIdx: number }[]> = {}
    let globalIdx = 0

    for (const section of allSections) {
      leftGroup[section.id] = []
      rightGroup[section.id] = []
      const qs = bySection.get(section.id) || []
      qs.forEach((q, i) => {
        if (i % 2 === 0) leftGroup[section.id].push({ q, globalIdx })
        else rightGroup[section.id].push({ q, globalIdx })
        globalIdx++
      })
    }

    return { leftBySection: leftGroup, rightBySection: rightGroup }
  }, [sorted, allSections, topics])

  // Calculate top positions for each section to align bracket groups
  const recalculatePositions = useCallback(() => {
    if (!middleColRef.current) return
    const middleRect = middleColRef.current.getBoundingClientRect()
    
    const newPositions: Record<string, number> = {}
    
    allSections.forEach((sec) => {
      const el = sectionRefs.current[sec.id]
      if (el) {
        // Find the relative Y offset from the top of the middle column
        const headingRect = el.getBoundingClientRect()
        const offsetToMiddleTop = headingRect.top - middleRect.top
        newPositions[sec.id] = offsetToMiddleTop + 14 // 14px roughly aligns with center of typical heading text
      }
    })
    
    setGroupPositions(newPositions)
  }, [allSections])

  useEffect(() => {
    // Initial calculation
    const timer1 = setTimeout(recalculatePositions, 100)
    const timer2 = setTimeout(recalculatePositions, 500)
    
    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(recalculatePositions))
    if (middleColRef.current) resizeObserver.observe(middleColRef.current)
    
    window.addEventListener('resize', recalculatePositions)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', recalculatePositions)
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [recalculatePositions])

  // Intersection observer for active section tracking and URL updating
  useEffect(() => {
    const observers: IntersectionObserver[] = []
    
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-section-id')
          const slug = entry.target.getAttribute('data-section-slug')
          if (id && slug) {
            setActiveSectionId(id)
            sidebarData.setActiveSectionId(id)
            // Update URL without reload
            window.history.replaceState(null, '', `/gate/${subjectSlug}/${slug}`)
          }
        }
      })
    }

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(handleIntersect, { 
        threshold: 0,
        rootMargin: '-60px 0px -60% 0px' 
      })
      
      allSections.forEach((s) => {
        const el = sectionRefs.current[s.id]
        if (el) observer.observe(el)
      })
      observers.push(observer)
    }, 500)
    
    return () => {
      clearTimeout(timer)
      observers.forEach((o) => o.disconnect())
    }
  }, [allSections, subjectSlug])

  // Initial Auto-Scroll to Concept
  useEffect(() => {
    if (conceptSlug) {
      const targetElement = document.getElementById(`subtopic-${conceptSlug}`) || document.getElementById(`topic-${conceptSlug}`)
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300) // slight delay to ensure DOM is ready
      }
    }
  }, [conceptSlug]) // Run once on mount or when concept changes heavily

  // Scroll to full question
  const scrollToFullQuestion = useCallback((qId: string) => {
    const el = document.getElementById(`full-q-${qId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleYearChange = useCallback((v: string) => setSelectedYear(v), [])
  const handleDiffChange = useCallback((v: string) => setSelectedDifficulty(v), [])
  const handleTypeChange = useCallback((v: string) => setSelectedType(v), [])

  // Find active concept name for breadcrumbs — push to sidebar context
  const activeSection = allSections.find(s => s.id === activeSectionId)
  const conceptName = activeSection ? activeSection.name : (allSections[0]?.name || 'Overview')

  // Keep sidebar breadcrumb in sync
  useEffect(() => {
    sidebarData.setConceptName(conceptName)
  }, [conceptName, sidebarData])

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      {/* Container */}
      <div style={{ display: 'flex', gap: '40px', maxWidth: '1440px', margin: '0 auto', alignItems: 'start', justifyContent: 'center' }}>

        {/* ─── Three Column Grid ─────────────────────────────────────────── */}
        <div ref={containerRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <div
            className="three-col-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '180px 1fr 180px',
              gap: '24px',
              position: 'relative',
              zIndex: 2,
              alignItems: 'start',
            }}
          >
            {/* ─── Left Column ─────────────────────────────────────────── */}
            <div
              className="hidden lg:block"
              style={{ position: 'relative', height: '100%', minHeight: '500px' }}
            >
              {allSections.map((sec) => {
                const qs = leftBySection[sec.id] || []
                if (qs.length === 0) return null
                
                const topPos = groupPositions[sec.id]
                const isReady = topPos !== undefined
                
                return (
                  <div
                    key={sec.id}
                    style={{
                      position: 'absolute',
                      top: topPos || 0,
                      width: '100%',
                      transform: 'translateY(-50%)',
                      opacity: isReady ? 1 : 0,
                      pointerEvents: isReady ? 'auto' : 'none',
                      transition: 'opacity 200ms ease',
                    }}
                  >
                    <QuestionGroup
                      questions={qs}
                      side="left"
                      hoveredQuestionId={hoveredQuestionId}
                      setHoveredQuestionId={setHoveredQuestionId}
                      onQuestionClick={scrollToFullQuestion}
                    />
                  </div>
                )
              })}
            </div>

            {/* ─── Middle Column ────────────────────────────────────────── */}
            <div 
              ref={middleColRef}
              className="concept-middle-col" 
              style={{ padding: '48px', minHeight: '500px' }}
            >
              {/* Full Subject Header */}
              <h1
                style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#000',
                  lineHeight: 1.2,
                  marginBottom: '48px',
                  fontFamily: "Georgia, serif",
                  textAlign: 'center'
                }}
              >
                {topics[0]?.name || 'Subject Overview'}
              </h1>

              {/* Topics and Subtopics Sequential Render (A4 Pages) */}
              {topics.map((topic, tIdx) => (
                <div key={topic._id}>
                  {topic.subtopics && topic.subtopics.length > 0 ? (
                    topic.subtopics.map((sub, sIdx) => {
                      // Calculate pseudo page number based on indices
                      let prevPages = 0;
                      for (let i = 0; i < tIdx; i++) {
                        prevPages += topics[i].subtopics?.length || 0;
                      }
                      const pageNum = prevPages + sIdx + 1;

                      return (
                        <div 
                          key={sub._id} 
                          id={`subtopic-${sub.slug}`}
                          data-section-id={sub._id}
                          data-section-slug={sub.slug}
                          ref={(el) => { sectionRefs.current[sub._id] = el }}
                          className="pdf-page bg-white relative flex flex-col justify-between"
                          style={{
                            width: '100%',
                            maxWidth: '794px', // A4 approx width at 96dpi
                            minHeight: '1123px', // A4 approx height
                            border: 'none',
                            margin: '0 auto 64px auto',
                            padding: '80px 60px',
                            scrollMarginTop: '80px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            {/* Render Topic Heading ONLY on the first subtopic page of a topic */}
                            {sIdx === 0 && (
                              <div style={{ marginBottom: '40px', paddingBottom: '16px', borderBottom: '2px solid #000' }}>
                                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#000', margin: 0, fontFamily: "Georgia, serif" }}>
                                  {tIdx + 1}. {topic.name}
                                </h2>
                              </div>
                            )}

                            <ContentSection
                              sectionNumber={`${tIdx + 1}.${sIdx + 1}`}
                              subtopicName={sub.name}
                              subtopicSlug={sub.slug}
                              topicName={topic.name}
                              showKeyIdea={sIdx === 0}
                              showExample={true}
                              isFirst={tIdx === 0 && sIdx === 0}
                            />
                          </div>
                          
                          {/* Page Footer */}
                          <div style={{ 
                            marginTop: '60px', 
                            borderTop: '1px solid #000', 
                            paddingTop: '16px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            fontSize: '13px', 
                            color: '#000',
                            fontFamily: "Georgia, serif"
                          }}>
                            <span>{topic.name}</span>
                            <span>{pageNum}</span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div 
                      key={topic._id}
                      className="pdf-page bg-white relative flex flex-col justify-between"
                      style={{
                        width: '100%',
                        maxWidth: '794px',
                        minHeight: '1123px',
                        border: 'none',
                        margin: '0 auto 64px auto',
                        padding: '80px 60px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '40px', paddingBottom: '16px', borderBottom: '2px solid #000' }}>
                          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#000', margin: 0, fontFamily: "Georgia, serif" }}>
                            {tIdx + 1}. {topic.name}
                          </h2>
                        </div>
                        <p style={{ color: '#333', fontStyle: 'italic', fontFamily: "Georgia, serif" }}>Content for {topic.name} is available here.</p>
                      </div>
                      <div style={{ marginTop: '60px', borderTop: '1px solid #000', paddingTop: '16px', textAlign: 'right', fontSize: '13px', color: '#000', fontFamily: "Georgia, serif" }}>
                        <span>-</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Section Divider */}
              {sorted.length > 0 && (
                <>
                  <SectionDivider />

                  {/* Compact filter bar */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '20px',
                    }}
                  >
                    <FilterBar
                      years={years}
                      selectedYear={selectedYear}
                      selectedDifficulty={selectedDifficulty}
                      selectedType={selectedType}
                      onYearChange={handleYearChange}
                      onDifficultyChange={handleDiffChange}
                      onTypeChange={handleTypeChange}
                    />
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>
                      {filtered.length} {filtered.length === 1 ? 'Question' : 'Questions'}
                    </span>
                  </div>

                  {/* Full expanded questions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {sorted.map((q, i) => (
                      <FullQuestionCard key={q._id} question={q} index={i} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ─── Right Column ────────────────────────────────────────── */}
            <div
              className="hidden lg:block"
              style={{ position: 'relative', height: '100%', minHeight: '500px' }}
            >
              {allSections.map((sec) => {
                const qs = rightBySection[sec.id] || []
                if (qs.length === 0) return null
                
                const topPos = groupPositions[sec.id]
                const isReady = topPos !== undefined
                
                return (
                  <div
                    key={sec.id}
                    style={{
                      position: 'absolute',
                      top: topPos || 0,
                      width: '100%',
                      transform: 'translateY(-50%)',
                      opacity: isReady ? 1 : 0,
                      pointerEvents: isReady ? 'auto' : 'none',
                      transition: 'opacity 200ms ease',
                    }}
                  >
                    <QuestionGroup
                      questions={qs}
                      side="right"
                      hoveredQuestionId={hoveredQuestionId}
                      setHoveredQuestionId={setHoveredQuestionId}
                      onQuestionClick={scrollToFullQuestion}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* ─── Mobile/Tablet: Inline content + questions per section ────── */}
          <div className="lg:hidden" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>{topics[0]?.name || 'Subject'}</h1>
            {topics.map((topic, tIdx) => (
              <div key={topic._id} style={{ marginBottom: '40px' }}>
                <div 
                  style={{
                    background: '#F5F3FF',
                    borderLeft: '4px solid #7C3AED',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                    {tIdx + 1}. {topic.name}
                  </h2>
                </div>

                {topic.subtopics?.map((sub, sIdx) => {
                  const sectionQuestions = sorted.filter(q => (q.taxonomy.subtopicId || q.taxonomy.topicId) === sub._id)
                  return (
                    <div key={sub._id} style={{ marginBottom: '40px' }}>
                      <ContentSection
                        sectionNumber={`${tIdx + 1}.${sIdx + 1}`}
                        subtopicName={sub.name}
                        subtopicSlug={sub.slug}
                        topicName={topic.name}
                        showKeyIdea={sIdx === 0}
                        showExample={true}
                        isFirst={tIdx === 0 && sIdx === 0}
                      />

                      {/* Questions from this section */}
                      {sectionQuestions.length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                          <p
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#9CA3AF',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: '12px',
                            }}
                          >
                            Questions from this section
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sectionQuestions.map((q, qi) => (
                              <FullQuestionCard key={q._id} question={q} index={qi} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 1023px) {
          .three-col-grid {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
