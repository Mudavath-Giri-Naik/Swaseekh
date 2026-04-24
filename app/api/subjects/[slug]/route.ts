import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SubjectModel from '@/models/Subject'
import QuestionModel from '@/models/Question'

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB()
    const subject = await SubjectModel.findOne({ slug: params.slug }).lean().exec()
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    // Get real, accurate counts directly from the questions collection
    const counts = await QuestionModel.aggregate([
      { $match: { 'taxonomy.subjectId': subject.slug } },
      {
        $group: {
          _id: { topicId: '$taxonomy.topicId', subtopicId: '$taxonomy.subtopicId' },
          count: { $sum: 1 },
        },
      },
    ])

    let totalSubjectCount = 0
    const topicCountMap: Record<string, number> = {}
    const subtopicCountMap: Record<string, number> = {}

    for (const group of counts) {
      const tId = group._id.topicId
      const sId = group._id.subtopicId
      const c = group.count

      totalSubjectCount += c
      topicCountMap[tId] = (topicCountMap[tId] || 0) + c
      if (sId) {
        subtopicCountMap[sId] = (subtopicCountMap[sId] || 0) + c
      }
    }

    // Apply accurate counts to the response object
    subject.questionCount = totalSubjectCount
    if (subject.topics) {
      for (const topic of subject.topics) {
        topic.questionCount = topicCountMap[topic.slug] || 0
        if (topic.subtopics) {
          for (const sub of topic.subtopics) {
            sub.questionCount = subtopicCountMap[sub.slug] || 0
          }
        }
      }
    }

    return NextResponse.json({ subject }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/subjects/[slug]]', error)
    return NextResponse.json(
      { error: 'Failed to fetch subject' },
      { status: 500 }
    )
  }
}
