"use client"

import { useState } from 'react'
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'
import { ChevronDown, ChevronUp, Lightbulb, Zap } from 'lucide-react'

interface Formula {
  formulaId: string
  title: string
  expression: string
  plainText: string
  explanation: string
  derivation: string
  tags: string[]
  source: string
}

interface CheatsheetProps {
  formulas: Formula[]
  tips: string[]
  tricks: string[]
}

export function AptitudeFormulaCheatsheet({ formulas, tips, tricks }: CheatsheetProps) {
  const [expandedFormula, setExpandedFormula] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'formulas' | 'tips' | 'tricks'>('formulas')

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {(['formulas', 'tips', 'tricks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'formulas' && `📐 Formulas (${formulas.length})`}
            {tab === 'tips' && `💡 Tips (${tips.length})`}
            {tab === 'tricks' && `⚡ Shortcuts (${tricks.length})`}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {/* Formulas tab */}
        {activeTab === 'formulas' && (
          <div className="space-y-2">
            {formulas.map((formula) => (
              <div
                key={formula.formulaId}
                className="rounded-xl border border-border/60 bg-background overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedFormula(
                      expandedFormula === formula.formulaId ? null : formula.formulaId
                    )
                  }
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-indigo-500 shrink-0">
                      {formula.formulaId}
                    </span>
                    <span className="font-medium text-sm truncate">{formula.title}</span>
                  </div>
                  {expandedFormula === formula.formulaId ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {expandedFormula === formula.formulaId && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border/40">
                    {/* LaTeX expression */}
                    <div className="mt-3 overflow-x-auto rounded-lg bg-muted/50 dark:bg-slate-900 px-4 py-3 text-center [&_.katex]:text-foreground">
                      <BlockMath math={formula.expression} />
                    </div>

                    {/* Plain text version */}
                    {formula.plainText && (
                      <p className="text-xs text-muted-foreground font-mono bg-muted/30 rounded px-3 py-2">
                        {formula.plainText}
                      </p>
                    )}

                    {/* Explanation */}
                    {formula.explanation && (
                      <div className="flex gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{formula.explanation}</p>
                      </div>
                    )}

                    {/* Tags */}
                    {formula.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {formula.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Source badge */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Source:</span>
                      <SourceBadge source={formula.source} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tips tab */}
        {activeTab === 'tips' && (
          <div className="space-y-2">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex gap-3 rounded-xl border border-amber-200/40 bg-amber-50/5 px-4 py-3"
              >
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{tip}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tricks tab */}
        {activeTab === 'tricks' && (
          <div className="space-y-2">
            {tricks.map((trick, idx) => (
              <div
                key={idx}
                className="flex gap-3 rounded-xl border border-emerald-200/40 bg-emerald-50/5 px-4 py-3"
              >
                <Zap className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{trick}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SourceBadge({ source }: { source: string }) {
  const map: Record<string, { label: string; color: string }> = {
    rs_agarwal: { label: 'R.S. Agarwal', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    ppt: { label: 'Lecture PPT', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    derived: { label: 'Derived', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    indiabix: { label: 'IndiaBix', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  }
  const s = map[source] ?? { label: source, color: 'bg-muted text-muted-foreground' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
  )
}
