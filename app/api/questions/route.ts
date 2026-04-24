import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)

    const subtopicId = searchParams.get('subtopicId')
    const topicId = searchParams.get('topicId')
    const subjectId = searchParams.get('subjectId')
    const year = searchParams.get('year')
    const difficulty = searchParams.get('difficulty')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)

    // Build query object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}

    if (subtopicId) query['taxonomy.subtopicId'] = subtopicId
    else if (topicId) query['taxonomy.topicId'] = topicId
    else if (subjectId) query['taxonomy.subjectId'] = subjectId

    if (year) query['examMeta.year'] = parseInt(year, 10)
    if (difficulty) query['difficulty'] = difficulty
    if (type) query['questionType'] = type

    const skip = (page - 1) * limit

    const [questions, total] = await Promise.all([
      QuestionModel.find(query)
        .select('-embedding -searchText')
        .sort({ 'examMeta.year': -1, 'examMeta.questionNumber': 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      QuestionModel.countDocuments(query),
    ])

    return NextResponse.json(
      {
        questions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GET /api/questions]', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}
