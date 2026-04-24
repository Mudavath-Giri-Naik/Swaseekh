import mongoose, { Schema, Document, Model } from 'mongoose'

// ─── Sub-schemas ─────────────────────────────────────────────────────────

const SubtopicSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    questionCount: { type: Number, default: 0 },
    ccdStatus: {
      type: String,
      enum: ['completed', 'in-progress', 'not-started'],
      default: 'not-started',
    },
    ccdId: { type: String, default: null },
  },
  { _id: false }
)

const TopicSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    shortCode: { type: String, default: '' },
    questionCount: { type: Number, default: 0 },
    ccdStatus: {
      type: String,
      enum: ['completed', 'in-progress', 'not-started'],
      default: 'not-started',
    },
    subtopics: { type: [SubtopicSchema], default: [] },
  },
  { _id: false }
)

// ─── Main Subject Document Interface ─────────────────────────────────────

export interface ISubject extends Document {
  name: string
  slug: string
  shortCode: string
  exam: string
  ccdStatus: 'completed' | 'in-progress' | 'not-started'
  questionCount: number
  topics: {
    _id: string
    name: string
    slug: string
    shortCode: string
    questionCount: number
    ccdStatus: 'completed' | 'in-progress' | 'not-started'
    subtopics: {
      _id: string
      name: string
      slug: string
      questionCount: number
      ccdStatus: 'completed' | 'in-progress' | 'not-started'
      ccdId: string | null
    }[]
  }[]
  createdAt: Date
  updatedAt: Date
}

// ─── Schema Definition ────────────────────────────────────────────────────

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortCode: { type: String, required: true },
    exam: { type: String, default: 'GATE-CSE' },
    ccdStatus: {
      type: String,
      enum: ['completed', 'in-progress', 'not-started'],
      default: 'not-started',
    },
    questionCount: { type: Number, default: 0 },
    topics: { type: [TopicSchema], default: [] },
  },
  {
    timestamps: true,
    collection: 'subjects',
  }
)

const SubjectModel: Model<ISubject> =
  mongoose.models.Subject ?? mongoose.model<ISubject>('Subject', SubjectSchema)

export default SubjectModel
