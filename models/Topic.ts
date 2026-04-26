import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Topic Document Interface ─────────────────────────────────────────────

export interface ITopic extends Document<string> {
  _id: string
  subjectId: string
  name: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// ─── Schema Definition ────────────────────────────────────────────────────

const TopicSchema = new Schema<ITopic>(
  {
    _id: { type: String },
    subjectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    order: { type: Number, required: true },
  },
  {
    _id: false,
    timestamps: true,
    collection: 'topics',
  }
)

TopicSchema.index({ subjectId: 1, order: 1 })

const TopicModel: Model<ITopic> =
  mongoose.models.Topic ?? mongoose.model<ITopic>('Topic', TopicSchema)

export default TopicModel
