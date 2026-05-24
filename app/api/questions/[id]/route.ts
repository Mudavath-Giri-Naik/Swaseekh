import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'
import { enrichQuestion } from '@/lib/enrich-question'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    // Use findOne with _id string match instead of findById (which casts to ObjectId)
    const question = await QuestionModel.findOne({ _id: params.id })
      .lean()
      .exec()

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Re-use the same enricher the list API uses — flattens meta.* into
    // backwards-compatible top-level fields (year, marks, subjectName, etc.)
    const enriched = enrichQuestion(question)

    return NextResponse.json({ question: enriched }, { status: 200 })
  } catch (error: any) {
    console.error('[GET /api/questions/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to fetch question', details: error.message },
      { status: 500 }
    )
  }
}
