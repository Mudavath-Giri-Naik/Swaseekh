import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Sub-doc: formulaUsed ─────────────────────────────────────────────────

export interface IFormulaUsed {
  formulaId: string
  name: string
  plain: string
  termsExplained: string[]
}

const FormulaUsedSchema = new Schema<IFormulaUsed>(
  {
    formulaId: { type: String, required: true },
    name: { type: String, required: true },
    plain: { type: String, required: true },
    termsExplained: { type: [String], default: [] },
  },
  { _id: false }
)

// ─── Question Document Interface ──────────────────────────────────────────

export interface IQuestion extends Document<string> {
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
  formulaId: string | null
  formulaIds: string[]

  // New rich-explanation fields
  whatToFind: string
  plainRestatement: string
  realWorldScenario: string
  formulaUsed: IFormulaUsed | null
  solutionSteps: string[]
  finalAnswer: string
  commonTrap: string
  /** Optional flag/notes (outside-syllabus markers, answer discrepancies).
   *  Often "" — only render when non-empty. */
  formulaNote: string
}

// ─── Schema Definition ────────────────────────────────────────────────────

const QuestionSchema = new Schema<IQuestion>(
  {
    _id: { type: String },
    subjectId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    conceptId: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
    questionType: { type: String, required: true, index: true },
    marks: { type: Number, required: true },
    difficulty: { type: String, required: true, index: true },
    questionText: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    formulaId: { type: String, default: null },
    formulaIds: { type: [String], default: [] },

    whatToFind: { type: String, default: '' },
    plainRestatement: { type: String, default: '' },
    realWorldScenario: { type: String, default: '' },
    formulaUsed: { type: FormulaUsedSchema, default: null },
    solutionSteps: { type: [String], default: [] },
    finalAnswer: { type: String, default: '' },
    commonTrap: { type: String, default: '' },
    formulaNote: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'questions',
  }
)

// Compound indexes for efficient filtering
QuestionSchema.index({ subjectId: 1, year: 1 })
QuestionSchema.index({ topicId: 1, difficulty: 1 })
QuestionSchema.index({ conceptId: 1, year: 1 })

const QuestionModel: Model<IQuestion> =
  mongoose.models.Question ?? mongoose.model<IQuestion>('Question', QuestionSchema)

export default QuestionModel
