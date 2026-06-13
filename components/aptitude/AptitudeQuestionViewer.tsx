"use client"

import { useState } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Lightbulb, AlertTriangle, Clock, Zap } from 'lucide-react'

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

interface Props {
  question: Question
  index: number
  hideHeader?: boolean
  hideQuestionText?: boolean
}

/** Render text that may contain $...$ inline math */
function RichText({ text }: { text: string }) {
  if (!text) return null
  const parts = text.split(/(\$[^$\n]+\$)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          try {
            return (
              <span key={i} className="inline-block align-middle mx-0.5">
                <InlineMath math={part.slice(1, -1)} />
              </span>
            )
          } catch {
            return <code key={i} className="font-mono text-xs">{part}</code>
          }
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  hard: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

const SOURCE_META: Record<string, { label: string; color: string }> = {
  rs_agarwal: { label: 'R.S. Agarwal', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  indiabix: { label: 'IndiaBix', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  ppt: { label: 'Lecture', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
}

const SOURCE_TYPE_META: Record<string, string> = {
  solved_example: 'Solved Example',
  exercise: 'Exercise',
  online: 'Online Practice',
}

export function AptitudeQuestionViewer({ question, index, hideHeader, hideQuestionText }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const isCorrect = selectedOption === question.correctAnswer
  const src = SOURCE_META[question.source] ?? { label: question.source, color: 'bg-muted text-muted-foreground' }

  const handleOptionClick = (opt: string) => {
    if (revealed) return
    setSelectedOption(opt)
    setRevealed(true)
  }

  return (
    <div className={`rounded-2xl border border-border bg-card overflow-hidden ${hideHeader && hideQuestionText ? 'border-none bg-transparent rounded-none' : ''}`}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border/60">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              {index}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${DIFFICULTY_STYLES[question.difficulty] ?? 'bg-muted text-muted-foreground'}`}>
                  {question.difficulty}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${src.color}`}>
                  {src.label}
                </span>
                {question.sourceType && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400">
                    {SOURCE_TYPE_META[question.sourceType] ?? question.sourceType}
                  </span>
                )}
                {question.sourcePage && (
                  <span className="text-xs text-muted-foreground">pg.{question.sourcePage}</span>
                )}
              </div>
              <p className="text-xs font-mono text-muted-foreground">{question.questionId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Question text */}
      {!hideQuestionText && (
        <div className="px-5 py-4">
          <p className="text-base font-medium leading-relaxed text-foreground">
            <RichText text={question.questionText} />
          </p>
        </div>
      )}

      {/* MCQ options */}
      {question.questionType === 'mcq' && question.options && (
        <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options.map((opt) => {
            const isSelected = selectedOption === opt
            const isRight = opt === question.correctAnswer
            let optStyle =
              'border border-border bg-background text-foreground hover:border-indigo-400 hover:bg-indigo-500/5'

            if (revealed) {
              if (isRight) optStyle = 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              else if (isSelected && !isRight) optStyle = 'border-2 border-red-500 bg-red-500/10 text-red-700 dark:text-red-300'
              else optStyle = 'border border-border bg-background text-muted-foreground opacity-60'
            }

            return (
              <button
                key={opt}
                onClick={() => handleOptionClick(opt)}
                disabled={revealed}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm text-left transition-all duration-150 ${optStyle} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {revealed && isRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                {revealed && isSelected && !isRight && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
                {(!revealed || (!isRight && !isSelected)) && (
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-current opacity-40" />
                )}
                <RichText text={opt} />
              </button>
            )
          })}
        </div>
      )}

      {/* Answer for non-MCQ */}
      {question.questionType !== 'mcq' && (
        <div className="px-5 pb-4">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Show Answer
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold">Answer: </span>
              <RichText text={question.correctAnswer} />
            </div>
          )}
        </div>
      )}

      {/* Correct / Wrong feedback */}
      {revealed && question.questionType === 'mcq' && (
        <div className={`mx-5 mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isCorrect ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 text-red-700 dark:text-red-300'}`}>
          {isCorrect ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
          {isCorrect ? 'Correct! Well done.' : `Incorrect. Correct answer: `}
          {!isCorrect && <RichText text={question.correctAnswer} />}
        </div>
      )}

      {/* Solution toggle */}
      {question.solution && question.solution.steps.length > 0 && (
        <div className="border-t border-border/60">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/5 transition-colors"
          >
            <span>{showSolution ? 'Hide Solution' : 'View Step-by-Step Solution'}</span>
            {showSolution ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showSolution && (
            <div className="px-5 pb-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
              {/* Steps */}
              <div className="space-y-3 pt-2">
                {question.solution.steps.map((step) => (
                  <div key={step.stepNumber} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground mb-1.5">
                        <RichText text={step.explanation} />
                      </p>
                      {step.formulaExpression && (
                        <div className="overflow-x-auto rounded-lg bg-slate-950 dark:bg-slate-900 px-4 py-2 mb-1.5 text-center">
                          <BlockMath math={step.formulaExpression} />
                        </div>
                      )}
                      {step.calculation && (
                        <p className="text-sm font-mono text-muted-foreground bg-muted/40 rounded px-3 py-1">
                          <RichText text={step.calculation} />
                        </p>
                      )}
                      {step.result && (
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                          → <RichText text={step.result} />
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shortcut */}
              {question.solution.shortcut && (
                <div className="flex gap-2 rounded-xl border border-emerald-200/40 bg-emerald-50/5 px-4 py-3">
                  <Zap className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">Shortcut</p>
                    <p className="text-sm"><RichText text={question.solution.shortcut} /></p>
                  </div>
                </div>
              )}

              {/* Common mistake */}
              {question.solution.commonMistake && (
                <div className="flex gap-2 rounded-xl border border-amber-200/40 bg-amber-50/5 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">Common Mistake</p>
                    <p className="text-sm"><RichText text={question.solution.commonMistake} /></p>
                  </div>
                </div>
              )}

              {/* Time hint */}
              {question.solution.timeToSolve && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Expected time: {question.solution.timeToSolve}</span>
                </div>
              )}

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {question.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hint: tap to check if no interaction yet */}
      {!revealed && question.questionType === 'mcq' && (
        <p className="px-5 pb-3 text-xs text-muted-foreground flex items-center gap-1">
          <Lightbulb className="h-3 w-3" />
          Click an option to check your answer
        </p>
      )}
    </div>
  )
}
