'use client'

import { useEffect, useState } from 'react'
import ConceptFormulaSheet, {
  type FormulaSheetDoc,
} from '@/components/concept/ConceptFormulaSheet'

interface Props {
  conceptId: string
}

type Status = 'loading' | 'ready' | 'empty' | 'error'

/**
 * Lazy fetcher for per-concept content used inside the subject syllabus
 * page. If the concept has a populated content document (with the
 * formula-sheet shape) it embeds <ConceptFormulaSheet inline />.
 * Otherwise it falls back to the standard "Coming soon..." note that
 * matches the syllabus's existing typography.
 */
export default function ConceptInline({ conceptId }: Props) {
  const [content, setContent] = useState<FormulaSheetDoc | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (!conceptId) return
    let cancelled = false
    setStatus('loading')
    setContent(null)

    fetch(`/api/content/${encodeURIComponent(conceptId)}`)
      .then(async (res) => {
        if (res.status === 404) return { content: null }
        if (!res.ok) throw new Error('fetch-failed')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        const doc = data?.content as FormulaSheetDoc | null
        // Only treat as "ready" if the doc actually contains formula-sheet data
        const hasShape =
          !!doc &&
          (Array.isArray(doc.groups) || !!doc.decisionGuide)
        if (hasShape) {
          setContent(doc)
          setStatus('ready')
        } else {
          setStatus('empty')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [conceptId])

  if (status === 'loading') {
    return <p className="doc-coming-soon">Loading…</p>
  }
  if (status === 'ready' && content) {
    return <ConceptFormulaSheet content={content} inline />
  }
  // empty or error → preserve the original syllabus placeholder copy
  return <p className="doc-coming-soon">Coming soon...</p>
}
