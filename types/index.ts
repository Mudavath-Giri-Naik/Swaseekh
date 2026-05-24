// ─── Question Types ────────────────────────────────────────────────────────

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'Easy' | 'Medium' | 'Hard'
export type CCDStatus = 'completed' | 'in-progress' | 'not-started'

// ─── New nested-shape sub-types ────────────────────────────────────────────

export interface QuestionMeta {
  exam: string
  year: number
  marks: number
  difficulty: string
  type: string
  subject: string
  topic: string
  subtopic: string
}

export interface QuestionKeyword {
  term: string
  explain: string
  example: string
}

export interface QuestionUnderstand {
  plain: string
  keywords: QuestionKeyword[]
  visual_svg: string
  visual_alt: string
}

export interface QuestionGivenTerm {
  term: string
  meaning: string
  example: string
  connects: string
}

export interface QuestionGiven {
  aim: string
  terms: QuestionGivenTerm[]
  plan: string
}

export interface QuestionSolutionStep {
  step: number
  title: string
  formula_id: string
  formula_raw: string
  apply: string
  note: string
}

export interface QuestionSolution {
  steps: QuestionSolutionStep[]
  result: string
}

export interface Question {
  _id: string
  id?: string
  meta: QuestionMeta
  question: string
  answer: string
  understand?: QuestionUnderstand
  given?: QuestionGiven
  to_find?: string
  solution?: QuestionSolution
  formula_ids_used?: string[]
  /** Optional caveat — render only when non-empty. */
  formula_note?: string

  // Flattened / enriched fields the API also exposes for list views and
  // legacy callers (sorting, filtering, routing). They mirror meta.*
  year?: number
  marks?: number
  difficulty?: string
  questionType?: string
  questionText?: string
  correctAnswer?: string
  formulaIds?: string[]
  formulaId?: string | null
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
