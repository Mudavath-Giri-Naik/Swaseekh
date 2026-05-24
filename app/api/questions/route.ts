import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'

export const dynamic = 'force-dynamic'

/**
 * GET /api/questions
 *
 * The schema is now nested under `meta` / `solution` / `understand` / etc.
 * This handler:
 *   1. Accepts both the new query params (subject, topic, subtopic, year,
 *      difficulty, type, formula) and the legacy ones (subjectId, topicId,
 *      conceptId, difficulty, type) — legacy params are mapped onto the
 *      corresponding `meta.*` fields.
 *   2. Flattens the nested doc into a backwards-compatible response shape
 *      so existing list/sort/route code keeps working (subjectName,
 *      topicName, conceptName, year, marks, questionText, etc.).
 *
 * Mapping note: the new schema uses meta.subject > meta.subtopic > meta.topic
 * which corresponds to the old subject > topic > concept hierarchy.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '1000', 10)

    // Build query against the new nested fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}

    const subject = searchParams.get('subject') ?? searchParams.get('subjectId')
    const subtopic = searchParams.get('subtopic') ?? searchParams.get('topicId')
    const topic = searchParams.get('topic') ?? searchParams.get('conceptId')
    const year = searchParams.get('year')
    const difficulty = searchParams.get('difficulty')
    const type = searchParams.get('type')
    const formula = searchParams.get('formula')

    if (subject) query['meta.subject'] = subject
    if (subtopic) query['meta.subtopic'] = subtopic
    if (topic) query['meta.topic'] = topic
    if (year) query['meta.year'] = parseInt(year, 10)
    if (difficulty) query['meta.difficulty'] = difficulty
    if (type) query['meta.type'] = type
    if (formula) query['formula_ids_used'] = formula

    const skip = (page - 1) * limit

    const [docs, total] = await Promise.all([
      QuestionModel.find(query)
        .sort({ 'meta.year': -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      QuestionModel.countDocuments(query),
    ])

    const questions = docs.map((q) => enrichQuestion(q))

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

/* ─── Flatten nested doc → list-friendly shape ──────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function enrichQuestion(q: any) {
  const meta = q.meta ?? {}
  const formulaIds: string[] = Array.isArray(q.formula_ids_used)
    ? q.formula_ids_used
    : []
  const primaryFormulaId =
    Array.isArray(q.solution?.steps) && q.solution.steps.length > 0
      ? q.solution.steps[0]?.formula_id ?? null
      : formulaIds[0] ?? null

  return {
    ...q,
    // Backwards-compatible flattened fields
    year: meta.year,
    marks: meta.marks,
    difficulty: meta.difficulty,
    questionType: meta.type,
    questionText: q.question,
    correctAnswer: q.answer,
    formulaId: primaryFormulaId,
    formulaIds,
    // Display-name aliases — keep the same URL hierarchy as before:
    //   subject > topic > concept  ==  meta.subject > meta.subtopic > meta.topic
    subjectName: meta.subject ?? '',
    topicName: meta.subtopic ?? '',
    conceptName: meta.topic ?? '',
  }
}
