import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId
  razorpayOrderId: string
  razorpayPaymentId: string | null
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed'
  gateway: string
  paidAt: Date | null
  // Coupon fields
  couponCode: string | null
  discountType: 'percentage' | 'fixed' | null
  discountValue: number | null
  originalAmount: number | null
  finalAmount: number | null
  couponUsedAt: Date | null
  createdAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, default: null, unique: true, sparse: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    gateway: { type: String, default: 'razorpay' },
    paidAt: { type: Date, default: null },
    // Coupon tracking
    couponCode: { type: String, default: null },
    discountType: { type: String, enum: ['percentage', 'fixed', null], default: null },
    discountValue: { type: Number, default: null },
    originalAmount: { type: Number, default: null },
    finalAmount: { type: Number, default: null },
    couponUsedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'payments',
  }
)

const PaymentModel: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>('Payment', PaymentSchema)

export default PaymentModel
