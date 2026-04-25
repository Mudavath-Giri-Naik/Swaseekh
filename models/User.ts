import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  image: string
  googleId: string
  provider: string
  plan: 'free' | 'pro'
  subscriptionStatus: 'inactive' | 'active' | 'expired'
  subscriptionExpiresAt: Date | null
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: '' },
    googleId: { type: String, required: true, unique: true },
    provider: { type: String, default: 'google' },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    subscriptionStatus: { type: String, enum: ['inactive', 'active', 'expired'], default: 'inactive' },
    subscriptionExpiresAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'users',
  }
)

const UserModel: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)

export default UserModel
