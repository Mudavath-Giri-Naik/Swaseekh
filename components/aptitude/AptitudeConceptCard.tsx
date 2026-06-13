"use client"

import Link from 'next/link'
import { BookOpen, Hash, Layers, ArrowRight } from 'lucide-react'

interface Props {
  conceptId: string
  name: string
  slug: string
  description: string
  totalQuestions: number
  totalFormulas: number
  totalModels: number
}

export function AptitudeConceptCard({
  name,
  slug,
  description,
  totalQuestions,
  totalFormulas,
  totalModels,
}: Props) {
  return (
    <Link href={`/aptitude/${slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5">
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-foreground text-lg truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {name}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-indigo-500" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-3 border-t border-border/60">
          <Stat icon={<Hash className="h-3.5 w-3.5" />} value={totalQuestions} label="Questions" />
          <Stat icon={<Layers className="h-3.5 w-3.5" />} value={totalFormulas} label="Formulas" />
          <Stat icon={<BookOpen className="h-3.5 w-3.5" />} value={totalModels} label="Models" />
        </div>
      </div>
    </Link>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="text-indigo-500">{icon}</span>
      <span className="font-semibold text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  )
}
