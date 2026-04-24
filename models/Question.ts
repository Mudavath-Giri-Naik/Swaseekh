import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Sub-schemas ─────────────────────────────────────────────────────────

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    position: { type: String, default: 'inline' },
  },
  { _id: false }
)

const TaxonomySchema = new Schema(
  {
    subjectId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    subtopicId: { type: String, required: true, index: true },
  },
  { _id: false }
)

const ExamMetaSchema = new Schema(
  {
    exam: { type: String, required: true },
    stream: { type: String, required: true },
    year: { type: Number, required: true, index: true },
    shift: { type: String, default: null },
    questionNumber: { type: Number, required: true },
  },
  { _id: false }
)

const SourceSchema = new Schema(
  {
    volume: { type: Number, default: 1 },
    page: { type: Number, default: 1 },
    questionNumberInPDF: { type: String, default: '' },
  },
  { _id: false }
)

const CCDMappingSchema = new Schema(
  {
    ccdId: { type: String, default: null },
    sectionId: { type: String, default: null },
    fundamentalQuestionId: { type: String, default: null },
    mappingStatus: { type: String, enum: ['mapped', 'unmapped'], default: 'unmapped' },
  },
  { _id: false }
)

const StatsSchema = new Schema(
  {
    attempts: { type: Number, default: 0 },
    correctRate: { type: Number, default: 0.0 },
    avgTimeTaken: { type: Number, default: 0 },
    mostChosenWrongAnswer: { type: String, default: null },
  },
  { _id: false }
)

const FlagsSchema = new Schema(
  {
    isVerified: { type: Boolean, default: false },
    isPYQ: { type: Boolean, default: false },
    hasImage: { type: Boolean, default: false },
    isMSQ: { type: Boolean, default: false },
    isNAT: { type: Boolean, default: false },
  },
  { _id: false }
)

// ─── Main Question Document Interface ─────────────────────────────────────

export interface IQuestion extends Document {
  questionLatex: string
  questionType: 'MCQ' | 'MSQ' | 'NAT'
  optionsLatex: string[]
  correctAnswer: number | number[] | string
  explanationLatex: string
  marks: 1 | 2
  negativeMarks: 0 | 0.33 | 0.66
  images: { url: string; caption: string; position: string }[]
  taxonomy: { subjectId: string; topicId: string; subtopicId: string }
  examMeta: { exam: string; stream: string; year: number; shift: string | null; questionNumber: number }
  source: { volume: number; page: number; questionNumberInPDF: string }
  ccdMapping: {
    ccdId: string | null
    sectionId: string | null
    fundamentalQuestionId: string | null
    mappingStatus: string
  }
  similarQuestions: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  coreConceptTested: string
  prerequisites: string[]
  searchText: string
  embedding: number[]
  stats: {
    attempts: number
    correctRate: number
    avgTimeTaken: number
    mostChosenWrongAnswer: string | null
  }
  flags: {
    isVerified: boolean
    isPYQ: boolean
    hasImage: boolean
    isMSQ: boolean
    isNAT: boolean
  }
  createdAt: Date
  updatedAt: Date
}

// ─── Schema Definition ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QuestionSchema = new Schema<IQuestion>(
  {
    questionLatex: { type: String, required: true },
    questionType: { type: String, enum: ['MCQ', 'MSQ', 'NAT'], required: true, index: true },
    optionsLatex: { type: [String], default: [] },
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    explanationLatex: { type: String, default: '' },
    marks: { type: Number, enum: [1, 2], required: true },
    negativeMarks: { type: Number, enum: [0, 0.33, 0.66], default: 0 },
    images: { type: [ImageSchema], default: [] },
    taxonomy: { type: TaxonomySchema, required: true },
    examMeta: { type: ExamMetaSchema, required: true },
    source: { type: SourceSchema, default: {} },
    ccdMapping: { type: CCDMappingSchema, default: {} },
    similarQuestions: { type: [String], default: [] },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true, index: true },
    tags: { type: [String], default: [] },
    coreConceptTested: { type: String, default: '' },
    prerequisites: { type: [String], default: [] },
    searchText: { type: String, default: '' },
    embedding: { type: [Number], default: [] },
    stats: { type: StatsSchema, default: {} },
    flags: { type: FlagsSchema, default: {} },
  },
  {
    timestamps: true,
    collection: 'questions',
  }
)

// Compound indexes for efficient filtering
QuestionSchema.index({ 'taxonomy.subtopicId': 1, 'examMeta.year': 1 })
QuestionSchema.index({ 'taxonomy.topicId': 1, difficulty: 1 })
QuestionSchema.index({ 'taxonomy.subjectId': 1, 'examMeta.year': 1 })

const QuestionModel: Model<IQuestion> =
  mongoose.models.Question ?? mongoose.model<IQuestion>('Question', QuestionSchema)

export default QuestionModel
