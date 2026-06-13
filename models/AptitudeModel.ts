import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAptitudeModel extends Document {
  modelId: string
  conceptSlug: string
  name: string
  description: string
  questionIds: string[]
  formulaIds: string[]
  questionCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  createdAt: Date
  updatedAt: Date
}

const AptitudeModelSchema = new Schema<IAptitudeModel>(
  {
    modelId: { type: String, required: true, unique: true },
    conceptSlug: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    questionIds: { type: [String], default: [] },
    formulaIds: { type: [String], default: [] },
    questionCount: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  },
  {
    timestamps: true,
    collection: 'aptitude_models',
  }
)

AptitudeModelSchema.index({ modelId: 1 })
AptitudeModelSchema.index({ conceptSlug: 1 })

const AptitudeModelModel: Model<IAptitudeModel> =
  mongoose.models.AptitudeModel ??
  mongoose.model<IAptitudeModel>('AptitudeModel', AptitudeModelSchema)

export default AptitudeModelModel
