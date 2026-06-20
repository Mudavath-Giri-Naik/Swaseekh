import { AptitudeConceptCard } from '@/components/aptitude/AptitudeConceptCard'
import { BookOpen, TrendingUp, Hash } from 'lucide-react'
import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { itemListSchema, getSeoAptitudeConcepts } from '@/lib/seo'

// Always read fresh from the DB this server is connected to (no cached HTTP self-fetch).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Quantitative Aptitude Practice — Questions with Solutions for GATE & Placements',
  description:
    'Practice quantitative aptitude with step-by-step solutions, key formulas and time-saving shortcuts. Solved RS Agarwal and IndiaBix questions for GATE and placements.',
  alternates: { canonical: '/aptitude' },
}

interface AptitudeConcept {
  conceptId: string
  name: string
  slug: string
  description: string
  totalQuestions: number
  totalFormulas: number
  totalModels: number
}

async function getConcepts(): Promise<AptitudeConcept[]> {
  // Query the database directly (server component) — avoids the NEXT_PUBLIC_APP_URL
  // self-fetch which can point at a different instance/DB and serve stale data.
  const rows = await getSeoAptitudeConcepts()
  return rows as unknown as AptitudeConcept[]
}

export default async function AptitudePage() {
  const concepts = await getConcepts()

  const totalQuestions = concepts.reduce((s, c) => s + c.totalQuestions, 0)
  const totalFormulas = concepts.reduce((s, c) => s + c.totalFormulas, 0)

  return (
    <div className="min-h-screen">
      <JsonLd
        data={itemListSchema(
          'Quantitative Aptitude Chapters',
          concepts.map((c) => ({ name: c.name, path: '/aptitude/' + c.slug }))
        )}
      />
      {/* Hero */}
      <div className="border-b border-border bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Quantitative Aptitude
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                Aptitude Practice Hub
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-base max-w-2xl mb-6">
            Master Quantitative Aptitude with complete RS Agarwal solved examples, 380 exercise
            questions, IndiaBix practice problems — each with step-by-step solutions, LaTeX formulas,
            and shortcuts.
          </p>
          {/* Summary stats */}
          <div className="flex flex-wrap gap-4">
            <StatPill icon={<Hash className="h-4 w-4" />} value={totalQuestions} label="Total Questions" />
            <StatPill icon={<BookOpen className="h-4 w-4" />} value={totalFormulas} label="Formulas" />
            <StatPill icon={<TrendingUp className="h-4 w-4" />} value={concepts.length} label="Chapters" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {concepts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Chapters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {concepts.map((concept) => (
                <AptitudeConceptCard key={concept.conceptId} {...concept} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-sm">
      <span className="text-indigo-500">{icon}</span>
      <span className="font-bold text-foreground">{value.toLocaleString()}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No content yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Aptitude content is being loaded. Run the seed script to populate the database.
      </p>
    </div>
  )
}
