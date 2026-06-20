import type { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import { getSeoAptitudeConcept, truncate } from '@/lib/seo'
import AptitudeConceptClient from './AptitudeConceptClient'

type P = { params: { conceptSlug: string } }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const c = await getSeoAptitudeConcept(params.conceptSlug)
  return {
    title: c ? `${c.name} Aptitude Questions` : 'Aptitude Questions',
    description: c?.description
      ? truncate(c.description, 155)
      : 'Practice aptitude questions with step-by-step solutions, formulas and shortcuts.',
    alternates: { canonical: '/aptitude/' + params.conceptSlug },
  }
}

export default async function Page({ params }: P) {
  const c = await getSeoAptitudeConcept(params.conceptSlug)
  const crumbs = [
    { name: 'Aptitude', href: '/aptitude' },
    { name: c?.name || params.conceptSlug, href: '/aptitude/' + params.conceptSlug },
  ]
  return (
    <>
      <div className="sr-only">
        <Breadcrumbs items={crumbs} />
        <h1>{(c?.name || params.conceptSlug)} Aptitude Questions</h1>
        {c?.description && <p>{c.description}</p>}
        {c && (
          <p>
            {c.totalQuestions} practice questions · {c.totalFormulas} formulas · {c.totalModels} models.
          </p>
        )}
      </div>
      <AptitudeConceptClient />
    </>
  )
}
