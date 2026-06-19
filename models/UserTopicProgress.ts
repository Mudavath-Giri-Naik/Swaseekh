import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserTopicProgress extends Document {
  userId: string
  subjectId: string
  topicId: string
  conceptsReadCount: number
  pyqsAttemptedCount: number
  pyqsCorrectCount: number
  decodeViewedConceptIds: string[]
  timeSpentSeconds: number
  currentStreak: number
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

const UserTopicProgressSchema = new Schema<IUserTopicProgress>(
  {
    userId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    conceptsReadCount: { type: Number, default: 0 },
    pyqsAttemptedCount: { type: Number, default: 0 },
    pyqsCorrectCount: { type: Number, default: 0 },
    decodeViewedConceptIds: { type: [String], default: [] },
    timeSpentSeconds: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'user_topic_progress',
  }
)

// Unique index so each user has only one progress record per topic
UserTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true })

const UserTopicProgressModel: Model<IUserTopicProgress> =
  mongoose.models.UserTopicProgress ?? mongoose.model<IUserTopicProgress>('UserTopicProgress', UserTopicProgressSchema)

export default UserTopicProgressModel
