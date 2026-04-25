import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  active: boolean
  maxUses: number
  usedCount: number
  expiresAt: Date | null
  createdAt: Date
}


const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    active: { type: Boolean, default: true },
    maxUses: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'coupons',
  }
)

const CouponModel: Model<ICoupon> =
  mongoose.models.Coupon ?? mongoose.model<ICoupon>('Coupon', CouponSchema)

export default CouponModel
