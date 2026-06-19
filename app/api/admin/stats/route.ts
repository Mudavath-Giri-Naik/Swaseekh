import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { isAdminEmail } from '@/lib/admin'
import UserModel from '@/models/User'
import PaymentModel from '@/models/Payment'
import QuestionModel from '@/models/Question'
import SubjectModel from '@/models/Subject'
import TopicModel from '@/models/Topic'
import ConceptModel from '@/models/Concept'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/stats
 *
 * Returns real aggregated stats for the admin dashboard. Requires the
 * caller's email to be in `ADMIN_EMAILS`.
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await connectDB()

    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      proUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      paidPayments,
      paidThisMonth,
      paidLastMonth,
      activeNow,
      dailyActive,
      totalQuestions,
      totalSubjects,
      totalTopics,
      totalConcepts,
      recentPayments,
      monthlyRevenueRaw,
      planBreakdown,
      allUsers,
    ] = await Promise.all([
      UserModel.countDocuments({}),
      UserModel.countDocuments({ plan: 'pro' }),
      UserModel.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      UserModel.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      PaymentModel.find({ status: 'paid' })
        .sort({ paidAt: -1 })
        .lean()
        .exec(),
      PaymentModel.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      PaymentModel.aggregate([
        {
          $match: {
            status: 'paid',
            paidAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      UserModel.countDocuments({ lastLoginAt: { $gte: oneHourAgo } }),
      UserModel.countDocuments({ lastLoginAt: { $gte: oneDayAgo } }),
      QuestionModel.countDocuments({}),
      SubjectModel.countDocuments({}),
      TopicModel.countDocuments({}),
      ConceptModel.countDocuments({}),
      // Last 5 paid payments with user info
      PaymentModel.find({ status: 'paid' })
        .sort({ paidAt: -1 })
        .limit(5)
        .populate('userId', 'name email image')
        .lean()
        .exec(),
      // Monthly revenue for the last 12 months
      PaymentModel.aggregate([
        {
          $match: {
            status: 'paid',
            paidAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              y: { $year: '$paidAt' },
              m: { $month: '$paidAt' },
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ]),
      UserModel.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
      UserModel.find({})
        .select('name email image plan createdAt lastLoginAt')
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ])

    // ── Total revenue ───────────────────────────────────────────────
    // Sum across ALL paid payments (in paise/INR — depends on stored unit)
    const totalRevenue = paidPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    )
    const revenueThisMonth = (paidThisMonth[0]?.total as number) ?? 0
    const revenueLastMonth = (paidLastMonth[0]?.total as number) ?? 0
    const salesThisMonth = (paidThisMonth[0]?.count as number) ?? 0
    const salesLastMonth = (paidLastMonth[0]?.count as number) ?? 0

    // ── Format monthly revenue series for the bar chart ─────────────
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    // Build a 12-month rolling window from `now`
    const revenueByKey = new Map<string, number>()
    for (const row of monthlyRevenueRaw as Array<{
      _id: { y: number; m: number }
      total: number
    }>) {
      revenueByKey.set(`${row._id.y}-${row._id.m}`, row.total)
    }
    const series: { name: string; total: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const k = `${d.getFullYear()}-${d.getMonth() + 1}`
      series.push({
        name: months[d.getMonth()],
        total: revenueByKey.get(k) ?? 0,
      })
    }

    // ── Plan breakdown ──────────────────────────────────────────────
    const planMap: Record<string, number> = {}
    for (const row of planBreakdown as Array<{ _id: string; count: number }>) {
      planMap[row._id ?? 'free'] = row.count
    }

    // ── Recent sales (formatted for the UI list) ───────────────────
    type LeanPayment = {
      _id: unknown
      amount: number
      paidAt: Date | null
      userId: {
        _id: unknown
        name?: string
        email?: string
        image?: string
      } | null
    }
    const recentSales = (recentPayments as unknown as LeanPayment[]).map((p) => ({
      id: String(p._id),
      amount: p.amount,
      paidAt: p.paidAt,
      user: p.userId
        ? {
            name: p.userId.name ?? '—',
            email: p.userId.email ?? '',
            image: p.userId.image ?? '',
          }
        : { name: 'Unknown user', email: '', image: '' },
    }))

    const usersList = (allUsers as any[]).map((u) => ({
      id: String(u._id),
      name: u.name || 'Unknown',
      email: u.email || '',
      image: u.image || '',
      plan: u.plan || 'free',
      createdAt: u.createdAt ? u.createdAt.toISOString() : null,
      lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    }))

    return NextResponse.json(
      {
        totals: {
          revenue: totalRevenue,
          revenueThisMonth,
          revenueLastMonth,
          users: totalUsers,
          newUsersThisMonth,
          newUsersLastMonth,
          proUsers,
          salesThisMonth,
          salesLastMonth,
          activeNow,
          dailyActive,
          questions: totalQuestions,
          subjects: totalSubjects,
          topics: totalTopics,
          concepts: totalConcepts,
        },
        planBreakdown: planMap,
        monthlyRevenue: series,
        recentSales,
        allUsers: usersList,
      },
      { status: 200 }
    )
  } catch (error) {
    const err = error as Error
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json(
      { error: 'Failed to load stats', details: err.message },
      { status: 500 }
    )
  }
}
