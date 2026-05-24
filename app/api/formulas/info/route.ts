import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ContentModel from '@/models/Content'

export const dynamic = 'force-dynamic'

/**
 * GET /api/formulas/info
 *
 * Returns a flat map of every formula found in the content collection,
 * keyed by formulaId:
 *
 *   { "product-rule": { name, latex, plain }, … }
 *
 * Used by the question detail / list pages to power formula hover
 * previews without needing to know which concept a formula lives in.
 *
 * The result is small (a few KB per concept) so we don't paginate.
 */
export async function GET(_req: NextRequest) {
  try {
    await connectDB()

    const docs = await ContentModel.find({})
      .select('groups')
      .lean()
      .exec()

    const info: Record<string, { name?: string; latex?: string; plain?: string }> = {}
    for (const d of docs as Array<{ groups?: Array<{ formulas?: Array<Record<string, unknown>> }> }>) {
      for (const group of d.groups ?? []) {
        for (const f of group.formulas ?? []) {
          const id = f.formulaId as string | undefined
          if (!id) continue
          info[id] = {
            name: f.name as string | undefined,
            latex: f.latex as string | undefined,
            plain: f.plain as string | undefined,
          }
        }
      }
    }

    return NextResponse.json(info, { status: 200 })
  } catch (error) {
    console.error('[GET /api/formulas/info]', error)
    return NextResponse.json(
      { error: 'Failed to fetch formula info' },
      { status: 500 }
    )
  }
}
