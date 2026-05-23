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
import { formulaBadgePalette } from "@/lib/formula-palette"

interface Question {
  _id: string
  questionText: string
  questionType: string
  options: string[]
  correctAnswer: string
  explanation: string
  marks: number
  difficulty: string
  year: number
  subjectId: string
  topicId: string
  conceptId: string
  angle: string
  cognitiveOperation: string
  depthLevel: string
  distractorStrategy: string | null
  keyConstraint: string | null
  statementStructure: string
  trap: string
  formulaId: string | null
  formulaIds: string[]
  simpleExplanation: string | null
  // Resolved names
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

const diffColors: Record<string, { bg: string; text: string; border: string }> = {
  easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  Easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  hard: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  Hard: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
}

export default function QuestionsListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#4A235A] rounded-full animate-spin" />
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

    // Collect all unique formula IDs
    const allIds = new Set<string>()
    questions.forEach((q) => {
      if (q.formulaId) allIds.add(q.formulaId)
      q.formulaIds?.forEach((id) => allIds.add(id))
    })

    if (allIds.size === 0) return

    // Collect unique concept IDs that have formulas
    const conceptsWithFormulas = new Set<string>()
    questions.forEach((q) => {
      if (q.formulaIds?.length > 0 || q.formulaId) {
        conceptsWithFormulas.add(q.conceptId)
      }
    })

    // Fetch content for each concept to get formula names
    const fetchPromises = Array.from(conceptsWithFormulas).map((cId) =>
      fetch(`/api/content/${encodeURIComponent(cId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    )

    Promise.all(fetchPromises).then((results) => {
      const nameMap: Record<string, string> = {}

      results.forEach((data) => {
        if (!data?.content?.groups) return
        for (const group of data.content.groups) {
          for (const f of group.formulas ?? []) {
            if (f.formulaId && f.name) {
              nameMap[f.formulaId] = f.name
            }
          }
        }
      })

      // Fill any remaining formula IDs with humanized fallbacks
      allIds.forEach((id) => {
        if (!nameMap[id]) {
          nameMap[id] = formulaIdToName(id)
        }
      })

      setFormulaNameMap(nameMap)
    })
  }, [questions])

  // Derived filter options
  const subjects = useMemo(() => {
    const map = new Map<string, string>()
    questions.forEach((q) => map.set(q.subjectId, q.subjectName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [questions])

  const topics = useMemo(() => {
    const map = new Map<string, string>()
    questions
      .filter((q) => !selectedSubject || q.subjectId === selectedSubject)
      .forEach((q) => map.set(q.topicId, q.topicName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [questions, selectedSubject])

  // Concepts cascade from subject + topic
  const concepts = useMemo(() => {
    const map = new Map<string, string>()
    questions
      .filter((q) => !selectedSubject || q.subjectId === selectedSubject)
      .filter((q) => !selectedTopic || q.topicId === selectedTopic)
      .forEach((q) => map.set(q.conceptId, q.conceptName))
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
        if (selectedSubject && q.subjectId !== selectedSubject) return false
        if (selectedTopic && q.topicId !== selectedTopic) return false
        if (selectedConcept && q.conceptId !== selectedConcept) return false
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

  // Filter trigger style — compact pill that opens the DropdownMenu
  const filterTriggerClass =
    'inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 text-[15px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 data-[state=open]:border-slate-400 data-[state=open]:text-slate-900 sm:h-8 sm:px-2.5 sm:text-sm'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#4A235A] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ background: '#F8F7FF', minHeight: '100vh' }}>
      {/* ─── Sticky page header: sidebar trigger + filter chips ─────────── */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/90 px-3 backdrop-blur sm:h-12 sm:px-4">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mr-1 h-4 shrink-0 bg-slate-200"
        />
        {/* Horizontally scrollable filter chip row */}
        <div className="flex flex-1 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      <div className="max-w-[1100px] mx-auto px-4 py-4 sm:py-6">
        {/* ─── Search bar — stays in its original position, full width ── */}
        <InputGroup className="mb-5 w-full">
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
        <ul className="space-y-3 md:hidden">
          {filteredQuestions.length === 0 ? (
            <li className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
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
                    className="group relative block rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 active:bg-slate-50"
                  >
                    {/* Top meta row */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold tracking-wide text-slate-700">
                          GATE {q.year}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${dColor.bg} ${dColor.text}`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="rounded-md border border-slate-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                          {q.questionType}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {q.marks} mark{q.marks > 1 ? 's' : ''}
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
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <Circle className="h-6 w-6 text-slate-300" />
                        )}
                      </button>
                    </div>

