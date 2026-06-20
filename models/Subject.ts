import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Subject Document Interface ──────────────────────────────────────────

export interface ISubject extends Document<string> {
  _id: string
  name: string
  code: string
  order: number
  section: string
  totalTopics: number
  totalConcepts: number
  weightage: number
  createdAt: Date
  updatedAt: Date
}

// ─── Schema Definition ────────────────────────────────────────────────────

const SubjectSchema = new Schema<ISubject>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    code: { type: String, required: true },
    order: { type: Number, required: true },
    section: { type: String, required: true },
    totalTopics: { type: Number, default: 0 },
    totalConcepts: { type: Number, default: 0 },
    weightage: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'subjects',
  }
)

const SubjectModel: Model<ISubject> =
  mongoose.models.Subject ?? mongoose.model<ISubject>('Subject', SubjectSchema)

export default SubjectModel
