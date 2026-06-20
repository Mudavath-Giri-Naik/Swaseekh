import type { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import MockTestYearClient from './MockTestYearClient'

type P = { params: { year: string } }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const year = params.year
  return {
    title: `GATE CS ${year} Mock Test — Full Exam with Timer & Solutions`,
    description: `Attempt the full-length GATE CS ${year} mock test online with a real exam timer, all sections, instant scoring, and detailed step-by-step solutions to every question.`,
    alternates: { canonical: '/mock-tests/' + year },
  }
}

export default async function Page({ params }: P) {
  const year = params.year
  const crumbs = [
    { name: 'Mock Tests', href: '/mock-tests' },
    { name: 'GATE CS ' + year, href: '/mock-tests/' + year },
  ]
  return (
    <>
      <div className="sr-only">
        <Breadcrumbs items={crumbs} />
        <h1>GATE CS {year} Mock Test</h1>
        <p>
          Full-length GATE Computer Science {year} mock test with an exam timer,
          all sections, and detailed step-by-step solutions.
        </p>
      </div>
      <MockTestYearClient params={params} />
    </>
  )
}
