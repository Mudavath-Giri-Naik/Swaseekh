import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import SubjectModel from '@/models/Subject'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    const subjects = await SubjectModel.find({}).sort({ order: 1 }).lean().exec()

    return NextResponse.json({ subjects }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/subjects]', error)
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}
