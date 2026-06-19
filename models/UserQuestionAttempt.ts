import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserQuestionAttempt extends Document {
  userId: string
  questionId: string
  subjectId: string
  topicId: string
  isCorrect: boolean
  distractorType?: string
  attemptedAt: Date
}

const UserQuestionAttemptSchema = new Schema<IUserQuestionAttempt>(
  {
    userId: { type: String, required: true, index: true },
    questionId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    isCorrect: { type: Boolean, required: true },
    distractorType: { type: String, default: null },
    attemptedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'user_question_attempts',
  }
)

const UserQuestionAttemptModel: Model<IUserQuestionAttempt> =
  mongoose.models.UserQuestionAttempt ?? mongoose.model<IUserQuestionAttempt>('UserQuestionAttempt', UserQuestionAttemptSchema)

export default UserQuestionAttemptModel
