import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import AptitudeModelModel from '@/models/AptitudeModel'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    const models = await AptitudeModelModel.find({}, {
      modelId: 1,
      conceptSlug: 1,
      name: 1,
      description: 1
    })
      .lean()
      .exec()

    return NextResponse.json({ models }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/aptitude/models]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
