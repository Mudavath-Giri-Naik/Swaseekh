import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAptitudeSolutionStep {
  stepNumber: number
  explanation: string
  formula: string | null
  formulaExpression: string
  calculation: string
  result: string
}

export interface IAptitudeSolution {
  steps: IAptitudeSolutionStep[]
  shortcut: string
  commonMistake: string
  timeToSolve: string
}

export interface IAptitudeQuestion extends Document {
  questionId: string
  conceptSlug: string
  modelId: string
  formulaIds: string[]
  questionText: string
  questionType: 'mcq' | 'integer' | 'fill'
  options: string[] | null
  correctAnswer: string
  difficulty: 'easy' | 'medium' | 'hard'
  solution: IAptitudeSolution
  source: 'rs_agarwal' | 'ppt' | 'indiabix'
  sourcePage: string
  sourceType: 'solved_example' | 'exercise' | 'online'
  tags: string[]
  createdAt: Date
}

const SolutionStepSchema = new Schema<IAptitudeSolutionStep>(
  {
    stepNumber: { type: Number, required: true },
    explanation: { type: String, default: '' },
    formula: { type: String, default: null },
    formulaExpression: { type: String, default: '' },
    calculation: { type: String, default: '' },
    result: { type: String, default: '' },
  },
  { _id: false }
)

const SolutionSchema = new Schema<IAptitudeSolution>(
  {
    steps: { type: [SolutionStepSchema], default: [] },
    shortcut: { type: String, default: '' },
    commonMistake: { type: String, default: '' },
    timeToSolve: { type: String, default: '' },
  },
  { _id: false }
)

const AptitudeQuestionSchema = new Schema<IAptitudeQuestion>(
  {
    questionId: { type: String, required: true, unique: true },
    conceptSlug: { type: String, required: true },
    modelId: { type: String, required: true },
    formulaIds: { type: [String], default: [] },
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ['mcq', 'integer', 'fill'], default: 'mcq' },
    options: { type: [String], default: null },
    correctAnswer: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    solution: { type: SolutionSchema, default: undefined },
    source: { type: String, enum: ['rs_agarwal', 'ppt', 'indiabix'], default: 'rs_agarwal' },
    sourcePage: { type: String, default: '' },
    sourceType: { type: String, enum: ['solved_example', 'exercise', 'online'], default: 'exercise' },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    collection: 'aptitude_questions',
  }
)

AptitudeQuestionSchema.index({ questionId: 1 })
AptitudeQuestionSchema.index({ conceptSlug: 1, difficulty: 1 })
AptitudeQuestionSchema.index({ modelId: 1 })
AptitudeQuestionSchema.index({ formulaIds: 1 })
AptitudeQuestionSchema.index({ source: 1 })
AptitudeQuestionSchema.index({ tags: 1 })

const AptitudeQuestionModel: Model<IAptitudeQuestion> =
  mongoose.models.AptitudeQuestion ??
  mongoose.model<IAptitudeQuestion>('AptitudeQuestion', AptitudeQuestionSchema)

export default AptitudeQuestionModel
