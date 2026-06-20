import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { getSeoSubjectTree, slugify, itemListSchema } from '@/lib/seo'
import GateClient from './GateClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'GATE CS Syllabus — Complete Subject-wise Topics & Concepts',
  description:
    'The complete GATE CS syllabus mapped to previous-year questions across every subject, topic and concept — covering all sections for focused GATE 2026 prep.',
  alternates: { canonical: '/gate' },
}

export default async function Page() {
  const { subjects, topics, concepts } = await getSeoSubjectTree()

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'GATE CS Syllabus',
    description:
      'Complete GATE Computer Science and Information Technology syllabus mapped to previous-year questions across all subjects, topics and concepts.',
    provider: {
      '@type': 'Organization',
      name: 'Swaseekh',
      sameAs: 'https://swaseekh.in',
    },
  }

  const listSchema = itemListSchema(
    'GATE CS Subjects',
    subjects.map((s) => ({ name: s.name, path: '/gate/' + slugify(s.name) })),
  )

  return (
    <>
      <JsonLd data={[courseSchema, listSchema]} />
      <div className="sr-only">
        <h1>GATE CS Syllabus</h1>
        <p>
          The complete GATE Computer Science and Information Technology syllabus,
          organised subject-wise into topics and concepts and mapped to
          previous-year questions for GATE 2026 preparation.
        </p>
        {subjects.map((s) => (
          <section key={s._id}>
            <h2>
              <a href={'/gate/' + slugify(s.name)}>{s.name}</a>
            </h2>
            <ul>
              {concepts
                .filter((c) => c.subjectId === s._id)
                .map((c) => {
                  const t = topics.find((tp) => tp._id === c.topicId)
                  return (
                    <li key={c._id}>
                      <a
                        href={
                          t
                            ? '/gate/' +
                              slugify(s.name) +
                              '/' +
                              slugify(t.name) +
                              '/' +
                              slugify(c.title)
                            : '/gate/' + slugify(s.name)
                        }
                      >
                        {c.title}
                      </a>
                    </li>
                  )
                })}
            </ul>
          </section>
        ))}
      </div>
      <GateClient />
    </>
  )
}
