import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import AptitudeConceptModel from '@/models/AptitudeConcept'
import AptitudeFormulaModel from '@/models/AptitudeFormula'
import AptitudeModelModel from '@/models/AptitudeModel'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB()
    const { slug } = params

    const [concept, formulas, models] = await Promise.all([
      AptitudeConceptModel.findOne({ slug }).lean().exec(),
      AptitudeFormulaModel.find({ conceptSlug: slug }).sort({ formulaId: 1 }).lean().exec(),
      AptitudeModelModel.find({ conceptSlug: slug }).sort({ modelId: 1 }).lean().exec(),
    ])

    if (!concept) {
      return NextResponse.json({ error: 'Concept not found' }, { status: 404 })
    }

    return NextResponse.json({ concept, formulas, models }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/aptitude/concepts/[slug]]', error)
    return NextResponse.json({ error: 'Failed to fetch concept' }, { status: 500 })
  }
}
