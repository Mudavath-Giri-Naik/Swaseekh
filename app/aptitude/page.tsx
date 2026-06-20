import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { itemListSchema, getSeoAptitudeConcepts } from '@/lib/seo'
import AptitudeClient from './AptitudeClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Quantitative Aptitude Practice — Questions with Solutions for GATE & Placements',
  description:
    'Practice quantitative aptitude with step-by-step solutions, key formulas and time-saving shortcuts. Solved RS Agarwal and IndiaBix questions for GATE and placements.',
  alternates: { canonical: '/aptitude' },
}

export default async function AptitudePage() {
  const conceptsRows = await getSeoAptitudeConcepts()
  const concepts = conceptsRows as unknown as any[]

  return (
    <>
      <JsonLd
        data={itemListSchema(
          'Quantitative Aptitude Chapters',
          concepts.map((c: any) => ({ name: c.name, path: '/aptitude/' + c.slug }))
        )}
      />
      <div className="sr-only">
        <h1>Quantitative Aptitude Practice Hub</h1>
        <p>
          Practice quantitative aptitude with step-by-step solutions, key formulas and time-saving shortcuts.
        </p>
        <ul>
          {concepts.map((c: any) => (
            <li key={c.slug}>
              <a href={'/aptitude/' + c.slug}>{c.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <AptitudeClient />
    </>
  )
}
