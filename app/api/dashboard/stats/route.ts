import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'
import SubjectModel from '@/models/Subject'
import TopicModel from '@/models/Topic'
import ConceptModel from '@/models/Concept'
import ContentModel from '@/models/Content'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/stats
 *
 * Public, real-data overview of the entire question bank:
 *  - Counts: subjects, topics, concepts, questions, formulas
 *  - Question distribution by year (last 10 years)
 *  - Question distribution by difficulty
 *  - Subject leaderboard (counts per subject)
 */
export async function GET(_req: NextRequest) {
  try {
    await connectDB()

    const now = new Date()
    const firstYear = now.getFullYear() - 9

    const [
      totalSubjects,
      totalTopics,
      totalConcepts,
      totalQuestions,
      difficultyAgg,
      yearAgg,
      subjectAgg,
      contentDocs,
    ] = await Promise.all([
      SubjectModel.countDocuments({}),
      TopicModel.countDocuments({}),
      ConceptModel.countDocuments({}),
      QuestionModel.countDocuments({}),
      QuestionModel.aggregate([
        { $group: { _id: '$meta.difficulty', count: { $sum: 1 } } },
      ]),
      QuestionModel.aggregate([
        { $match: { 'meta.year': { $gte: firstYear } } },
        { $group: { _id: '$meta.year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      QuestionModel.aggregate([
        { $group: { _id: '$meta.subject', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ContentModel.find({}).select('groups').lean().exec(),
    ])

    // Formula count across all content docs
    let totalFormulas = 0
    for (const d of contentDocs as Array<{ groups?: Array<{ formulas?: unknown[] }> }>) {
      for (const g of d.groups ?? []) {
        totalFormulas += g.formulas?.length ?? 0
      }
    }

    // Build a 10-year window even where DB has no questions
    const yearMap = new Map<number, number>()
    for (const r of yearAgg as Array<{ _id: number; count: number }>) {
      yearMap.set(Number(r._id), r.count)
    }
    const yearSeries: { name: string; total: number }[] = []
    for (let y = firstYear; y <= now.getFullYear(); y++) {
      yearSeries.push({ name: String(y), total: yearMap.get(y) ?? 0 })
    }

    // Difficulty breakdown (lower-cased keys)
    const diff: Record<string, number> = { easy: 0, medium: 0, hard: 0 }
    for (const r of difficultyAgg as Array<{ _id: string; count: number }>) {
      const k = (r._id || 'unknown').toString().toLowerCase()
      diff[k] = (diff[k] ?? 0) + r.count
    }

    const subjectList = (
      subjectAgg as Array<{ _id: string; count: number }>
    )
      .filter((s) => s._id)
      .map((s) => ({ name: s._id, count: s.count }))

    return NextResponse.json(
      {
        totals: {
          subjects: totalSubjects,
          topics: totalTopics,
          concepts: totalConcepts,
          questions: totalQuestions,
          formulas: totalFormulas,
        },
        yearSeries,
        difficulty: diff,
        subjectList,
      },
      { status: 200 }
    )
  } catch (error) {
    const err = error as Error
    console.error('[GET /api/dashboard/stats]', err)
    return NextResponse.json(
      { error: 'Failed to load stats', details: err.message },
      { status: 500 }
    )
  }
}
