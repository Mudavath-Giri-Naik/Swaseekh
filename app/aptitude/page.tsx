'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSidebarData } from '@/components/sidebar-context'
import MathRenderer from '@/components/MathRenderer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, Search, ChevronDown, Bookmark, Zap, XCircle, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AptitudeQuestionViewer } from '@/components/aptitude/AptitudeQuestionViewer'
import React from 'react'
import { SlidersHorizontal } from "lucide-react"

interface SolutionStep {
  stepNumber: number
  explanation: string
  formula: string | null
  formulaExpression: string
  calculation: string
  result: string
}

interface Solution {
  steps: SolutionStep[]
  shortcut: string
  commonMistake: string
  timeToSolve: string
}

interface Question {
  _id: string
  questionId: string
  conceptSlug: string
  modelId: string
  questionText: string
  questionType: string
  options: string[] | null
  correctAnswer: string
  difficulty: string
  solution: Solution
  source: string
  sourceType: string
  sourcePage: string
  formulaIds: string[]
  tags: string[]
}

interface Concept {
  _id: string
  conceptId: string
  slug: string
  name: string
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Utility to strip math/markdown tags for plain text preview */
function stripTags(text: string) {
  if (!text) return ''
  return text.replace(/\$[^$]+\$/g, '(Math)').substring(0, 80) + (text.length > 80 ? '...' : '')
}

function formatModelId(id: string) {
  if (!id) return ''
  const match = id.match(/\d+$/)
  if (match) {
    const num = parseInt(match[0], 10)
    return `Model ${num.toString().padStart(2, '0')}`
  }
  return id.replace(/-/g, ' ')
}

const DIFFICULTY_STYLES: Record<string, { badgeClass: string, icon: React.ReactNode }> = {
  easy: { badgeClass: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 border-transparent', icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> },
  medium: { badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 border-transparent', icon: <Zap className="h-3.5 w-3.5 mr-1" /> },
  hard: { badgeClass: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 border-transparent', icon: <XCircle className="h-3.5 w-3.5 mr-1" /> },
}

const BADGE_COLORS = {
  concept: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border-transparent',
  model: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 border-transparent',
  source: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent',
}

const SOURCE_META: Record<string, string> = {
  rs_agarwal: 'R.S. Agarwal',
  indiabix: 'IndiaBix',
  ppt: 'Lecture',
}

export default function AptitudePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    }>
      <AptitudePageInner />
    </Suspense>
  )
}

function AptitudePageInner() {
  const sidebarData = useSidebarData()
  const searchParams = useSearchParams()
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Filters
  const [selectedConcept, setSelectedConcept] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedSource, setSelectedSource] = useState('')

