import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import QuestionModel from '@/models/Question'

export const dynamic = 'force-dynamic'

const GA = 'General Aptitude'

/**
 * GET /api/mock-tests/[year]
 * Returns the full paper for one GATE year, structured into sections
 * (Technical + General Aptitude) with numbered questions ready for the
 * exam runner. Includes structured options/correctOptions/stem (added
 * additively to each question doc) plus the rich solution for review.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { year: string } }
) {
  try {
    await connectDB()
    const year = parseInt(params.year, 10)
    if (!Number.isFinite(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const docs = await QuestionModel.find({ 'meta.year': year }).lean().exec()
    if (!docs.length) {
      return NextResponse.json({ error: 'No questions for this year' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = docs.map((d: any) => {
      const rawType = d.meta?.type || 'MCQ'
      const options = Array.isArray(d.options) ? d.options : []
      const correctOptions = Array.isArray(d.correctOptions) ? d.correctOptions : []
      // A choice question with >1 correct option behaves as a multiple-select
      // (MSQ): checkboxes, set-match scoring, no negative marking.
      const type = options.length && correctOptions.length > 1 ? 'MSQ' : rawType
      return {
        id: d.id,
        type,
        marks: d.meta?.marks ?? 1,
        difficulty: d.meta?.difficulty || 'medium',
        subject: d.meta?.subject || '',
        topic: d.meta?.subtopic || d.meta?.topic || '',
        stem: (d.stem && d.stem.length ? d.stem : d.question) || '',
        options,
        correctOptions,
        isNat: !d.subjective && (!!d.isNat || rawType === 'NAT' || (options.length === 0 && type !== 'MSQ')),
        subjective: !!d.subjective,
        excluded: !!d.excluded,
        answer: d.answer || '',
        solution: d.solution || null,
        understand: d.understand || null,
        given: d.given || null,
        to_find: d.to_find || '',
        formula_ids_used: d.formula_ids_used || [],
      }
    })

    // GATE structure: Technical section first, General Aptitude second.
    const tech = mapped.filter((q) => q.subject !== GA).sort((a, b) => a.subject.localeCompare(b.subject))
    const ga = mapped.filter((q) => q.subject === GA)
    const ordered = [...tech, ...ga]
    ordered.forEach((q, i) => ((q as { no?: number }).no = i + 1))

    const sections = [
      { name: 'Technical', questions: ordered.filter((q) => q.subject !== GA) },
      { name: 'General Aptitude', questions: ordered.filter((q) => q.subject === GA) },
    ].filter((s) => s.questions.length)

    const totalMarks = mapped.reduce((s, q) => s + (q.marks || 0), 0)

    return NextResponse.json(
      { year, totalQuestions: mapped.length, totalMarks, durationMin: 180, sections },
      { status: 200 }
    )
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = error as any
    console.error('[GET /api/mock-tests/[year]]', e)
    return NextResponse.json({ error: 'Failed to load paper', details: e.message }, { status: 500 })
  }
}
