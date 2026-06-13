import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAptitudeCheatsheet {
  formulas: string[]
  tips: string[]
  tricks: string[]
}

export interface IAptitudeConcept extends Document {
  conceptId: string
  name: string
  slug: string
  description: string
  totalQuestions: number
  totalFormulas: number
  totalModels: number
  models: string[]
  cheatsheet: IAptitudeCheatsheet
  createdAt: Date
  updatedAt: Date
}

const CheatsheetSchema = new Schema<IAptitudeCheatsheet>(
  {
    formulas: { type: [String], default: [] },
    tips: { type: [String], default: [] },
    tricks: { type: [String], default: [] },
  },
  { _id: false }
)

const AptitudeConceptSchema = new Schema<IAptitudeConcept>(
  {
    conceptId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    totalQuestions: { type: Number, default: 0 },
    totalFormulas: { type: Number, default: 0 },
    totalModels: { type: Number, default: 0 },
    models: { type: [String], default: [] },
    cheatsheet: { type: CheatsheetSchema, default: () => ({ formulas: [], tips: [], tricks: [] }) },
  },
  {
    timestamps: true,
    collection: 'aptitude_concepts',
  }
)

AptitudeConceptSchema.index({ slug: 1 })
AptitudeConceptSchema.index({ conceptId: 1 })

const AptitudeConceptModel: Model<IAptitudeConcept> =
  mongoose.models.AptitudeConcept ??
  mongoose.model<IAptitudeConcept>('AptitudeConcept', AptitudeConceptSchema)

export default AptitudeConceptModel
