import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Block sub-schema ─────────────────────────────────────────────────────

const BlockSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['heading', 'paragraph', 'annotation', 'math', 'image', 'table', 'points'],
      required: true,
    },
    content: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
)

// ─── Concept Document Interface ───────────────────────────────────────────

export interface IConcept extends Document {
  _id: string
  subjectId: string
  topicId: string
  title: string
  order: number
  tags: string[]
  blocks: { type: string; content: unknown }[]
  createdAt: Date
  updatedAt: Date
}

// ─── Schema Definition ────────────────────────────────────────────────────

const ConceptSchema = new Schema<IConcept>(
  {
    _id: { type: String },
    subjectId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    tags: { type: [String], default: [] },
    blocks: { type: [BlockSchema], default: [] },
  },
  {
    _id: false,
    timestamps: true,
    collection: 'concepts',
  }
)

ConceptSchema.index({ subjectId: 1, topicId: 1, order: 1 })

const ConceptModel: Model<IConcept> =
  mongoose.models.Concept ?? mongoose.model<IConcept>('Concept', ConceptSchema)

export default ConceptModel
