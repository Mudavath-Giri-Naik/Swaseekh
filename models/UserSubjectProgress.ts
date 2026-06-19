import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserSubjectProgress extends Document {
  userId: string
  subjectId: string
  lastViewedTopicId?: string
  updatedAt: Date
}

const UserSubjectProgressSchema = new Schema<IUserSubjectProgress>(
  {
    userId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    lastViewedTopicId: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: 'user_subject_progress',
  }
)

UserSubjectProgressSchema.index({ userId: 1, subjectId: 1 }, { unique: true })

const UserSubjectProgressModel: Model<IUserSubjectProgress> =
  mongoose.models.UserSubjectProgress ?? mongoose.model<IUserSubjectProgress>('UserSubjectProgress', UserSubjectProgressSchema)

export default UserSubjectProgressModel
