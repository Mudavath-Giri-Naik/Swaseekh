import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import CouponModel from '@/models/Coupon'

const BASE_PRICE = 999

/**
 * POST /api/validate-coupon
 * 
 * Validates a coupon code against the database and returns
 * the discount details. Used by the pricing page UI.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = (body.code || '').trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ error: 'Please enter a coupon code' }, { status: 400 })
    }

    await connectDB()

    // Look up coupon in DB
    const coupon = await CouponModel.findOne({ code }).lean()

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
    }

    if (!coupon.active) {
      return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round(BASE_PRICE * coupon.discountValue / 100)
    } else {
      discountAmount = Math.min(coupon.discountValue, BASE_PRICE)
    }

    const finalPrice = Math.max(0, BASE_PRICE - discountAmount)

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      originalPrice: BASE_PRICE,
      finalPrice,
      label: coupon.discountType === 'percentage'
        ? `${coupon.discountValue}% off`
        : `₹${coupon.discountValue} off`,
    })
  } catch (error) {
    console.error('[POST /api/validate-coupon]', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
