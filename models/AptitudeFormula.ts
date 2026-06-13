import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAptitudeFormula extends Document {
  formulaId: string
  conceptSlug: string
  title: string
  expression: string        // LaTeX string
  plainText: string
  explanation: string
  derivation: string
  questionCount: number
  questionIds: string[]
  tags: string[]
  source: 'rs_agarwal' | 'ppt' | 'derived'
  createdAt: Date
}

const AptitudeFormulaSchema = new Schema<IAptitudeFormula>(
  {
    formulaId: { type: String, required: true, unique: true },
    conceptSlug: { type: String, required: true },
    title: { type: String, required: true },
    expression: { type: String, required: true },
    plainText: { type: String, default: '' },
    explanation: { type: String, default: '' },
    derivation: { type: String, default: '' },
    questionCount: { type: Number, default: 0 },
    questionIds: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    source: { type: String, enum: ['rs_agarwal', 'ppt', 'derived'], default: 'rs_agarwal' },
  },
  {
    timestamps: true,
    collection: 'aptitude_formulas',
  }
)

AptitudeFormulaSchema.index({ formulaId: 1 })
AptitudeFormulaSchema.index({ conceptSlug: 1 })
AptitudeFormulaSchema.index({ tags: 1 })

const AptitudeFormulaModel: Model<IAptitudeFormula> =
  mongoose.models.AptitudeFormula ??
  mongoose.model<IAptitudeFormula>('AptitudeFormula', AptitudeFormulaSchema)

export default AptitudeFormulaModel
