"use client"

import { Suspense, useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { AptitudeFormulaCheatsheet } from '@/components/aptitude/AptitudeFormulaCheatsheet'
import { AptitudeQuestionViewer } from '@/components/aptitude/AptitudeQuestionViewer'
import { AptitudeModelCard } from '@/components/aptitude/AptitudeModelCard'
import {
  BookOpen, Hash, Layers, ChevronLeft, Loader2, Filter, Search, X
} from 'lucide-react'
import Link from 'next/link'

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Formula {
  formulaId: string; title: string; expression: string; plainText: string
  explanation: string; derivation: string; tags: string[]; source: string
}
interface AptModel {
  modelId: string; name: string; description: string; questionCount: number
  difficulty: string; formulaIds: string[]
}
interface Concept {
  conceptId: string; name: string; slug: string; description: string
  totalQuestions: number; totalFormulas: number; totalModels: number
  cheatsheet: { formulas: string[]; tips: string[]; tricks: string[] }
}
interface Question {
  questionId: string; questionText: string; questionType: string
  options: string[] | null; correctAnswer: string; difficulty: string
  solution: { steps: { stepNumber: number; explanation: string; formula: string | null; formulaExpression: string; calculation: string; result: string }[]; shortcut: string; commonMistake: string; timeToSolve: string }
  source: string; sourceType: string; sourcePage: string
  modelId: string; formulaIds: string[]; tags: string[]
}

const DIFF_TABS = ['all', 'easy', 'medium', 'hard'] as const
const SOURCE_TABS = ['all', 'rs_agarwal', 'indiabix', 'ppt'] as const
const SOURCE_LABELS: Record<string, string> = {
  all: 'All', rs_agarwal: 'R.S. Agarwal', indiabix: 'IndiaBix', ppt: 'Lecture'
}

/* ─── Module-Level Caches ───────────────────────────────────────────── */
const metaCache: Record<string, { concept: Concept; formulas: Formula[]; models: AptModel[] }> = {}
const questionsCache: Record<string, { questions: Question[]; totalPages: number; totalQ: number }> = {}

function buildQCacheKey(slug: string, model: string, diff: string, source: string, pg: number): string {
  return `${slug}|${model}|${diff}|${source}|${pg}`
}

/* ─── Default export with Suspense boundary (required by useSearchParams) */
export default function ConceptSlugPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    }>
      <ConceptSlugInner />
    </Suspense>
  )
}

