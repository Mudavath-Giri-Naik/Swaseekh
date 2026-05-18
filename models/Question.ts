import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Question Document Interface ──────────────────────────────────────────

export interface IQuestion extends Document<string> {
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
}

// ─── Schema Definition ────────────────────────────────────────────────────

const QuestionSchema = new Schema<IQuestion>(
  {
    _id: { type: String },
    angle: { type: String, required: true },
    cognitiveOperation: { type: String, required: true },
    conceptId: { type: String, required: true, index: true },
    correctAnswer: { type: String, required: true },
    depthLevel: { type: String, required: true },
    difficulty: { type: String, required: true, index: true },
    distractorStrategy: { type: String, default: null },
    explanation: { type: String, required: true },
    keyConstraint: { type: String, default: null },
    marks: { type: Number, required: true },
    options: { type: [String], default: [] },
    questionText: { type: String, required: true },
    questionType: { type: String, required: true, index: true },
    statementStructure: { type: String, required: true },
    subjectId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    trap: { type: String, required: true },
    year: { type: Number, required: true, index: true },
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
