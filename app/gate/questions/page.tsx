import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { getSeoSubjectTree, slugify, itemListSchema } from '@/lib/seo'
import QuestionsClient from './QuestionsClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'GATE CS Previous Year Questions (1989–2025) — 2000+ PYQs with Solutions',
  description:
    'Browse 2000+ GATE CS previous year questions from 1989–2025, filterable by subject, topic, year, difficulty and type, each with detailed step-by-step solutions.',
  alternates: { canonical: '/gate/questions' },
}

export default async function Page() {
  const { subjects } = await getSeoSubjectTree()

  const listSchema = itemListSchema(
    'GATE CS Subjects',
    subjects.map((s) => ({ name: s.name, path: '/gate/' + slugify(s.name) }))
  )

  return (
    <>
      <JsonLd data={listSchema} />
      <div className="sr-only">
        <h1>GATE CS Previous Year Questions (PYQs)</h1>
        <p>
          Browse 2000+ GATE Computer Science previous year questions from 1989–2025
          with detailed step-by-step solutions, filterable by subject, topic, year,
          difficulty and question type.
        </p>
        <h2>Subjects</h2>
        <ul>
          {subjects.map((s) => (
            <li key={s._id}>
              <a href={'/gate/' + slugify(s.name)}>{s.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <QuestionsClient />
    </>
  )
}
