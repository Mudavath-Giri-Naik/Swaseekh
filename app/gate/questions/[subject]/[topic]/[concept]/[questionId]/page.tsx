import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/Breadcrumbs'
import { getSeoQuestion, questionPath, truncate } from '@/lib/seo'
import QuestionDetailClient from './QuestionDetailClient'

type P = {
  params: {
    subject: string
    topic: string
    concept: string
    questionId: string
  }
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const q = await getSeoQuestion(params.questionId)

  const fallbackPath =
    '/gate/questions/' +
    params.subject +
    '/' +
    params.topic +
    '/' +
    params.concept +
    '/' +
    params.questionId

  if (!q) {
    return {
      title: 'GATE CS Previous Year Question',
      description:
        'Solve this GATE Computer Science previous year question with a clear step-by-step solution and explanation on Swaseekh.',
      alternates: { canonical: fallbackPath },
    }
  }

  const title =
    truncate(q.question || q.to_find || 'GATE CS Question', 55).trim() +
    (q.meta?.year ? ` — GATE ${q.meta.year}` : '')

  const description =
    [q.meta?.subject, q.meta?.subtopic].filter(Boolean).join(' · ') +
    ' — ' +
    truncate(q.question || '', 120)

  const canonical = questionPath({ _id: params.questionId, meta: q.meta })

  return {
    title,
    description,
    alternates: { canonical },
  }
}

export default async function Page({ params }: P) {
  const q = await getSeoQuestion(params.questionId)

  const answerText = q ? q.solution?.result || q.answer || '' : ''

  const questionSchema =
    q && answerText
      ? {
          '@context': 'https://schema.org',
          '@type': 'Question',
          name: truncate(q.question || 'GATE CS Question', 120),
          text: q.question,
          answerCount: 1,
          ...(q.meta?.year ? { dateCreated: String(q.meta.year) } : {}),
          acceptedAnswer: {
            '@type': 'Answer',
            text: answerText + (q.understand?.plain ? ' ' + q.understand.plain : ''),
          },
        }
      : null

  const schemas = questionSchema ? [questionSchema] : []

  const crumbs = [
    { name: 'GATE CS', href: '/gate' },
    { name: 'PYQs', href: '/gate/questions' },
    {
      name: q?.meta?.subject || 'Question',
      href: q ? questionPath({ _id: params.questionId, meta: q.meta }) : '#',
    },
  ]

  return (
    <>
      {schemas.length > 0 && <JsonLd data={schemas} />}
      <div className="sr-only">
        <Breadcrumbs items={crumbs} />
        <h1>{q?.question || 'GATE CS Previous Year Question'}</h1>
        {q && (
          <p>
            GATE {q.meta?.year} · {q.meta?.subject} · {q.meta?.subtopic} ·{' '}
            {q.meta?.difficulty}
          </p>
        )}
        {answerText && <p>Answer: {answerText}</p>}
        {q?.solution?.steps?.length ? (
          <ol>
            {q.solution.steps.map((st, i) => (
              <li key={i}>
                {st.title}
                {st.apply ? ': ' + st.apply : ''}
              </li>
            ))}
          </ol>
        ) : null}
      </div>
      <QuestionDetailClient />
    </>
  )
}
