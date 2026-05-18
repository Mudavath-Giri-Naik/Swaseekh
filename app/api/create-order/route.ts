import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/models/User'
import PaymentModel from '@/models/Payment'
import CouponModel from '@/models/Coupon'
import Razorpay from 'razorpay'

export const dynamic = 'force-dynamic'

// Initialize Razorpay (server-side only)
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Base plan price in INR
const BASE_PRICE_INR = 999

/**
 * POST /api/create-order
 * 
 * Flow:
 * 1. Authenticate user via session
 * 2. Validate optional coupon from MongoDB (not hardcoded)
 * 3. Calculate final price after discount
 * 4. Create Razorpay order with final amount
 * 5. Insert pending payment record with coupon snapshot
 * 6. Return order details to client
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized — please sign in' }, { status: 401 })
    }

    await connectDB()

    // 2. Find user in DB
    const user = await UserModel.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Block if already on active pro plan
    if (user.plan === 'pro' && user.subscriptionStatus === 'active') {
      return NextResponse.json({ error: 'Already on Pro plan' }, { status: 400 })
    }

    // 4. Parse optional coupon and validate from DB
    let couponCode: string | null = null
    let discountType: 'percentage' | 'fixed' | null = null
    let discountValue: number | null = null
    let discountAmount = 0
    let finalPriceINR = BASE_PRICE_INR

    try {
      const body = await request.json()
      if (body.couponCode && typeof body.couponCode === 'string') {
        const code = body.couponCode.trim().toUpperCase()

        // Validate coupon from database
        const coupon = await CouponModel.findOne({ code })

        if (coupon && coupon.active) {
          // Check expiry
          const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date()
          // Check usage limit
          const hasCapacity = coupon.usedCount < coupon.maxUses

          if (notExpired && hasCapacity) {
            couponCode = coupon.code
            discountType = coupon.discountType
            discountValue = coupon.discountValue

            // Calculate discount
            if (coupon.discountType === 'percentage') {
              discountAmount = Math.round(BASE_PRICE_INR * coupon.discountValue / 100)
            } else {
              discountAmount = Math.min(coupon.discountValue, BASE_PRICE_INR)
            }

            finalPriceINR = Math.max(0, BASE_PRICE_INR - discountAmount)
          }
        }
        // If coupon is invalid/expired/exhausted, proceed without discount
      }
    } catch {
      // No body or invalid JSON — proceed without coupon
    }

    // 5. Handle 100% discount (0 amount)
    if (finalPriceINR === 0) {
      const orderId = `free_${Date.now()}`
      
      // Insert paid payment record
      await PaymentModel.create({
        userId: user._id,
        razorpayOrderId: orderId,
        razorpayPaymentId: `free_payment_${orderId}`,
        amount: 0,
        currency: 'INR',
        status: 'paid',
        gateway: 'free',
        couponCode,
        discountType,
        discountValue,
        originalAmount: BASE_PRICE_INR,
        finalAmount: 0,
        couponUsedAt: couponCode ? new Date() : null,
        paidAt: new Date(),
      })

      // Upgrade user
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 365)

      await UserModel.findOneAndUpdate(
        { email: session.user.email },
        {
          plan: 'pro',
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
        }
      )

      // Increment coupon usage
      if (couponCode) {
        await CouponModel.findOneAndUpdate(
          { code: couponCode },
          { $inc: { usedCount: 1 } }
        )
      }

      return NextResponse.json({ isZeroAmount: true })
    }

    // 6. Convert to paise for Razorpay
    const amountPaise = finalPriceINR * 100

    // 7. Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `sw_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        email: user.email,
        plan: 'pro',
        couponCode: couponCode || 'none',
      },
    })

    // 8. Insert pending payment record with coupon snapshot
    await PaymentModel.create({
      userId: user._id,
      razorpayOrderId: order.id,
      razorpayPaymentId: `pending_${order.id}`, // Temp unique ID to prevent E11000 dup key on null
      amount: finalPriceINR,
      currency: 'INR',
      status: 'pending',
      gateway: 'razorpay',
      // Coupon snapshot — preserved even if coupon is later deleted/modified
      couponCode,
      discountType,
      discountValue,
      originalAmount: BASE_PRICE_INR,
      finalAmount: finalPriceINR,
      couponUsedAt: couponCode ? new Date() : null,
    })

    // 9. Return order details to client
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('[POST /api/create-order]', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
