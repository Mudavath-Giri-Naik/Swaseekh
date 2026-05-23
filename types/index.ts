// ─── Question Types ────────────────────────────────────────────────────────

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'Easy' | 'Medium' | 'Hard'
export type CCDStatus = 'completed' | 'in-progress' | 'not-started'

export interface FormulaUsed {
  formulaId: string
  name: string
  plain: string
  termsExplained: string[]
}

export interface Question {
  _id: string
  subjectId: string
  topicId: string
  conceptId: string
  year: number
  questionType: string
  marks: number
  difficulty: string
  questionText: string
  options: string[]
  correctAnswer: string
  formulaId?: string | null
  formulaIds?: string[]

  // Rich explanation block (new schema)
  whatToFind?: string
  plainRestatement?: string
  realWorldScenario?: string
  formulaUsed?: FormulaUsed | null
  solutionSteps?: string[]
  finalAnswer?: string
  commonTrap?: string
  /** Optional flag — only render when non-empty. */
  formulaNote?: string

  // Resolved names (from API enrichment)
  subjectName?: string
  topicName?: string
  conceptName?: string
}

// ─── Subject / Syllabus Types ──────────────────────────────────────────────

export interface Topic {
  _id: string
  subjectId: string
  name: string
  order: number
}

export interface Concept {
  _id: string
  subjectId: string
  topicId: string
  title: string
  order: number
  tags: string[]
}

export interface Subject {
  _id: string
  name: string
  code: string
  order: number
  section: string
  totalTopics: number
  totalConcepts: number
}

// ─── API Response Types ────────────────────────────────────────────────────

export interface PaginatedQuestionsResponse {
  questions: Question[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SubjectsResponse {
  subjects: Subject[]
}

// ─── Filter Types ──────────────────────────────────────────────────────────

export interface QuestionFilters {
  conceptId?: string
  topicId?: string
  subjectId?: string
  year?: number
  difficulty?: string
  type?: string
  page?: number
  limit?: number
}
