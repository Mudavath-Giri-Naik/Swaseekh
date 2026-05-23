import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ContentModel from '@/models/Content'

export const dynamic = 'force-dynamic'

/**
 * GET /api/content/[conceptId]
 *
 * Returns the long-form content document for a given concept. The lookup
 * accepts the conceptId in either form:
 *   - matches the `conceptId` field directly (e.g. "con_010")
 *   - matches the `_id` field (some docs use the conceptId as their _id)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { conceptId: string } }
) {
  try {
    await connectDB()

    const id = decodeURIComponent(params.conceptId)

    const content = await ContentModel.findOne({
      $or: [{ conceptId: id }, { _id: id }],
    })
      .lean()
      .exec()

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ content }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/content/[conceptId]]', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
