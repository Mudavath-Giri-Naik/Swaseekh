"use client"

import * as React from "react"

interface SubjectTopic {
  _id: string
  name: string
  slug: string
  questionCount?: number
  subtopics?: { _id: string; name: string; slug: string; questionCount?: number }[]
}

interface AllSubjectEntry {
  name: string
  slug: string
  questionCount?: number
  topics: SubjectTopic[]
}

interface SidebarContextValue {
  // TOC mode: when viewing a subject CCD
  subjectTopics: SubjectTopic[] | null
  subjectName: string | null
  subjectSlug: string | null
  subjectQuestionCount: number | null
  setSubjectData: (topics: SubjectTopic[], name: string, slug: string, count?: number) => void
  clearSubjectData: () => void

  // Active section tracking (from IntersectionObserver in ThreeColumnLayout)
  activeSectionId: string | null
  setActiveSectionId: (id: string | null) => void

  // Current concept name for breadcrumbs
  conceptName: string
  setConceptName: (name: string) => void

  // Questions mode state
  isQuestionsMode: boolean
  setIsQuestionsMode: (val: boolean) => void
  selectedTopicId: string | null
  setSelectedTopicId: (id: string | null) => void
  selectedSubtopicId: string | null
  setSelectedSubtopicId: (id: string | null) => void

  // All subjects mode (for /gate/questions with no specific subject)
  allSubjectsData: AllSubjectEntry[] | null
  setAllSubjectsData: (data: AllSubjectEntry[]) => void
  expandedSubjectSlug: string | null
  setExpandedSubjectSlug: (slug: string | null) => void
}

const SidebarCtx = React.createContext<SidebarContextValue | null>(null)

export function useSidebarData() {
  const ctx = React.useContext(SidebarCtx)
  if (!ctx) throw new Error("useSidebarData must be used within SidebarDataProvider")
  return ctx
}

export function SidebarDataProvider({ children }: { children: React.ReactNode }) {
  const [subjectTopics, setSubjectTopics] = React.useState<SubjectTopic[] | null>(null)
  const [subjectName, setSubjectName] = React.useState<string | null>(null)
  const [subjectSlug, setSubjectSlug] = React.useState<string | null>(null)
  const [subjectQuestionCount, setSubjectQuestionCount] = React.useState<number | null>(null)
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(null)
  const [conceptName, setConceptName] = React.useState("Overview")
  
  const [isQuestionsMode, setIsQuestionsMode] = React.useState(false)
  const [selectedTopicId, setSelectedTopicId] = React.useState<string | null>(null)
  const [selectedSubtopicId, setSelectedSubtopicId] = React.useState<string | null>(null)

  const [allSubjectsData, setAllSubjectsDataState] = React.useState<AllSubjectEntry[] | null>(null)
  const [expandedSubjectSlug, setExpandedSubjectSlug] = React.useState<string | null>(null)

  const setSubjectData = React.useCallback((topics: SubjectTopic[], name: string, slug: string, count?: number) => {
    setSubjectTopics(topics)
    setSubjectName(name)
    setSubjectSlug(slug)
    if (count !== undefined) setSubjectQuestionCount(count)
  }, [])

  const setAllSubjectsData = React.useCallback((data: AllSubjectEntry[]) => {
    setAllSubjectsDataState(data)
  }, [])

  const clearSubjectData = React.useCallback(() => {
    setSubjectTopics(null)
    setSubjectName(null)
    setSubjectSlug(null)
    setSubjectQuestionCount(null)
    setActiveSectionId(null)
    setConceptName("Overview")
    setIsQuestionsMode(false)
    setSelectedTopicId(null)
    setSelectedSubtopicId(null)
    setAllSubjectsDataState(null)
    setExpandedSubjectSlug(null)
  }, [])

  const value = React.useMemo<SidebarContextValue>(() => ({
    subjectTopics,
    subjectName,
    subjectSlug,
    subjectQuestionCount,
    setSubjectData,
    clearSubjectData,
    activeSectionId,
    setActiveSectionId,
    conceptName,
    setConceptName,
    isQuestionsMode,
    setIsQuestionsMode,
    selectedTopicId,
    setSelectedTopicId,
    selectedSubtopicId,
    setSelectedSubtopicId,
    allSubjectsData,
    setAllSubjectsData,
    expandedSubjectSlug,
    setExpandedSubjectSlug,
  }), [
    subjectTopics, subjectName, subjectSlug, subjectQuestionCount, setSubjectData, clearSubjectData, 
    activeSectionId, conceptName, isQuestionsMode, selectedTopicId, selectedSubtopicId,
    allSubjectsData, setAllSubjectsData, expandedSubjectSlug
  ])

  return <SidebarCtx.Provider value={value}>{children}</SidebarCtx.Provider>
}
