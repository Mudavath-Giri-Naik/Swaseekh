import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'

export const dynamic = 'force-dynamic'

/**
 * GET /api/formulas/question-counts?conceptId=con_010
 *
 * Returns a map of { [formulaId]: count } for questions whose
 * `formulaIds` array contains each formula ID. If a conceptId is
 * provided the counts are scoped to that concept's questions.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const conceptId = searchParams.get('conceptId')

    // Build an aggregation pipeline:
    // 1. Optionally filter by conceptId
    // 2. Unwind formulaIds
    // 3. Group by formulaId and count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = []

    if (conceptId) {
      // `conceptId` here is the URL-decoded meta.topic name in the new schema
      pipeline.push({ $match: { 'meta.topic': conceptId } })
    }

    // Only include documents that have at least one formula_ids_used
    pipeline.push({
      $match: { formula_ids_used: { $exists: true, $ne: [] } },
    })
    pipeline.push({ $unwind: '$formula_ids_used' })
    pipeline.push({
      $group: {
        _id: '$formula_ids_used',
        count: { $sum: 1 },
      },
    })

    const results = await QuestionModel.aggregate(pipeline).exec()

    const counts: Record<string, number> = {}
    for (const r of results) {
      counts[r._id] = r.count
    }

    return NextResponse.json(counts, { status: 200 })
  } catch (error) {
    console.error('[GET /api/formulas/question-counts]', error)
    return NextResponse.json(
      { error: 'Failed to compute question counts' },
      { status: 500 }
    )
  }
}
