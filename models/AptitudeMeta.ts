import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAptitudeMeta extends Document {
  lastQuestionNumber: number
  lastFormulaNumber: number
  lastModelNumber: number
  lastConceptNumber: number
  updatedAt: Date
}

const AptitudeMetaSchema = new Schema<IAptitudeMeta>(
  {
    lastQuestionNumber: { type: Number, default: 0 },
    lastFormulaNumber: { type: Number, default: 0 },
    lastModelNumber: { type: Number, default: 0 },
    lastConceptNumber: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'aptitude_meta',
  }
)

const AptitudeMetaModel: Model<IAptitudeMeta> =
  mongoose.models.AptitudeMeta ??
  mongoose.model<IAptitudeMeta>('AptitudeMeta', AptitudeMetaSchema)

export default AptitudeMetaModel
