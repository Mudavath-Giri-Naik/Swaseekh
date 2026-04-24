import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SubjectModel from '@/models/Subject'
import QuestionModel from '@/models/Question'

export async function GET() {
  try {
    await connectDB()
    const subjects = await SubjectModel.find({}).lean().exec()

    // Dynamically calculate accurate total question counts for each subject
    const counts = await QuestionModel.aggregate([
      {
        $group: {
          _id: '$taxonomy.subjectId',
          count: { $sum: 1 },
        },
      },
    ])

    const countMap: Record<string, number> = {}
    for (const group of counts) {
      if (group._id) {
        countMap[group._id] = group.count
      }
    }

    // Assign accurate counts
    for (const subject of subjects) {
      subject.questionCount = countMap[subject.slug] || 0
    }

    return NextResponse.json({ subjects }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/subjects]', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}
