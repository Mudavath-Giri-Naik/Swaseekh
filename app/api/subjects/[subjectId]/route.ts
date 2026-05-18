import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SubjectModel from '@/models/Subject'
import TopicModel from '@/models/Topic'
import ConceptModel from '@/models/Concept'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    await connectDB()

    const decodedId = decodeURIComponent(params.subjectId)
    let subject = await SubjectModel.findOne({ 
      $or: [{ _id: decodedId }, { name: decodedId }] 
    }).lean().exec()

    if (!subject) {
      // Fallback: fetch all and match by slug
      const allSubjects = await SubjectModel.find({}).lean().exec()
      subject = allSubjects.find(s => slugify(s.name) === decodedId) || null
    }

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      )
    }

    // Fetch all topics for this subject, sorted by order
    const topics = await TopicModel.find({ subjectId: subject._id })
      .sort({ order: 1 })
      .lean()
      .exec()

    // Fetch all concepts for this subject, sorted by order
    const concepts = await ConceptModel.find({ subjectId: subject._id })
      .sort({ order: 1 })
      .lean()
      .exec()

    // Group concepts under their topics
    const conceptsByTopic: Record<string, typeof concepts> = {}
    for (const concept of concepts) {
      const tid = concept.topicId
      if (!conceptsByTopic[tid]) conceptsByTopic[tid] = []
      conceptsByTopic[tid].push(concept)
    }

    // Build nested response
    const topicsWithConcepts = topics.map((topic) => ({
      ...topic,
      concepts: conceptsByTopic[topic._id as string] || [],
    }))

    return NextResponse.json(
      {
        subject,
        topics: topicsWithConcepts,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GET /api/subjects/[subjectId]]', error)
    return NextResponse.json(
      { error: 'Failed to fetch subject data' },
      { status: 500 }
    )
  }
}
