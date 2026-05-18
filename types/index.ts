// ─── Question Types ────────────────────────────────────────────────────────

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'Easy' | 'Medium' | 'Hard'
export type CCDStatus = 'completed' | 'in-progress' | 'not-started'

export interface Question {
  _id: string
  angle: string
  cognitiveOperation: string
  conceptId: string
  correctAnswer: string
  depthLevel: string
  difficulty: string
  distractorStrategy: string | null
  explanation: string
  keyConstraint: string | null
  marks: number
  options: string[]
  questionText: string
  questionType: string
  statementStructure: string
  subjectId: string
  topicId: string
  trap: string
  year: number
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
