import React, { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, FileText, Bookmark, Zap } from 'lucide-react'
import { AptitudeQuestionViewer } from './AptitudeQuestionViewer'

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
  questionId: string
  questionText: string
  questionType: string
  options: string[] | null
  correctAnswer: string
  difficulty: string
  solution: Solution
  source: string
  sourceType: string
  sourcePage: string
  modelId: string
  formulaIds: string[]
  tags: string[]
}

interface AptitudeDataTableProps {
  questions: Question[]
  startIndex: number
}

const DIFFICULTY_STYLES: Record<string, { bg: string, text: string, icon: React.ReactNode }> = {
  easy: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> },
  medium: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: <Zap className="h-3.5 w-3.5 mr-1" /> },
  hard: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-600 dark:text-red-400', icon: <XCircle className="h-3.5 w-3.5 mr-1" /> },
}

const SOURCE_META: Record<string, string> = {
  rs_agarwal: 'R.S. Agarwal',
  indiabix: 'IndiaBix',
  ppt: 'Lecture',
}

/** Utility to strip math/markdown tags for plain text preview */
function stripTags(text: string) {
  if (!text) return ''
  return text.replace(/\$[^$]+\$/g, '(Math)').substring(0, 80) + (text.length > 80 ? '...' : '')
}

export function AptitudeDataTable({ questions, startIndex }: AptitudeDataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string, e: React.MouseEvent) => {
    // If they clicked on something inside the question viewer, don't toggle
    const newSet = new Set(expandedRows)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedRows(newSet)
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border/60 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium w-16">
                No.
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                Question
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                Difficulty
              </th>
              <th scope="col" className="px-6 py-4 font-medium">
                Source
              </th>
              <th scope="col" className="px-6 py-4 font-medium text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {questions.map((q, i) => {
              const isExpanded = expandedRows.has(q.questionId)
              const diffStyle = DIFFICULTY_STYLES[q.difficulty] || { bg: 'bg-muted border-border', text: 'text-muted-foreground', icon: <Bookmark className="h-3.5 w-3.5 mr-1" /> }
              
              return (
                <React.Fragment key={q.questionId}>
                  <tr 
                    className={`transition-colors hover:bg-muted/40 cursor-pointer ${isExpanded ? 'bg-muted/20' : 'bg-background'}`}
                    onClick={(e) => toggleRow(q.questionId, e)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono text-xs">
                      {startIndex + i}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground max-w-md truncate">
                      {stripTags(q.questionText)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium capitalize ${diffStyle.bg} ${diffStyle.text}`}>
                        {diffStyle.icon}
                        {q.difficulty}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{SOURCE_META[q.source] || q.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="p-0 border-b border-border/60 bg-muted/10 cursor-default">
                        <div className="p-4 sm:p-6 animation-fade-in" onClick={(e) => e.stopPropagation()}>
                          <AptitudeQuestionViewer question={q} index={startIndex + i} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
