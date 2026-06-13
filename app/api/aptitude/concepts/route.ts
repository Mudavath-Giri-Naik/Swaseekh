import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import AptitudeConceptModel from '@/models/AptitudeConcept'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    const concepts = await AptitudeConceptModel.find({}).sort({ conceptId: 1 }).lean().exec()
    return NextResponse.json({ concepts }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/aptitude/concepts]', error)
    return NextResponse.json({ error: 'Failed to fetch aptitude concepts' }, { status: 500 })
  }
}
