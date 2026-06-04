'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { CheckCircle2, Circle, Search, ChevronDown, FlaskConical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import FormulaBadge from "@/components/concept/FormulaBadge"

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
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [solvedStatuses, setSolvedStatuses] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedConcept, setSelectedConcept] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedFormula, setSelectedFormula] = useState('')

  // Formula name map — built from content API or derived from IDs
  const [formulaNameMap, setFormulaNameMap] = useState<Record<string, string>>({})
  // Richer info for hover-card previews ({ name, latex, plain } per ID)
  const [formulaInfoMap, setFormulaInfoMap] = useState<
    Record<string, { name?: string; latex?: string; plain?: string }>
  >({})

  // Unified sort state — tracks which column is active and the direction
  const [sort, setSort] = useState<{
    by: 'year' | 'marks' | 'difficulty'
    order: 'asc' | 'desc'
  }>({ by: 'year', order: 'desc' })

  const toggleSort = (col: 'year' | 'marks' | 'difficulty') => {
    setSort((prev) =>
      prev.by === col
        ? { by: col, order: prev.order === 'desc' ? 'asc' : 'desc' }
        : { by: col, order: 'desc' }
    )
  }

  // Difficulty rank for ordering: easy < medium < hard
  const difficultyRank: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  }

  // Read formula filter from URL search params (for deep-linking from concept page)
  useEffect(() => {
    const formulaParam = searchParams.get('formula')
    if (formulaParam) {
      setSelectedFormula(formulaParam)
    }
  }, [searchParams])

  // Set sidebar state
  useEffect(() => {
    sidebarData.setIsQuestionsMode(true)
    sidebarData.setConceptName('Questions')
    return () => {
      sidebarData.clearSubjectData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch all questions
  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams()
    qs.set('limit', '5000')

    fetch(`/api/questions?${qs.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        const qs = (data.questions ?? []) as Question[]
        // Ensure formulaIds is always an array
        qs.forEach((q) => {
          if (!Array.isArray(q.formulaIds)) q.formulaIds = []
          if (!q.formulaId) q.formulaId = null
        })
        setQuestions(qs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Build formula name map from all unique formula IDs across questions
  // Try to fetch names from the content API, fall back to humanized IDs
  useEffect(() => {
    if (questions.length === 0) return

    // Collect all unique formula IDs across questions
    const allIds = new Set<string>()
    questions.forEach((q) => {
      if (q.formulaId) allIds.add(q.formulaId)
      q.formulaIds?.forEach((id) => allIds.add(id))
    })

    if (allIds.size === 0) return

    // Fetch the single, app-wide formula info map. Cheaper + more reliable
    // than scanning per-concept content docs (the new schema doesn't carry
    // a conceptId on questions, so per-concept lookups would 404).
    fetch('/api/formulas/info')
      .then((res) => (res.ok ? res.json() : {}))
      .then((info: Record<string, { name?: string; latex?: string; plain?: string }>) => {
        const nameMap: Record<string, string> = {}
        Object.entries(info ?? {}).forEach(([id, v]) => {
          if (v?.name) nameMap[id] = v.name
        })
        // Fill any remaining IDs with humanized fallbacks
        allIds.forEach((id) => {
          if (!nameMap[id]) nameMap[id] = formulaIdToName(id)
        })
        setFormulaNameMap(nameMap)
        setFormulaInfoMap(info ?? {})
      })
      .catch(() => {})
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
    <div className="min-h-screen bg-background">
      {/* ─── Sticky page header: sidebar trigger + filter chips ─────────── */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur sm:h-12 sm:px-4 dark:border-transparent">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mr-1 h-4 shrink-0 bg-slate-200"
        />
        {/* Horizontally scrollable filter chip row */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterMenu
            label="Subject"
            value={selectedSubject}
            triggerClass={filterTriggerClass}
            options={[
              { value: '', label: 'All Subjects' },
              ...subjects.map((s) => ({ value: s.id, label: s.name })),
            ]}
            onChange={(val) => {
              setSelectedSubject(val)
              setSelectedTopic('')
              setSelectedConcept('')
            }}
          />
          <FilterMenu
            label="Topic"
            value={selectedTopic}
            triggerClass={filterTriggerClass}
            options={[
              { value: '', label: 'All Topics' },
              ...topics.map((t) => ({ value: t.id, label: t.name })),
            ]}
            onChange={(val) => {
              setSelectedTopic(val)
              setSelectedConcept('')
            }}
          />
          <FilterMenu
            label="Concept"
            value={selectedConcept}
            triggerClass={filterTriggerClass}
            options={[
              { value: '', label: 'All Concepts' },
              ...concepts.map((c) => ({ value: c.id, label: c.name })),
            ]}
            onChange={setSelectedConcept}
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
            onChange={setSelectedYear}
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
            label="Type"
            value={selectedType}
            triggerClass={filterTriggerClass}
            options={[
              { value: '', label: 'All Types' },
              { value: 'MCQ', label: 'MCQ' },
              { value: 'MSQ', label: 'MSQ' },
              { value: 'NAT', label: 'NAT' },
            ]}
            onChange={setSelectedType}
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
              onChange={setSelectedFormula}
            />
          )}
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            {filteredQuestions.length} result
            {filteredQuestions.length !== 1 ? 's' : ''}
          </InputGroupAddon>
        </InputGroup>

        {/* ─── Mobile card list (< md) ─────────────────────────────── */}
        <ul className="space-y-4 md:hidden">
          {filteredQuestions.length === 0 ? (
            <li className="rounded-2xl border bg-card px-4 py-16 text-center text-base text-muted-foreground">
              No questions found for this selection.
            </li>
          ) : (
            filteredQuestions.map((q, idx) => {
              const dColor = diffColors[q.difficulty] || diffColors.medium
              const questionUrl = `/gate/questions/${slugify(q.subjectName)}/${slugify(q.topicName)}/${slugify(q.conceptName)}/${q._id}`
              const isSolved = !!solvedStatuses[q._id]
              return (
                <li key={q._id}>
                  <Link
                    href={questionUrl}
                    className="group relative block w-full overflow-hidden rounded-2xl border bg-card px-4 py-5 transition-colors hover:border-foreground/20 active:bg-accent"
                  >
                    {/* Meta row: badges left, solved button right */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <span className="text-base font-extrabold text-slate-300 dark:text-slate-600">
                          #{idx + 1}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[15px] font-bold tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          GATE {q.year}
                        </span>
                        <span
                          className={`rounded-lg px-3 py-1.5 text-[15px] font-bold uppercase tracking-wide ${dColor.bg} ${dColor.text}`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="rounded-lg border px-3 py-1.5 text-[15px] font-bold uppercase tracking-wide text-slate-500">
                          {q.questionType}
                        </span>
                        <span className="text-[15px] font-semibold text-slate-500">
                          {q.marks}M
                        </span>
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

                    {/* Question preview */}
                    <div className="line-clamp-4 break-words text-[18px] leading-[1.8] text-foreground group-hover:text-[#4A235A] dark:group-hover:text-violet-300">
                      <MathRenderer text={q.questionText} />
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
        <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm dark:border-transparent dark:shadow-none md:block [&_tr]:border-border/50 dark:[&_tr]:border-white/[0.04] [&_thead_tr]:border-b-0 dark:[&_thead_tr]:border-b-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 dark:bg-white/[0.03] dark:hover:bg-white/[0.03]">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead className="min-w-[280px] max-w-[400px]">Question</TableHead>
                <SortableTableHead
                  label="Year"
                  active={sort.by === 'year'}
                  order={sort.order}
                  onClick={() => toggleSort('year')}
                />
                <SortableTableHead
                  label="Difficulty"
                  active={sort.by === 'difficulty'}
                  order={sort.order}
                  onClick={() => toggleSort('difficulty')}
                />
                <SortableTableHead
                  label="Marks"
                  active={sort.by === 'marks'}
                  order={sort.order}
                  onClick={() => toggleSort('marks')}
                />
                <TableHead>Type</TableHead>
                <TableHead>Formula</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Concept</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    No questions found for this selection.
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const dColor = diffColors[q.difficulty] || diffColors.medium
                  const questionUrl = `/gate/questions/${slugify(q.subjectName)}/${slugify(q.topicName)}/${slugify(q.conceptName)}/${q._id}`

                  return (
                    <TableRow
                      key={q._id}
                      className="cursor-pointer hover:bg-muted/60 dark:hover:bg-white/[0.045] group transition-colors"
                    >
                      <TableCell className="text-center text-muted-foreground font-medium">
                        {idx + 1}
                      </TableCell>

                      <TableCell>
                        <Link href={questionUrl} className="block">
                          <div className="line-clamp-1 max-w-[400px] text-foreground text-[14px] group-hover:text-[#4A235A] dark:group-hover:text-violet-300 transition-colors">
                            <MathRenderer text={q.questionText} />
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="text-muted-foreground font-medium whitespace-nowrap">
                        GATE {q.year}
                      </TableCell>

                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${dColor.bg} ${dColor.text}`}>
                          {q.difficulty}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground whitespace-nowrap">
                          {q.marks} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="rounded-md bg-muted/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground dark:bg-white/[0.06] dark:text-foreground/70">
                          {q.questionType}
                        </span>
                      </TableCell>

                      <TableCell>
                        {q.formulaIds && q.formulaIds.length > 0 ? (
                          <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
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
                                    e.stopPropagation()
                                    setSelectedFormula((prev) => prev === fId ? '' : fId)
                                  }}
                                />
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px]" title={q.subjectName}>
                          {q.subjectName}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px]" title={q.topicName}>
                          {q.topicName}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-muted-foreground truncate max-w-[140px]" title={q.conceptName}>
                          {q.conceptName}
                        </div>
                      </TableCell>

                    </TableRow>
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

/* ─── Sortable column header (used for Year / Marks / Difficulty) ──── */

function SortableTableHead({
  label,
  active,
  order,
  onClick,
}: {
  label: string
  active: boolean
  order: 'asc' | 'desc'
  onClick: () => void
}) {
  return (
    <TableHead
      onClick={onClick}
      className="group cursor-pointer select-none whitespace-nowrap hover:text-foreground"
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
