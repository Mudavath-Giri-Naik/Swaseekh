import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import AptitudeQuestionModel from '@/models/AptitudeQuestion'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const conceptSlug = searchParams.get('concept')
    const modelId = searchParams.get('model')
    const source = searchParams.get('source')
    const difficulty = searchParams.get('difficulty')
    const tag = searchParams.get('tag')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (conceptSlug) query.conceptSlug = conceptSlug
    if (modelId) query.modelId = modelId
    if (source) query.source = source
    if (difficulty) query.difficulty = difficulty
    if (tag) query.tags = tag

    const skip = (page - 1) * limit

    const [docs, total] = await Promise.all([
      AptitudeQuestionModel.find(query)
        .sort({ questionId: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      AptitudeQuestionModel.countDocuments(query),
    ])

    return NextResponse.json(
      { questions: docs, total, page, limit, totalPages: Math.ceil(total / limit) },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GET /api/aptitude/questions]', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}
