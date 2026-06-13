import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import AptitudeFormulaModel from '@/models/AptitudeFormula'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const conceptSlug = searchParams.get('concept')
    const tag = searchParams.get('tag')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (conceptSlug) query.conceptSlug = conceptSlug
    if (tag) query.tags = tag

    const formulas = await AptitudeFormulaModel.find(query)
      .sort({ formulaId: 1 })
      .lean()
      .exec()

    return NextResponse.json({ formulas }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/aptitude/formulas]', error)
    return NextResponse.json({ error: 'Failed to fetch formulas' }, { status: 500 })
  }
}
