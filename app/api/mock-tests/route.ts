import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mock-tests
 * Lists every GATE year present in the questions collection (descending),
 * with question counts, total marks and a type breakdown. Read-only.
 */
export async function GET() {
  try {
    await connectDB()

    const agg = await QuestionModel.aggregate([
      {
        $group: {
          _id: '$meta.year',
          totalQuestions: { $sum: 1 },
          totalMarks: { $sum: { $ifNull: ['$meta.marks', 0] } },
          mcq: { $sum: { $cond: [{ $eq: ['$meta.type', 'MCQ'] }, 1, 0] } },
          msq: { $sum: { $cond: [{ $eq: ['$meta.type', 'MSQ'] }, 1, 0] } },
          nat: { $sum: { $cond: [{ $eq: ['$meta.type', 'NAT'] }, 1, 0] } },
          subjects: { $addToSet: '$meta.subject' },
        },
      },
      { $sort: { _id: -1 } },
    ])

    const years = agg
      .filter((y) => y._id != null)
      .map((y) => ({
        year: y._id as number,
        totalQuestions: y.totalQuestions as number,
        totalMarks: y.totalMarks as number,
        durationMin: 180,
        typeCounts: { MCQ: y.mcq as number, MSQ: y.msq as number, NAT: y.nat as number },
        subjectCount: (y.subjects ?? []).filter(Boolean).length,
      }))

    return NextResponse.json({ years }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/mock-tests]', error)
    return NextResponse.json({ error: 'Failed to load mock tests' }, { status: 500 })
  }
}
