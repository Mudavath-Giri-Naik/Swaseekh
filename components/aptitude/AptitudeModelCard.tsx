"use client"

import { Layers } from 'lucide-react'

interface Props {
  modelId: string
  name: string
  description: string
  questionCount: number
  difficulty: string
  formulaIds: string[]
  isActive?: boolean
  onClick?: () => void
}

const DIFF: Record<string, string> = {
  easy: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  hard: 'text-red-600 dark:text-red-400 bg-red-500/10',
}

export function AptitudeModelCard({ modelId, name, description, questionCount, difficulty, isActive, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all duration-150 ${
        isActive
          ? 'border-indigo-500 bg-indigo-500/5 shadow-sm'
          : 'border-border bg-card hover:border-indigo-400/50 hover:bg-muted/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-500' : 'text-muted-foreground'}`} />
          <span className="font-medium text-sm text-foreground truncate">{name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 capitalize ${DIFF[difficulty] ?? 'bg-muted text-muted-foreground'}`}>
          {difficulty}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{description}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{questionCount}</span>
        <span>questions</span>
        <span className="ml-1 text-xs font-mono opacity-50">{modelId}</span>
      </div>
    </button>
  )
}
