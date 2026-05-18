import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Difficulty, CCDStatus } from '@/types'

// Tailwind class merging utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Difficulty → colors
export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'hard':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

// CCD Status → chip colors
export function getCCDStatusColor(status: CCDStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30'
    case 'in-progress':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30'
    case 'not-started':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20 cursor-not-allowed'
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

// Format year as "GATE YEAR"
export function formatGATEYear(year: number): string {
  return `GATE ${year}`
}

// Format marks badge
export function formatMarks(marks: 1 | 2): string {
  return `${marks}M`
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Parse LaTeX blocks: splits on $ delimiters
export function parseLatexParts(text: string): Array<{ type: 'text' | 'math'; content: string }> {
  const parts: Array<{ type: 'text' | 'math'; content: string }> = []
  const regex = /\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'math', content: match[1] ?? match[2] ?? '' })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return parts
}

// Generate URL-friendly slug
export function slugify(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