                    {/* Question preview — generous body type */}
                    <div className="line-clamp-3 text-[16px] leading-7 text-slate-900 group-hover:text-[#4A235A]">
                      <MathRenderer text={q.questionText} />
                    </div>

                    {/* Formula badges */}
                    {q.formulaIds && q.formulaIds.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {q.formulaIds.map((fId) => {
                          const isPrimary = fId === q.formulaId
                          const fName = formulaNameMap[fId] || formulaIdToName(fId)
                          const palette = formulaBadgePalette(fId)
                          return (
                            <button
                              key={fId}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setSelectedFormula((prev) => prev === fId ? '' : fId)
                              }}
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors
                                ${palette.bg} ${palette.text} ${palette.hover}
                                ${isPrimary ? 'ring-1 ring-inset ' + palette.ring : ''}
                                ${selectedFormula === fId ? 'outline outline-2 outline-offset-1 outline-violet-400' : ''}
                              `}
                              title={isPrimary ? `Primary formula: ${fName}` : fName}
                            >
                              {fName}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Breadcrumb */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 text-[13px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {q.subjectName}
                      </span>
                      <span className="text-slate-300">›</span>
                      <span>{q.topicName}</span>
                      <span className="text-slate-300">›</span>
                      <span className="font-medium text-indigo-600">
                        {q.conceptName}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })
          )}
        </ul>

        {/* ─── Desktop table (md+) ─────────────────────────────────── */}
        <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
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
                  <TableCell colSpan={10} className="text-center py-12 text-gray-500">
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
                      className="cursor-pointer hover:bg-gray-50 group"
                    >
                      <TableCell className="text-center text-gray-500 font-medium">
                        {idx + 1}
                      </TableCell>

                      <TableCell>
                        <Link href={questionUrl} className="block">
                          <div className="line-clamp-1 max-w-[400px] text-gray-800 text-[14px] group-hover:text-[#4A235A] transition-colors">
                            <MathRenderer text={q.questionText} />
                          </div>
                        </Link>
                      </TableCell>

                      <TableCell className="text-gray-600 font-medium whitespace-nowrap">
                        GATE {q.year}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={`${dColor.bg} ${dColor.text} ${dColor.border} text-[10px] uppercase font-bold border shadow-none`}>
                          {q.difficulty}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 whitespace-nowrap">
                          {q.marks} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {q.questionType}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {q.formulaIds && q.formulaIds.length > 0 ? (
                          <div className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
                            {q.formulaIds.map((fId) => {
                              const isPrimary = fId === q.formulaId
                              const fName = formulaNameMap[fId] || formulaIdToName(fId)
                              const palette = formulaBadgePalette(fId)
                              return (
                                <button
                                  key={fId}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedFormula((prev) => prev === fId ? '' : fId)
                                  }}
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors
                                    ${palette.bg} ${palette.text} ${palette.hover}
                                    ${isPrimary ? 'ring-1 ring-inset ' + palette.ring : ''}
                                    ${selectedFormula === fId ? 'outline outline-2 outline-offset-1 outline-violet-400' : ''}
                                  `}
                                  title={isPrimary ? `Primary: ${fName}` : fName}
                                >
                                  {fName}
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-gray-600 truncate max-w-[120px]" title={q.subjectName}>
                          {q.subjectName}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]" title={q.topicName}>
                          {q.topicName}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-gray-500 truncate max-w-[140px]" title={q.conceptName}>
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
      className="group cursor-pointer select-none whitespace-nowrap hover:text-gray-900"
    >
      {label}{' '}
      <span
        className={
          active
            ? 'text-gray-700'
            : 'text-gray-300 group-hover:text-gray-500'
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
