import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { getSeoMockYears, itemListSchema } from '@/lib/seo'
import MockTestsClient from './MockTestsClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'GATE CS Mock Tests — Year-wise Full Exam Simulation (2015–2025)',
  description:
    'Attempt full-length, year-wise GATE Computer Science mock tests with a real exam timer, all sections and detailed step-by-step solutions for every previous year.',
  alternates: { canonical: '/mock-tests' },
}

export default async function MockTestsPage() {
  const years = await getSeoMockYears()

  const listSchema = itemListSchema(
    'GATE CS Mock Tests',
    years.map((y) => ({
      name: 'GATE CS ' + y + ' Mock Test',
      path: '/mock-tests/' + y,
    })),
  )

  return (
    <>
      <JsonLd data={listSchema} />
      <div className="sr-only">
        <h2>GATE CS Mock Tests</h2>
        <p>
          Attempt full-length, year-wise GATE Computer Science mock tests with an exam timer, all
          sections and detailed solutions.
        </p>
        <ul>
          {years.map((y) => (
            <li key={y}>
              <a href={'/mock-tests/' + y}>GATE CS {y} Mock Test</a>
            </li>
          ))}
        </ul>
      </div>
      <MockTestsClient />
    </>
  )
}
