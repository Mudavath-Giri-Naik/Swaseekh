import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import PaymentModel from '@/models/Payment'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Find the latest paid payment for this user
    const payment = await PaymentModel.findOne({
      userId: (session.user as any).id,
      status: 'paid',
    }).sort({ paidAt: -1 }).lean()

    if (!payment) {
      return NextResponse.json({ error: 'No successful payment found' }, { status: 404 })
    }

    const userModelImport = await import('@/models/User')
    const UserModel = userModelImport.default
    const dbUser = await UserModel.findById((session.user as any).id).lean()

    return NextResponse.json({ 
      payment, 
      subscriptionExpiresAt: dbUser?.subscriptionExpiresAt 
    })
  } catch (error) {
    console.error('[GET /api/my-payment]', error)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}
