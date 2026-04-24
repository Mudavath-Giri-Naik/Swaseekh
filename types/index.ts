// ─── Question Types ────────────────────────────────────────────────────────

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type CCDStatus = 'completed' | 'in-progress' | 'not-started'

export interface QuestionImage {
  url: string
  caption: string
  position: string
}

export interface QuestionTaxonomy {
  subjectId: string
  topicId: string
  subtopicId: string
}

export interface ExamMeta {
  exam: string
  stream: string
  year: number
  shift: string | null
  questionNumber: number
}

export interface QuestionSource {
  volume: number
  page: number
  questionNumberInPDF: string
}

export interface CCDMapping {
  ccdId: string | null
  sectionId: string | null
  fundamentalQuestionId: string | null
  mappingStatus: 'mapped' | 'unmapped'
}

export interface QuestionStats {
  attempts: number
  correctRate: number
  avgTimeTaken: number
  mostChosenWrongAnswer: string | null
}

export interface QuestionFlags {
  isVerified: boolean
  isPYQ: boolean
  hasImage: boolean
  isMSQ: boolean
  isNAT: boolean
}

export interface Question {
  _id: string
  questionLatex: string
  questionType: QuestionType
  optionsLatex: string[]
  correctAnswer: number | number[] | string
  explanationLatex: string
  marks: 1 | 2
  negativeMarks: 0 | 0.33 | 0.66
  images: QuestionImage[]
  taxonomy: QuestionTaxonomy
  examMeta: ExamMeta
  source: QuestionSource
  ccdMapping: CCDMapping
  similarQuestions: string[]
  difficulty: Difficulty
  tags: string[]
  coreConceptTested: string
  prerequisites: string[]
  searchText: string
  embedding: number[]
  stats: QuestionStats
  flags: QuestionFlags
  createdAt: string
  updatedAt: string
}

// ─── Subject / Syllabus Types ──────────────────────────────────────────────

export interface Subtopic {
  _id: string
  name: string
  slug: string
  questionCount: number
  ccdStatus: CCDStatus
  ccdId: string | null
}

export interface Topic {
  _id: string
  name: string
  slug: string
  shortCode: string
  questionCount: number
  ccdStatus: CCDStatus
  subtopics: Subtopic[]
}

export interface Subject {
  _id: string
  name: string
  slug: string
  shortCode: string
  exam: string
  ccdStatus: CCDStatus
  questionCount: number
  topics: Topic[]
  createdAt: string
  updatedAt: string
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
  subtopicId?: string
  topicId?: string
  subjectId?: string
  year?: number
  difficulty?: Difficulty
  type?: QuestionType
  page?: number
  limit?: number
}