function ConceptSlugInner() {
  const params = useParams()
  const slug = params.conceptSlug as string
  const searchParams = useSearchParams()
  const router = useRouter()

  /* ─── Read initial state from URL search params ─────────────────── */
  const initialModel = searchParams.get('model') ?? 'all'
  const initialDiff = (searchParams.get('difficulty') ?? 'all') as typeof DIFF_TABS[number]
  const initialSource = (searchParams.get('source') ?? 'all') as typeof SOURCE_TABS[number]
  const initialSearch = searchParams.get('search') ?? ''
  const initialPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const initialTab = (searchParams.get('tab') === 'formulas' ? 'formulas' : 'questions') as 'questions' | 'formulas'

  /* ─── State ──────────────────────────────────────────────────────── */
  const [concept, setConcept] = useState<Concept | null>(metaCache[slug]?.concept ?? null)
  const [formulas, setFormulas] = useState<Formula[]>(metaCache[slug]?.formulas ?? [])
  const [models, setModels] = useState<AptModel[]>(metaCache[slug]?.models ?? [])

  // Pre-populate questions from cache if available
  const initQKey = buildQCacheKey(slug, initialModel, initialDiff, initialSource, initialPage)
  const cachedQ = questionsCache[initQKey]

  const [questions, setQuestions] = useState<Question[]>(cachedQ?.questions ?? [])
  const [loading, setLoading] = useState(!metaCache[slug])
  const [qLoading, setQLoading] = useState(!cachedQ)
  const [error, setError] = useState<string | null>(null)

  // Filters — initialised from URL
  const [activeModel, setActiveModel] = useState<string>(initialModel)
  const [activeDiff, setActiveDiff] = useState<typeof DIFF_TABS[number]>(initialDiff)
  const [activeSource, setActiveSource] = useState<typeof SOURCE_TABS[number]>(initialSource)
  const [searchText, setSearchText] = useState(initialSearch)
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(cachedQ?.totalPages ?? 1)
  const [totalQ, setTotalQ] = useState(cachedQ?.totalQ ?? 0)
  const [activeTab, setActiveTab] = useState<'questions' | 'formulas'>(initialTab)

  // Ref to prevent the URL-sync effect from running on first mount
  // (we already read from the URL; no need to write back the same values)
  const isInitialMount = useRef(true)

  /* ─── Sync state → URL search params ────────────────────────────── */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const sp = new URLSearchParams()
    if (activeModel !== 'all') sp.set('model', activeModel)
    if (activeDiff !== 'all') sp.set('difficulty', activeDiff)
    if (activeSource !== 'all') sp.set('source', activeSource)
    if (searchText.trim()) sp.set('search', searchText.trim())
    if (page > 1) sp.set('page', String(page))
    if (activeTab !== 'questions') sp.set('tab', activeTab)

    const qs = sp.toString()
    const newUrl = qs ? `?${qs}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [activeModel, activeDiff, activeSource, searchText, page, activeTab, router])

  /* ─── Fetch concept meta ─────────────────────────────────────────── */
  useEffect(() => {
    if (!slug) return

    // If we have cached meta, use it but still refresh in background
    if (metaCache[slug]) {
      setConcept(metaCache[slug].concept)
      setFormulas(metaCache[slug].formulas)
      setModels(metaCache[slug].models)
      setLoading(false)
    } else {
      setLoading(true)
    }

    fetch(`/api/aptitude/concepts/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return }
        const meta = {
          concept: d.concept,
          formulas: d.formulas ?? [],
          models: d.models ?? []
        }
        metaCache[slug] = meta
        setConcept(meta.concept)
        setFormulas(meta.formulas)
        setModels(meta.models)
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }, [slug])

  /* ─── Fetch questions ────────────────────────────────────────────── */
  const fetchQuestions = useCallback((pg: number) => {
    if (!slug) return

    const cacheKey = buildQCacheKey(slug, activeModel, activeDiff, activeSource, pg)

    // If cached data exists, show it immediately
    if (questionsCache[cacheKey]) {
      const cached = questionsCache[cacheKey]
      setQuestions(cached.questions)
      setTotalPages(cached.totalPages)
      setTotalQ(cached.totalQ)
      setQLoading(false)
    } else {
      setQLoading(true)
    }

    const qp = new URLSearchParams({ concept: slug, page: String(pg), limit: '15' })
    if (activeModel !== 'all') qp.set('model', activeModel)
    if (activeDiff !== 'all') qp.set('difficulty', activeDiff)
    if (activeSource !== 'all') qp.set('source', activeSource)

    fetch(`/api/aptitude/questions?${qp}`)
      .then((r) => r.json())
      .then((d) => {
        const result = {
          questions: d.questions ?? [],
          totalPages: d.totalPages ?? 1,
          totalQ: d.total ?? 0
        }
        questionsCache[cacheKey] = result
        setQuestions(result.questions)
        setTotalPages(result.totalPages)
        setTotalQ(result.totalQ)
      })
      .catch(() => {})
      .finally(() => setQLoading(false))
  }, [slug, activeModel, activeDiff, activeSource])

  useEffect(() => { setPage(1) }, [activeModel, activeDiff, activeSource])
  useEffect(() => { fetchQuestions(page) }, [fetchQuestions, page])

  // Client-side search filter
  const displayed = searchText.trim()
    ? questions.filter((q) =>
        q.questionText.toLowerCase().includes(searchText.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(searchText.toLowerCase()))
      )
    : questions

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
    </div>
  )
  if (error || !concept) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <p className="text-muted-foreground">{error ?? 'Concept not found'}</p>
      <Link href="/aptitude" className="text-indigo-500 hover:underline text-sm">← Back to Aptitude</Link>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/aptitude" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ChevronLeft className="h-4 w-4" /> Aptitude
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <h1 className="font-semibold text-foreground truncate">{concept.name}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Concept info */}
        <div className="mb-6">
          <p className="text-muted-foreground text-sm mb-3 max-w-2xl">{concept.description}</p>
          <div className="flex flex-wrap gap-3">
            <StatChip icon={<Hash className="h-3.5 w-3.5" />} value={concept.totalQuestions} label="Questions" />
            <StatChip icon={<BookOpen className="h-3.5 w-3.5" />} value={concept.totalFormulas} label="Formulas" />
            <StatChip icon={<Layers className="h-3.5 w-3.5" />} value={concept.totalModels} label="Models" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar: models */}
          <div className="lg:w-64 shrink-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Question Types
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setActiveModel('all')}
                className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm transition-all ${activeModel === 'all' ? 'border-indigo-500 bg-indigo-500/5 font-medium text-indigo-600 dark:text-indigo-400' : 'border-border bg-card text-muted-foreground hover:border-indigo-400/50'}`}
              >
                All Types ({concept.totalQuestions})
              </button>
              {models.map((m) => (
                <AptitudeModelCard
                  key={m.modelId}
                  {...m}
                  isActive={activeModel === m.modelId}
                  onClick={() => setActiveModel(m.modelId)}
                />
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Tab bar */}
            <div className="flex gap-1 border-b border-border mb-5">
              {(['questions', 'formulas'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab === 'questions' ? `Questions (${totalQ})` : `Formula Sheet (${formulas.length})`}
                </button>
              ))}
            </div>

            {activeTab === 'formulas' ? (
              <AptitudeFormulaCheatsheet
                formulas={formulas}
                tips={concept.cheatsheet?.tips ?? []}
                tricks={concept.cheatsheet?.tricks ?? []}
              />
            ) : (
              <>
                {/* Filters */}
                <div className="space-y-3 mb-5">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                    {searchText && (
                      <button onClick={() => setSearchText('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                  {/* Filter pills */}
                  <div className="flex flex-wrap gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground self-center" />
                    {/* Difficulty */}
                    {DIFF_TABS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setActiveDiff(d)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all capitalize ${activeDiff === d ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-border text-muted-foreground hover:border-indigo-400/50'}`}
                      >
                        {d === 'all' ? 'All Difficulty' : d}
                      </button>
                    ))}
                    <span className="text-muted-foreground/40 text-xs self-center">|</span>
                    {/* Source */}
                    {SOURCE_TABS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveSource(s)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${activeSource === s ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-border text-muted-foreground hover:border-indigo-400/50'}`}
                      >
                        {SOURCE_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                {qLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <p className="text-muted-foreground text-sm">No questions match your filters.</p>
                    <button onClick={() => { setActiveModel('all'); setActiveDiff('all'); setActiveSource('all'); setSearchText('') }} className="text-xs text-indigo-500 hover:underline">
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayed.map((q, i) => (
                      <AptitudeQuestionViewer key={q.questionId} question={q} index={(page - 1) * 15 + i + 1} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !searchText && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="text-sm px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:border-indigo-400 transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="text-sm px-4 py-2 rounded-lg border border-border disabled:opacity-40 hover:border-indigo-400 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatChip({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs">
      <span className="text-indigo-500">{icon}</span>
      <span className="font-bold text-foreground">{value.toLocaleString()}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}
