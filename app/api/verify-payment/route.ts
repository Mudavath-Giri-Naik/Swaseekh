import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/models/User'
import PaymentModel from '@/models/Payment'
import CouponModel from '@/models/Coupon'
import crypto from 'crypto'

/**
 * POST /api/verify-payment
 * 
 * Flow:
 * 1. Authenticate user
 * 2. Verify Razorpay signature using HMAC SHA256
 * 3. Prevent duplicate processing
 * 4. Update payment record → status="paid"
 * 5. Upgrade user → plan="pro", 30-day subscription
 * 6. Increment coupon usedCount if coupon was applied
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // 2. Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      console.error('[verify-payment] Signature mismatch')
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    await connectDB()

    // 3. Duplicate protection
    const existingPayment = await PaymentModel.findOne({
      razorpayPaymentId: razorpay_payment_id,
      status: 'paid',
    })
    if (existingPayment) {
      return NextResponse.json({ success: true, message: 'Payment already processed' })
    }

    // 4. Update payment record: mark as paid
    const updatedPayment = await PaymentModel.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        paidAt: new Date(),
      },
      { new: true }
    )

    if (!updatedPayment) {
      console.error('[verify-payment] Payment record not found for order:', razorpay_order_id)
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // 5. Upgrade user to Pro with 30-day subscription
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await UserModel.findOneAndUpdate(
      { email: session.user.email },
      {
        plan: 'pro',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expiresAt,
      }
    )

    // 6. Increment coupon usedCount if a coupon was used
    if (updatedPayment.couponCode) {
      await CouponModel.findOneAndUpdate(
        { code: updatedPayment.couponCode },
        { $inc: { usedCount: 1 } }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified — plan upgraded to Pro',
    })
  } catch (error) {
    console.error('[POST /api/verify-payment]', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
