import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'
import SubjectModel from '@/models/Subject'
import TopicModel from '@/models/Topic'
import ConceptModel from '@/models/Concept'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)

    const subjectId = searchParams.get('subjectId')
    const topicId = searchParams.get('topicId')
    const conceptId = searchParams.get('conceptId')
    const year = searchParams.get('year')
    const difficulty = searchParams.get('difficulty')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '1000', 10)

    // Build query object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}

    if (conceptId) query['conceptId'] = conceptId
    else if (topicId) query['topicId'] = topicId
    else if (subjectId) query['subjectId'] = subjectId

    if (year) query['year'] = parseInt(year, 10)
    if (difficulty) query['difficulty'] = difficulty
    if (type) query['questionType'] = type

    const skip = (page - 1) * limit

    const [questions, total] = await Promise.all([
      QuestionModel.find(query)
        .sort({ year: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      QuestionModel.countDocuments(query),
    ])

    // Resolve names from IDs
    const subjectIds = questions.map((q: any) => q.subjectId).filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
    const topicIds = questions.map((q: any) => q.topicId).filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
    const conceptIds = questions.map((q: any) => q.conceptId).filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)

    // Handle sub_XX vs sub_0XX mismatch
    const querySubjectIds = subjectIds.flatMap((id: string) => {
      if (id.match(/^sub_\d{2}$/)) return [id, id.replace('sub_', 'sub_0')]
      return [id]
    })

    const [subjects, topics, concepts] = await Promise.all([
      SubjectModel.find({ _id: { $in: querySubjectIds } }).lean().exec(),
      TopicModel.find({ _id: { $in: topicIds } }).lean().exec(),
      ConceptModel.find({ _id: { $in: conceptIds } }).select('_id title').lean().exec(),
    ])

    const subjectMap: Record<string, string> = {}
    subjects.forEach((s: any) => { 
      subjectMap[s._id] = s.name 
      // Also map the original unpadded ID (sub_0XX -> sub_XX)
      if (s._id.match(/^sub_0\d{2}$/)) {
        subjectMap[s._id.replace('sub_0', 'sub_')] = s.name
      }
    })

    const topicMap: Record<string, string> = {}
    topics.forEach((t: any) => { topicMap[t._id] = t.name })

    const conceptMap: Record<string, string> = {}
    concepts.forEach((c: any) => { conceptMap[c._id] = c.title })

    // Enrich questions with resolved names
    const enrichedQuestions = questions.map((q: any) => ({
      ...q,
      subjectName: subjectMap[q.subjectId] || q.subjectId,
      topicName: topicMap[q.topicId] || q.topicId,
      conceptName: conceptMap[q.conceptId] || q.conceptId,
    }))

    return NextResponse.json(
      {
        questions: enrichedQuestions,
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
