'use client'

import { useEffect, useState, useMemo, Suspense, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSidebarData } from '@/components/sidebar-context'
import MathRenderer from '@/components/MathRenderer'
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, Circle, Search, ChevronDown, FlaskConical, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react"
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
import FormulaBadge from "@/components/concept/FormulaBadge"
import { useInView } from "react-intersection-observer"

interface Question {
  _id: string
  questionText: string
  questionType: string
  correctAnswer: string
  marks: number
  difficulty: string
  year: number
  formulaId: string | null
  formulaIds: string[]
  // Resolved display names (flattened from meta.* by the API enricher)
  subjectName: string
  topicName: string
  conceptName: string
}

/** Minimal formula metadata we derive from the questions data */
interface FormulaInfo {
  formulaId: string
  name: string
}

import { globalCache } from '@/lib/global-cache'

const ITEMS_PER_PAGE = 20

// Helpers
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Turn a formulaId like "r-combination-no-rep" into a readable name */
function formulaIdToName(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Soft difficulty chips that read well in both light + dark. */
const diffColors: Record<string, { bg: string; text: string; border: string }> = {
  easy:   { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/20' },
  Easy:   { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/20' },
  medium: { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-300',     border: 'border-amber-200 dark:border-amber-500/20' },
  Medium: { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-300',     border: 'border-amber-200 dark:border-amber-500/20' },
  hard:   { bg: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-700 dark:text-rose-300',       border: 'border-rose-200 dark:border-rose-500/20' },
  Hard:   { bg: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-700 dark:text-rose-300',       border: 'border-rose-200 dark:border-rose-500/20' },
}

const typeColors: Record<string, { bg: string; text: string }> = {
  MCQ: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300' },
  MSQ: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-300' },
  NAT: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', text: 'text-fuchsia-700 dark:text-fuchsia-300' },
}

const marksColors: Record<number, { bg: string; text: string }> = {
  1: { bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-700 dark:text-sky-300' },
  2: { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300' },
}

export default function QuestionsListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    }>
      <QuestionsListPageInner />
    </Suspense>
  )
}

function QuestionsListPageInner() {
  const sidebarData = useSidebarData()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const getInitialQuestions = useCallback(() => {
    const raw = globalCache.data.gateQuestions?.questions ?? [];
    const qs = [...raw] as Question[]
    qs.forEach((q) => {
      if (!Array.isArray(q.formulaIds)) q.formulaIds = []
      if (!q.formulaId) q.formulaId = null
    })
    return qs
  }, [])

  const [questions, setQuestions] = useState<Question[]>(() => getInitialQuestions())
  const [loading, setLoading] = useState(!globalCache.data.gateQuestions)
  const [solvedStatuses, setSolvedStatuses] = useState<Record<string, boolean>>({})

  // ─── Read initial state from URL search params ──────────────────────
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '')
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') ?? '')
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') ?? '')
  const [selectedConcept, setSelectedConcept] = useState(searchParams.get('concept') ?? '')
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') ?? '')
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') ?? '')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') ?? '')
  const [selectedFormula, setSelectedFormula] = useState(searchParams.get('formula') ?? '')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  // Unified sort state
  const [sort, setSort] = useState<{
    by: 'year' | 'marks' | 'difficulty'
    order: 'asc' | 'desc'
  }>({
    by: (searchParams.get('sortBy') as 'year' | 'marks' | 'difficulty') || 'year',
    order: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  })

  // Formula name map — built from content API or derived from IDs
  const [formulaNameMap, setFormulaNameMap] = useState<Record<string, string>>({})
  // Richer info for hover-card previews ({ name, latex, plain } per ID)
  const [formulaInfoMap, setFormulaInfoMap] = useState<
    Record<string, { name?: string; latex?: string; plain?: string }>
  >({})

  // ─── Track if this is the initial mount (skip URL sync on first render) ─
  const isInitialMount = useRef(true)

  // ─── Sync state to URL search params ────────────────────────────────
  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (selectedSubject) params.set('subject', selectedSubject)
    if (selectedTopic) params.set('topic', selectedTopic)
    if (selectedConcept) params.set('concept', selectedConcept)
    if (selectedYear) params.set('year', selectedYear)
    if (selectedDifficulty) params.set('difficulty', selectedDifficulty)
    if (selectedType) params.set('type', selectedType)
    if (selectedFormula) params.set('formula', selectedFormula)
    if (searchQuery) params.set('search', searchQuery)
    if (sort.by !== 'year') params.set('sortBy', sort.by)
    if (sort.order !== 'desc') params.set('sortOrder', sort.order)

    const qs = params.toString()
    const newUrl = qs ? `/gate/questions?${qs}` : '/gate/questions'
    router.replace(newUrl, { scroll: false })
  }, [selectedSubject, selectedTopic, selectedConcept, selectedYear, selectedDifficulty, selectedType, selectedFormula, searchQuery, sort, router])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    syncToUrl()
  }, [syncToUrl])

  const toggleSort = (col: 'year' | 'marks' | 'difficulty') => {
    setSort((prev) =>
      prev.by === col
        ? { by: col, order: prev.order === 'desc' ? 'asc' : 'desc' }
        : { by: col, order: 'desc' }
    )
    setVisibleCount(ITEMS_PER_PAGE)
  }

  // Difficulty rank for ordering: easy < medium < hard
  const difficultyRank: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  }

  // Set sidebar state
  useEffect(() => {
    sidebarData.setIsQuestionsMode(true)
    sidebarData.setConceptName('Questions')
    return () => {
      sidebarData.clearSubjectData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch all questions (use cache if available)
  useEffect(() => {
    const unsubscribe = globalCache.subscribe(() => {
      if (globalCache.data.gateQuestions) {
        setQuestions(getInitialQuestions())
        setLoading(false)
      }
    })

    if (globalCache.data.gateQuestions) {
      setQuestions(getInitialQuestions())
      setLoading(false)
      return unsubscribe
    }

    setLoading(true)
    const qs = new URLSearchParams()
    qs.set('limit', '5000')

    fetch(`/api/questions?${qs.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        globalCache.data.gateQuestions = data
        setQuestions(getInitialQuestions())
        setLoading(false)
      })
      .catch(() => setLoading(false))

    return unsubscribe
  }, [getInitialQuestions])

  // Build formula name map from all unique formula IDs across questions
  useEffect(() => {
    if (questions.length === 0) return

    const buildMaps = (info: any) => {
      const allIds = new Set<string>()
      questions.forEach((q) => {
        if (q.formulaId) allIds.add(q.formulaId)
        q.formulaIds?.forEach((id) => allIds.add(id))
      })

      if (allIds.size === 0) return

      const nameMap: Record<string, string> = {}
      Object.entries(info ?? {}).forEach(([id, v]: [string, any]) => {
        if (v?.name) nameMap[id] = v.name
      })
      // Fill any remaining IDs with humanized fallbacks
      allIds.forEach((id) => {
        if (!nameMap[id]) nameMap[id] = formulaIdToName(id)
      })
      setFormulaNameMap(nameMap)
      setFormulaInfoMap(info ?? {})
    }

    if (globalCache.data.gateFormulaInfoMap) {
      buildMaps(globalCache.data.gateFormulaInfoMap)
    }

    const unsubscribe = globalCache.subscribe(() => {
      if (globalCache.data.gateFormulaInfoMap) {
        buildMaps(globalCache.data.gateFormulaInfoMap)
      }
    })

    if (!globalCache.data.gateFormulaInfoMap) {
      fetch('/api/formulas/info')
        .then((res) => (res.ok ? res.json() : {}))
        .then((info) => {
          globalCache.data.gateFormulaInfoMap = info
          buildMaps(info)
        })
        .catch(() => {})
    }

    return unsubscribe
  }, [questions])

  // Derived filter options
  const subjects = useMemo(() => {
    const map = new Map<string, string>()
    questions.forEach((q) => map.set(q.subjectName, q.subjectName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [questions])

  const topics = useMemo(() => {
    const map = new Map<string, string>()
    questions
      .filter((q) => !selectedSubject || q.subjectName === selectedSubject)
      .forEach((q) => map.set(q.topicName, q.topicName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [questions, selectedSubject])

  // Concepts cascade from subject + topic
  const concepts = useMemo(() => {
    const map = new Map<string, string>()
    questions
      .filter((q) => !selectedSubject || q.subjectName === selectedSubject)
      .filter((q) => !selectedTopic || q.topicName === selectedTopic)
      .forEach((q) => map.set(q.conceptName, q.conceptName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [questions, selectedSubject, selectedTopic])

  const years = useMemo(() => {
    const set = new Set<number>()
    questions.forEach((q) => set.add(q.year))
    return Array.from(set).sort((a, b) => b - a)
  }, [questions])

  // Unique formulas present across all questions
  const formulaOptions = useMemo((): FormulaInfo[] => {
    const map = new Map<string, string>()
    questions.forEach((q) => {
      q.formulaIds?.forEach((fId) => {
        if (!map.has(fId)) {
          map.set(fId, formulaNameMap[fId] || formulaIdToName(fId))
        }
      })
    })
    return Array.from(map.entries())
      .map(([id, name]) => ({ formulaId: id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [questions, formulaNameMap])

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        if (selectedSubject && q.subjectName !== selectedSubject) return false
        if (selectedTopic && q.topicName !== selectedTopic) return false
        if (selectedConcept && q.conceptName !== selectedConcept) return false
        if (selectedYear && q.year !== Number(selectedYear)) return false
        if (selectedDifficulty && q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false
        if (selectedType && q.questionType !== selectedType) return false
        if (selectedFormula && !(q.formulaIds ?? []).includes(selectedFormula)) return false
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          if (
            !q.questionText.toLowerCase().includes(query) &&
            !q.subjectName.toLowerCase().includes(query) &&
            !q.topicName.toLowerCase().includes(query) &&
            !q.conceptName.toLowerCase().includes(query)
          ) return false
        }
        return true
      })
      .sort((a, b) => {
        const dir = sort.order === 'desc' ? -1 : 1
        if (sort.by === 'year') return dir * (a.year - b.year)
        if (sort.by === 'marks') return dir * (a.marks - b.marks)
        if (sort.by === 'difficulty') {
          return (
            dir *
            ((difficultyRank[a.difficulty.toLowerCase()] || 0) -
              (difficultyRank[b.difficulty.toLowerCase()] || 0))
          )
        }
        return 0
      })
  }, [questions, selectedSubject, selectedTopic, selectedConcept, selectedYear, selectedDifficulty, selectedType, selectedFormula, searchQuery, sort])

  // ─── Infinite Scroll ────────────────────────────────────────────────
  const { ref: loadMoreRef, inView } = useInView({ rootMargin: '400px' })

  useEffect(() => {
    if (inView) {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredQuestions.length))
    }
  }, [inView, filteredQuestions.length])

  // Reset visibleCount if filters change and reduce the total below current visibleCount
  useEffect(() => {
    if (visibleCount > filteredQuestions.length && filteredQuestions.length > 0) {
      setVisibleCount(Math.max(ITEMS_PER_PAGE, filteredQuestions.length))
    }
  }, [visibleCount, filteredQuestions.length])

  const paginatedQuestions = useMemo(() => {
    return filteredQuestions.slice(0, visibleCount)
  }, [filteredQuestions, visibleCount])

  // ─── Filter change helpers (reset visibleCount) ──────────────────────
  const handleSubjectChange = useCallback((val: string) => {
    setSelectedSubject(val)
    setSelectedTopic('')
    setSelectedConcept('')
    setVisibleCount(ITEMS_PER_PAGE)
  }, [])
  const handleTopicChange = useCallback((val: string) => {
    setSelectedTopic(val)
    setSelectedConcept('')
    setVisibleCount(ITEMS_PER_PAGE)
  }, [])
  const handleConceptChange = useCallback((val: string) => { setSelectedConcept(val); setVisibleCount(ITEMS_PER_PAGE) }, [])
  const handleYearChange = useCallback((val: string) => { setSelectedYear(val); setVisibleCount(ITEMS_PER_PAGE) }, [])
  const handleDifficultyChange = useCallback((val: string) => { setSelectedDifficulty(val); setVisibleCount(ITEMS_PER_PAGE) }, [])
  const handleTypeChange = useCallback((val: string) => { setSelectedType(val); setVisibleCount(ITEMS_PER_PAGE) }, [])
  const handleFormulaChange = useCallback((val: string) => { setSelectedFormula(val); setVisibleCount(ITEMS_PER_PAGE) }, [])
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setVisibleCount(ITEMS_PER_PAGE)
  }, [])

  // Filter trigger style — compact pill that opens the DropdownMenu.
  // In dark mode we drop the border entirely (any border reads as a
  // white line on the deep-blue body) and rely on a soft bg tint for
  // shape.
  const filterTriggerClass =
    'inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border bg-card px-3.5 text-[15px] font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 data-[state=open]:bg-accent data-[state=open]:text-foreground sm:h-8 sm:px-2.5 sm:text-sm dark:border-transparent dark:bg-white/[0.04] dark:hover:bg-white/[0.07] dark:data-[state=open]:bg-white/[0.07]'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full max-w-[100vw]">
      {/* ─── Sticky page header: sidebar trigger + filter chips ─────────── */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/90 px-3 backdrop-blur sm:h-12 sm:px-4 dark:border-transparent">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator
            orientation="vertical"
            className="mr-1 h-4 shrink-0 bg-slate-200"
          />
          
          {/* Mobile Title */}
          <div className="md:hidden flex items-center gap-2 text-[15px] font-bold text-foreground/80 truncate">
            {selectedSubject ? selectedSubject : 'All Questions'}
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterMenu
              label="Subject"
              value={selectedSubject}
              triggerClass={filterTriggerClass}
              options={[
                { value: '', label: 'All Subjects' },
                ...subjects.map((s) => ({ value: s.id, label: s.name })),
              ]}
              onChange={handleSubjectChange}
            />
            <FilterMenu
              label="Topic"
              value={selectedTopic}
              triggerClass={filterTriggerClass}
              options={[
                { value: '', label: 'All Topics' },
                ...topics.map((t) => ({ value: t.id, label: t.name })),
              ]}
              onChange={handleTopicChange}
            />
            <FilterMenu
              label="Concept"
              value={selectedConcept}
              triggerClass={filterTriggerClass}
              options={[
                { value: '', label: 'All Concepts' },
                ...concepts.map((c) => ({ value: c.id, label: c.name })),
              ]}
              onChange={handleConceptChange}
            />
            <FilterMenu
              label="Year"
              value={selectedYear}
              triggerClass={filterTriggerClass}
              options={[
                { value: '', label: 'All Years' },
                ...years.map((y) => ({
                  value: String(y),
                  label: `GATE ${y}`,
                })),
              ]}
              onChange={handleYearChange}
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
              onChange={handleDifficultyChange}
            />
            <FilterMenu
              label="Type"
              value={selectedType}
              triggerClass={filterTriggerClass}
              options={[
                { value: '', label: 'All Types' },
                { value: 'MCQ', label: 'MCQ' },
                { value: 'MSQ', label: 'MSQ' },
                { value: 'NAT', label: 'NAT' },
              ]}
              onChange={handleTypeChange}
            />
            {formulaOptions.length > 0 && (
              <FilterMenu
                label="Formula"
                value={selectedFormula}
                triggerClass={filterTriggerClass}
                icon={<FlaskConical className="h-3.5 w-3.5 text-violet-500" />}
                options={[
                  { value: '', label: 'All Formulas' },
                  ...formulaOptions.map((f) => ({
                    value: f.formulaId,
                    label: f.name,
                  })),
                ]}
                onChange={handleFormulaChange}
              />
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer Trigger */}
        <div className="md:hidden shrink-0 ml-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                <SlidersHorizontal className="h-5 w-5" />
                {(selectedSubject || selectedTopic || selectedConcept || selectedYear || selectedDifficulty || selectedType || selectedFormula) ? (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Filters</DrawerTitle>
                <DrawerDescription>Narrow down the questions</DrawerDescription>
              </DrawerHeader>
              <div className="px-4 py-2 flex flex-col gap-4 overflow-y-auto max-h-[55vh]">
                <FilterMenu
                  label="Subject"
                  value={selectedSubject}
                  triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                  options={[
                    { value: '', label: 'All Subjects' },
                    ...subjects.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  onChange={handleSubjectChange}
                />
                <FilterMenu
                  label="Topic"
                  value={selectedTopic}
                  triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                  options={[
                    { value: '', label: 'All Topics' },
                    ...topics.map((t) => ({ value: t.id, label: t.name })),
                  ]}
                  onChange={handleTopicChange}
                />
                <FilterMenu
                  label="Concept"
                  value={selectedConcept}
                  triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                  options={[
                    { value: '', label: 'All Concepts' },
                    ...concepts.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  onChange={handleConceptChange}
                />
                <FilterMenu
                  label="Year"
                  value={selectedYear}
                  triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                  options={[
                    { value: '', label: 'All Years' },
                    ...years.map((y) => ({
                      value: String(y),
                      label: `GATE ${y}`,
                    })),
                  ]}
                  onChange={handleYearChange}
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
                  onChange={handleDifficultyChange}
                />
                <FilterMenu
                  label="Type"
                  value={selectedType}
                  triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'MCQ', label: 'MCQ' },
                    { value: 'MSQ', label: 'MSQ' },
                    { value: 'NAT', label: 'NAT' },
                  ]}
                  onChange={handleTypeChange}
                />
                {formulaOptions.length > 0 && (
                  <FilterMenu
                    label="Formula"
                    value={selectedFormula}
                    triggerClass={`${filterTriggerClass} w-full justify-between h-12 text-base`}
                    icon={<FlaskConical className="h-4 w-4 text-violet-500" />}
                    options={[
                      { value: '', label: 'All Formulas' },
                      ...formulaOptions.map((f) => ({
                        value: f.formulaId,
                        label: f.name,
                      })),
                    ]}
                    onChange={handleFormulaChange}
                  />
                )}
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
        {/* ─── Search bar — stays in its original position, full width ── */}
        <InputGroup className="mb-4 w-full sm:mb-5">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <InputGroupAddon align="inline-end">
            {filteredQuestions.length} result
            {filteredQuestions.length !== 1 ? 's' : ''}
          </InputGroupAddon>
        </InputGroup>

        {/* ─── Mobile card list (< md) ─────────────────────────────── */}
        <ul className="space-y-4 md:hidden">
          {paginatedQuestions.length === 0 ? (
            <li className="rounded-2xl border bg-card px-4 py-16 text-center text-base text-muted-foreground">
              No questions found for this selection.
            </li>
          ) : (
            paginatedQuestions.map((q, idx) => {
              const dColor = diffColors[q.difficulty] || diffColors.medium
              const tColor = typeColors[q.questionType] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' }
              const mColor = marksColors[q.marks] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' }
              const questionUrl = `/gate/questions/${slugify(q.subjectName)}/${slugify(q.topicName)}/${slugify(q.conceptName)}/${q._id}`
              const isSolved = !!solvedStatuses[q._id]
              const globalIdx = idx
              return (
                <li key={q._id}>
                  <Link
                    href={questionUrl}
                    className="group relative block w-full overflow-hidden rounded-2xl border bg-card px-4 py-5 transition-colors hover:border-foreground/20 active:bg-accent"
                  >
                    {/* Question + Meta row swap */}
                    <div className="flex items-start justify-between gap-3">
                      {/* Question preview */}
                      <div className="mb-4 line-clamp-4 break-words text-[18px] font-semibold leading-relaxed text-slate-900 dark:text-slate-100 group-hover:text-[#4A235A] dark:group-hover:text-violet-300">
                        <MathRenderer text={q.questionText} />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSolvedStatuses((prev) => ({
                            ...prev,
                            [q._id]: !prev[q._id],
                          }))
                        }}
                        className="shrink-0"
                        aria-label={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                      >
                        {isSolved ? (
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        ) : (
                          <Circle className="h-8 w-8 text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[13px] font-bold tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        #{globalIdx + 1}
                      </span>
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[13px] font-bold tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        GATE {q.year}
                      </span>
                      <span className={`rounded-lg px-3 py-1.5 text-[13px] font-bold uppercase tracking-wide border-transparent flex items-center ${dColor.bg} ${dColor.text}`}>
                        {q.difficulty}
                      </span>
                      <span className={`rounded-lg px-3 py-1.5 text-[13px] font-bold uppercase tracking-wide border-transparent ${tColor.bg} ${tColor.text}`}>
                        {q.questionType}
                      </span>
                      <span className={`rounded-lg px-3 py-1.5 text-[13px] font-bold tracking-wide border-transparent ${mColor.bg} ${mColor.text}`}>
                        {q.marks}M
                      </span>
                    </div>

                    {/* Formula badges */}
                    {q.formulaIds && q.formulaIds.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {q.formulaIds.map((fId) => {
                          const fName = formulaNameMap[fId] || formulaIdToName(fId)
                          return (
                            <FormulaBadge
                              key={fId}
                              formulaId={fId}
                              name={fName}
                              info={formulaInfoMap[fId]}
                              primary={fId === q.formulaId}
                              selected={selectedFormula === fId}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setSelectedFormula((prev) => prev === fId ? '' : fId)
                                setVisibleCount(ITEMS_PER_PAGE)
                              }}
                            />
                          )
                        })}
                      </div>
                    )}

                    {/* Breadcrumb */}
                    <div className="mt-4 border-t border-border/60 pt-4">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {q.subjectName}
                        </span>
                        <span className="text-slate-300">›</span>
                        <span className="text-slate-500">{q.topicName}</span>
                        <span className="text-slate-300">›</span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {q.conceptName}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })
          )}
        </ul>

        {/* ─── Desktop table (md+) ─────────────────────────────────── */}
        <div className="hidden rounded-xl border bg-card shadow-sm dark:border-transparent dark:shadow-none md:block [&_tr]:border-border/50 dark:[&_tr]:border-white/[0.04] [&_thead_tr]:border-b-0 dark:[&_thead_tr]:border-b-0 w-full overflow-hidden">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 dark:bg-white/[0.03] dark:hover:bg-white/[0.03]">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead className="w-[200px]">Question</TableHead>
                <SortableTableHead
                  label="Year"
                  active={sort.by === 'year'}
                  order={sort.order}
                  onClick={() => toggleSort('year')}
                  className="w-[70px]"
                />
                <SortableTableHead
                  label="Difficulty"
                  active={sort.by === 'difficulty'}
                  order={sort.order}
                  onClick={() => toggleSort('difficulty')}
                  className="w-[85px]"
                />
                <SortableTableHead
                  label="Marks"
                  active={sort.by === 'marks'}
                  order={sort.order}
                  onClick={() => toggleSort('marks')}
                  className="w-[70px]"
                />
                <TableHead className="w-[60px]">Type</TableHead>
                <TableHead className="w-[80px]">Subject</TableHead>
                <TableHead className="w-[100px]">Topic</TableHead>
                <TableHead className="w-[120px]">Concept</TableHead>
                <TableHead className="w-[120px]">Formula</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    No questions found for this selection.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedQuestions.map((q, idx) => {
                  const dColor = diffColors[q.difficulty] || diffColors.medium
                  const tColor = typeColors[q.questionType] || { bg: 'bg-muted/70 dark:bg-white/[0.06]', text: 'text-muted-foreground dark:text-foreground/70' }
                  const mColor = marksColors[q.marks] || { bg: 'bg-muted', text: 'text-muted-foreground' }
                  const questionUrl = `/gate/questions/${slugify(q.subjectName)}/${slugify(q.topicName)}/${slugify(q.conceptName)}/${q._id}`
                  const globalIdx = idx

                  return (
                    <TableRow
                      key={q._id}
                      className="cursor-pointer hover:bg-muted/60 dark:hover:bg-white/[0.045] group transition-colors"
                    >
                      <TableCell className="text-center text-muted-foreground font-medium">
                        {globalIdx + 1}
                      </TableCell>

                      <TableCell>
                        <Link href={questionUrl} className="block w-full">
                          <div className="line-clamp-1 w-full text-foreground text-[14px] group-hover:text-[#4A235A] dark:group-hover:text-violet-300 transition-colors">
                            <MathRenderer text={q.questionText} />
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="text-muted-foreground font-medium whitespace-nowrap text-xs">
                        GATE {q.year}
                      </TableCell>

                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${dColor.bg} ${dColor.text}`}>
                          {q.difficulty}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md whitespace-nowrap ${mColor.bg} ${mColor.text}`}>
                          {q.marks}M
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tColor.bg} ${tColor.text}`}>
                          {q.questionType}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground truncate w-full" title={q.subjectName}>
                          {q.subjectName}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground truncate w-full" title={q.topicName}>
                          {q.topicName}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground truncate w-full" title={q.conceptName}>
                          {q.conceptName}
                        </div>
                      </TableCell>

                      <TableCell>
                        {q.formulaIds && q.formulaIds.length > 0 ? (
                          <div className="flex flex-nowrap items-center gap-1 whitespace-nowrap w-full overflow-hidden">
                            {(() => {
                              const primaryId = q.formulaId || q.formulaIds[0]
                              const fName = formulaNameMap[primaryId] || formulaIdToName(primaryId)
                              const remaining = q.formulaIds.length - 1
                              return (
                                <>
                                  <div className="flex-1 min-w-0">
                                    <FormulaBadge
                                      formulaId={primaryId}
                                      name={fName}
                                      info={formulaInfoMap[primaryId]}
                                      primary={primaryId === q.formulaId}
                                      selected={selectedFormula === primaryId}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedFormula((prev) => prev === primaryId ? '' : primaryId)
                                        setVisibleCount(ITEMS_PER_PAGE)
                                      }}
                                    />
                                  </div>
                                  {remaining > 0 && (
                                    <Badge variant="secondary" className="px-1 text-[10px] font-bold shrink-0">
                                      +{remaining}
                                    </Badge>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>

                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ─── Infinite Scroll Sentinel ──────────────────────────────── */}
        {visibleCount < filteredQuestions.length && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}
        {visibleCount >= filteredQuestions.length && filteredQuestions.length > 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            You have reached the end of the list.
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Sortable column header (used for Year / Marks / Difficulty) ──── */

function SortableTableHead({
  label,
  active,
  order,
  onClick,
  className,
}: {
  label: string
  active: boolean
  order: 'asc' | 'desc'
  onClick: () => void
  className?: string
}) {
  return (
    <TableHead
      onClick={onClick}
      className={`group cursor-pointer select-none whitespace-nowrap hover:text-foreground ${className ?? ''}`}
    >
      {label}{' '}
      <span
        className={
          active
            ? 'text-foreground/80'
            : 'text-muted-foreground/50 group-hover:text-muted-foreground'
        }
      >
        {active ? (order === 'desc' ? '↓' : '↑') : '↕'}
      </span>
    </TableHead>
  )
}

/* ─── FilterMenu — pill trigger + radio dropdown for one filter ─────── */

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
        <span className={isFiltered ? 'font-semibold text-slate-900' : ''}>
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
