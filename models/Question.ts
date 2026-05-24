import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Sub-document interfaces ─────────────────────────────────────────────

export interface IMeta {
  exam: string
  year: number
  marks: number
  difficulty: string                  // "easy" | "medium" | "hard"
  type: string                        // "NAT" | "MCQ" | "MSQ"
  subject: string
  topic: string
  subtopic: string
}

export interface IKeyword {
  term: string
  explain: string
  example: string
}

export interface IUnderstand {
  plain: string
  keywords: IKeyword[]
  visual_svg: string
  visual_alt: string
}

export interface IGivenTerm {
  term: string
  meaning: string
  example: string
  connects: string
}

export interface IGiven {
  aim: string
  terms: IGivenTerm[]
  plan: string
}

export interface ISolutionStep {
  step: number
  title: string
  formula_id: string
  formula_raw: string
  apply: string
  note: string
}

export interface ISolution {
  steps: ISolutionStep[]
  result: string
}

// ─── Question Document Interface ─────────────────────────────────────────

export interface IQuestion extends Document<string> {
  _id: string
  id: string
  meta: IMeta
  question: string
  answer: string
  understand: IUnderstand
  given: IGiven
  to_find: string
  solution: ISolution
  formula_ids_used: string[]
  /** Optional caveat / discrepancy flag — only render when non-empty. */
  formula_note: string
}

// ─── Schema sub-documents ────────────────────────────────────────────────

const MetaSchema = new Schema<IMeta>(
  {
    exam: String,
    year: Number,
    marks: Number,
    difficulty: String,
    type: String,
    subject: String,
    topic: String,
    subtopic: String,
  },
  { _id: false }
)

const KeywordSchema = new Schema<IKeyword>(
  { term: String, explain: String, example: String },
  { _id: false }
)

const UnderstandSchema = new Schema<IUnderstand>(
  {
    plain: String,
    keywords: { type: [KeywordSchema], default: [] },
    visual_svg: String,
    visual_alt: String,
  },
  { _id: false }
)

const GivenTermSchema = new Schema<IGivenTerm>(
  { term: String, meaning: String, example: String, connects: String },
  { _id: false }
)

const GivenSchema = new Schema<IGiven>(
  {
    aim: String,
    terms: { type: [GivenTermSchema], default: [] },
    plan: String,
  },
  { _id: false }
)

const SolutionStepSchema = new Schema<ISolutionStep>(
  {
    step: Number,
    title: String,
    formula_id: String,
    formula_raw: String,
    apply: String,
    note: String,
  },
  { _id: false }
)

const SolutionSchema = new Schema<ISolution>(
  {
    steps: { type: [SolutionStepSchema], default: [] },
    result: String,
  },
  { _id: false }
)

// ─── Question Schema ─────────────────────────────────────────────────────

const QuestionSchema = new Schema<IQuestion>(
  {
    _id: { type: String },
    id: { type: String, required: true },
    meta: { type: MetaSchema, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    understand: { type: UnderstandSchema, default: undefined },
    given: { type: GivenSchema, default: undefined },
    to_find: { type: String, default: '' },
    solution: { type: SolutionSchema, default: undefined },
    formula_ids_used: { type: [String], default: [] },
    formula_note: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'questions',
    // The docs are imported externally; let unknown fields pass through.
    strict: false,
  }
)

// Compound indexes for efficient filtering (note: lookup paths are now nested)
QuestionSchema.index({ 'meta.subject': 1, 'meta.year': 1 })
QuestionSchema.index({ 'meta.topic': 1, 'meta.difficulty': 1 })
QuestionSchema.index({ 'meta.subtopic': 1, 'meta.year': 1 })
QuestionSchema.index({ formula_ids_used: 1 })

const QuestionModel: Model<IQuestion> =
  mongoose.models.Question ?? mongoose.model<IQuestion>('Question', QuestionSchema)

export default QuestionModel