  // Set sidebar state
  useEffect(() => {
    sidebarData.setIsQuestionsMode(true)
    sidebarData.setConceptName('Aptitude')
    return () => {
      sidebarData.clearSubjectData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch all questions & concepts
  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/aptitude/questions?limit=5000').then((res) => res.json()),
      fetch('/api/aptitude/concepts').then((res) => res.json())
    ])
      .then(([qData, cData]) => {
        setQuestions((qData.questions ?? []) as Question[])
        setConcepts((cData.concepts ?? []) as Concept[])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load aptitude data:", err)
        setLoading(false)
      })
  }, [])

  // Maps & Derived Options
  const conceptMap = useMemo(() => {
    const map: Record<string, string> = {}
    concepts.forEach(c => { map[c.slug] = c.name })
    return map
  }, [concepts])

  const conceptOptions = useMemo(() => {
    const set = new Set<string>()
    questions.forEach((q) => set.add(q.conceptSlug))
    return Array.from(set).map((slug) => ({
      value: slug,
      label: conceptMap[slug] || slug
    })).sort((a, b) => a.label.localeCompare(b.label))
  }, [questions, conceptMap])

  const modelOptions = useMemo(() => {
    const set = new Set<string>()
    questions
      .filter((q) => !selectedConcept || q.conceptSlug === selectedConcept)
      .forEach((q) => set.add(q.modelId))
    return Array.from(set).map((m) => ({ value: m, label: formatModelId(m) })).sort((a, b) => a.label.localeCompare(b.label))
  }, [questions, selectedConcept])

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedConcept && q.conceptSlug !== selectedConcept) return false
      if (selectedModel && q.modelId !== selectedModel) return false
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false
      if (selectedSource && q.source !== selectedSource) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !q.questionText.toLowerCase().includes(query) &&
          !(conceptMap[q.conceptSlug] || '').toLowerCase().includes(query)
        ) return false
      }
      return true
    })
  }, [questions, selectedConcept, selectedModel, selectedDifficulty, selectedSource, searchQuery, conceptMap])

  const toggleRow = (id: string, e: React.MouseEvent) => {
    setExpandedRows((prev) => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return prev.has(id) ? new Set() : new Set([id])
      }
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  // Filter chip styling
  const filterTriggerClass =
    'inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border bg-card px-3.5 text-[15px] font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 data-[state=open]:bg-accent data-[state=open]:text-foreground sm:h-8 sm:px-2.5 sm:text-sm dark:border-transparent dark:bg-white/[0.04] dark:hover:bg-white/[0.07] dark:data-[state=open]:bg-white/[0.07]'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-[100vw]">
      {/* Sticky page header with sidebar trigger and filters */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/90 px-3 backdrop-blur sm:h-12 sm:px-4 dark:border-transparent">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator orientation="vertical" className="mr-1 h-4 shrink-0 bg-slate-200" />
          
          {/* Mobile Title (shows when filters are hidden) */}
          <div className="md:hidden flex items-center gap-2 text-[15px] font-bold text-foreground/80 truncate">
            {conceptMap[selectedConcept] || 'All Concepts'}
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex min-w-0 flex-1 items-center gap-2">
            <FilterMenu
              label="Concept"
              value={selectedConcept}
              triggerClass={filterTriggerClass}
              options={[
                { value: '', label: 'All Concepts' },
                ...conceptOptions,
              ]}
              onChange={(val) => {
                setSelectedConcept(val)
                setSelectedModel('')
              }}
            />
            <FilterMenu
              label="Model"
              value={selectedModel}
              triggerClass={filterTriggerClass}
              options={[
                { value: '', label: 'All Models' },
                ...modelOptions,
              ]}
              onChange={setSelectedModel}
            />
            <FilterMenu
              label="Difficulty"
              value={selectedDifficulty}
              triggerClass={filterTriggerClass}
              options={[
                { value: '', label: 'All Difficulties' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              onChange={setSelectedDifficulty}
            />
            <FilterMenu
              label="Source"
              value={selectedSource}
              triggerClass={filterTriggerClass}
              options={[
                { value: '', label: 'All Sources' },
                { value: 'rs_agarwal', label: 'R.S. Agarwal' },
                { value: 'indiabix', label: 'IndiaBix' },
                { value: 'ppt', label: 'Lecture PPT' },
              ]}
              onChange={setSelectedSource}
            />
          </div>
        </div>

        {/* Mobile Filter Drawer Trigger */}
        <div className="md:hidden shrink-0 ml-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <SlidersHorizontal className="h-5 w-5" />
                {(selectedConcept || selectedModel || selectedDifficulty || selectedSource) ? (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Filters</DrawerTitle>
                <DrawerDescription>Narrow down the questions</DrawerDescription>
              </DrawerHeader>
              <div className="px-4 py-2 flex flex-col gap-4">
                <FilterMenu
                  label="Concept"
                  value={selectedConcept}
                  triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                  options={[
                    { value: '', label: 'All Concepts' },
                    ...conceptOptions,
                  ]}
                  onChange={(val) => {
                    setSelectedConcept(val)
                    setSelectedModel('')
                  }}
                />
                <FilterMenu
                  label="Model"
                  value={selectedModel}
                  triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                  options={[
                    { value: '', label: 'All Models' },
                    ...modelOptions,
                  ]}
                  onChange={setSelectedModel}
                />
                <FilterMenu
                  label="Difficulty"
                  value={selectedDifficulty}
                  triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                  options={[
                    { value: '', label: 'All Difficulties' },
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' },
                  ]}
                  onChange={setSelectedDifficulty}
                />
                <FilterMenu
                  label="Source"
                  value={selectedSource}
                  triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                  options={[
                    { value: '', label: 'All Sources' },
                    { value: 'rs_agarwal', label: 'R.S. Agarwal' },
                    { value: 'indiabix', label: 'IndiaBix' },
                    { value: 'ppt', label: 'Lecture PPT' },
                  ]}
                  onChange={setSelectedSource}
                />
              </div>
              <DrawerFooter className="pt-2">
                <DrawerClose asChild>
                  <Button className="w-full text-[15px] font-semibold h-12 rounded-xl">View {filteredQuestions.length} Results</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-2 py-3 sm:px-4 sm:py-6">
        <InputGroup className="mb-4 w-full sm:mb-5">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search aptitude questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            {filteredQuestions.length} result
            {filteredQuestions.length !== 1 ? 's' : ''}
          </InputGroupAddon>
        </InputGroup>

        {/* --- Mobile Card List (< md) --- */}
        <ul className="space-y-4 md:hidden">
          {filteredQuestions.length === 0 ? (
            <li className="rounded-2xl border bg-card px-4 py-16 text-center text-base text-muted-foreground">
              No questions found for this selection.
            </li>
          ) : (
            filteredQuestions.map((q, idx) => {
              const isExpanded = expandedRows.has(q.questionId)
              const diffStyle = DIFFICULTY_STYLES[q.difficulty] || { badgeClass: 'bg-muted text-muted-foreground border-transparent', icon: <Bookmark className="h-3.5 w-3.5 mr-1" /> }
              const conceptName = conceptMap[q.conceptSlug] || q.conceptSlug

              return (
                <li key={q.questionId} className="flex flex-col">
                  <div
                    onClick={(e) => toggleRow(q.questionId, e)}
                    className={`group relative block w-full overflow-hidden rounded-2xl border px-4 py-5 transition-colors hover:border-foreground/20 active:bg-accent cursor-pointer ${isExpanded ? 'bg-muted/5 border-foreground/20 rounded-b-none border-b-0 shadow-sm' : 'bg-card shadow-sm'}`}
                  >
                    {/* Question First, Bold and Black */}
                    <div className="mb-4 text-[18px] font-semibold leading-relaxed text-slate-900 dark:text-slate-100 group-hover:text-[#4A235A] dark:group-hover:text-violet-300">
                      <MathRenderer text={q.questionText} />
                    </div>

                    {/* Tags Below Question */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-transparent shadow-none hover:bg-slate-200">
                        #{idx + 1}
                      </Badge>
                      <Badge className={`${BADGE_COLORS.concept} shadow-none`}>
                        {conceptName}
                      </Badge>
                      <Badge className={`${diffStyle.badgeClass} shadow-none flex items-center uppercase tracking-wide`}>
                        {diffStyle.icon}
                        {q.difficulty}
                      </Badge>
                      <Badge className={`${BADGE_COLORS.model} shadow-none font-bold tracking-wide`}>
                        {formatModelId(q.modelId)}
                      </Badge>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="rounded-b-2xl border border-t-0 border-border/60 bg-card sm:p-6 animation-fade-in shadow-sm">
                      <AptitudeQuestionViewer question={q} index={idx + 1} hideHeader hideQuestionText />
                    </div>
                  )}
                </li>
              )
            })
          )}
        </ul>

        {/* --- Desktop Table (md+) --- */}
        <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm dark:border-transparent dark:shadow-none md:block [&_tr]:border-border/50 dark:[&_tr]:border-white/[0.04] [&_thead_tr]:border-b-0 dark:[&_thead_tr]:border-b-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 dark:bg-white/[0.03] dark:hover:bg-white/[0.03]">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="min-w-[280px] max-w-[400px]">Question</TableHead>
                  <TableHead>Concept</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      No questions found for this selection.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuestions.map((q, idx) => {
                    const isExpanded = expandedRows.has(q.questionId)
                    const diffStyle = DIFFICULTY_STYLES[q.difficulty] || { badgeClass: 'bg-muted text-muted-foreground border-transparent', icon: <Bookmark className="h-3.5 w-3.5 mr-1" /> }
                    const conceptName = conceptMap[q.conceptSlug] || q.conceptSlug

                    return (
                      <React.Fragment key={q.questionId}>
                        <TableRow
                          className={`cursor-pointer group transition-colors ${isExpanded ? 'bg-muted/20 dark:bg-white/[0.08]' : 'hover:bg-muted/60 dark:hover:bg-white/[0.045]'}`}
                          onClick={(e) => toggleRow(q.questionId, e)}
                        >
                          <TableCell className="text-center text-muted-foreground font-medium text-xs">
                            {idx + 1}
                          </TableCell>

                          <TableCell>
                            <div className="line-clamp-1 max-w-[400px] text-slate-900 font-medium dark:text-slate-100 text-[14px] group-hover:text-[#4A235A] dark:group-hover:text-violet-300 transition-colors">
                              {stripTags(q.questionText)}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className={`${BADGE_COLORS.concept} shadow-none truncate max-w-[140px] font-medium`}>
                              {conceptName}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge className={`${BADGE_COLORS.model} shadow-none font-bold tracking-wide`}>
                              {formatModelId(q.modelId)}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge className={`${diffStyle.badgeClass} shadow-none flex items-center uppercase tracking-wide font-bold w-fit`}>
                              {diffStyle.icon}
                              {q.difficulty}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                              <FileText className="h-3.5 w-3.5" />
                              <span>{SOURCE_META[q.source] || q.source}</span>
                            </div>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow className="border-b border-border/60 bg-muted/5 dark:bg-white/[0.02] hover:bg-muted/5 dark:hover:bg-white/[0.02]">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 sm:p-6 animation-fade-in" onClick={(e) => e.stopPropagation()}>
                                <AptitudeQuestionViewer question={q} index={idx + 1} />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterMenu({
  label,
  value,
  options,
  onChange,
  triggerClass,
  icon,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  triggerClass: string
  icon?: React.ReactNode
}) {
  const current = options.find((o) => o.value === value) ?? options[0]
  const isFiltered = value !== ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClass}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span className={isFiltered ? 'font-semibold text-slate-900 dark:text-slate-100' : ''}>
          {current?.label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-72 min-w-[12rem] overflow-y-auto">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value || '__all'} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
