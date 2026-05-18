import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'
import SubjectModel from '@/models/Subject'
import TopicModel from '@/models/Topic'
import ConceptModel from '@/models/Concept'

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

    const q = question as any

    // Handle sub_XX vs sub_0XX mismatch
    const querySubjectId = q.subjectId.match(/^sub_\d{2}$/) 
      ? q.subjectId.replace('sub_', 'sub_0') 
      : q.subjectId

    // Resolve names
    const [subject, topic, concept] = await Promise.all([
      SubjectModel.findOne({ _id: querySubjectId }).lean().exec(),
      TopicModel.findOne({ _id: q.topicId }).lean().exec(),
      ConceptModel.findOne({ _id: q.conceptId }).select('_id title').lean().exec(),
    ])

    const enriched = {
      ...q,
      subjectName: (subject as any)?.name || q.subjectId,
      topicName: (topic as any)?.name || q.topicId,
      conceptName: (concept as any)?.title || q.conceptId,
    }

    return NextResponse.json({ question: enriched }, { status: 200 })
  } catch (error: any) {
    console.error('[GET /api/questions/[id]]', error)
    return NextResponse.json(
      { error: 'Failed to fetch question', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}
