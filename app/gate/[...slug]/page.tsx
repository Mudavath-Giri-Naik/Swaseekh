import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/Breadcrumbs'
import { resolveGateSlug, slugify, SITE_NAME, absoluteUrl } from '@/lib/seo'
import SlugClient from './SlugClient'

export async function generateMetadata({
  params,
}: {
  params: { slug: string[] }
}): Promise<Metadata> {
  const { subject, topic, concept } = await resolveGateSlug(params.slug)

  const title = concept
    ? `${concept.title} — GATE CS Notes & Concepts`
    : topic
    ? `${topic.name} — GATE CS Notes & Concepts`
    : subject
    ? `${subject.name} — GATE CS Syllabus, Topics & Concepts`
    : 'GATE CS Notes & Concepts'

  const name = concept?.title || topic?.name || subject?.name || 'GATE CS'
  const description = `Study ${name}: GATE CS notes, concepts and previous year questions with clear explanations to help you master the topic and ace the GATE exam.`

  const canonical = '/gate/' + params.slug.join('/')

  return {
    title,
    description,
    alternates: { canonical },
  }
}

export default async function GateSlugPage({
  params,
}: {
  params: { slug: string[] }
}) {
  const { subject, topic, concept } = await resolveGateSlug(params.slug)

  const crumbs: { name: string; href: string }[] = [
    { name: 'GATE CS', href: '/gate' },
  ]
  if (subject) {
    crumbs.push({ name: subject.name, href: '/gate/' + slugify(subject.name) })
  }
  if (topic && subject) {
    crumbs.push({
      name: topic.name,
      href: '/gate/' + slugify(subject.name) + '/' + slugify(topic.name),
    })
  }
  if (concept) {
    crumbs.push({ name: concept.title, href: '/gate/' + params.slug.join('/') })
  }

  const heading = concept?.title || topic?.name || subject?.name || 'GATE CS'

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: heading,
    description: `GATE CS notes, concepts and previous year questions on ${heading}.`,
    url: absoluteUrl('/gate/' + params.slug.join('/')),
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
  }

  return (
    <>
      <JsonLd data={courseSchema} />
      <div className="sr-only">
        <Breadcrumbs items={crumbs} />
        <h1>{heading}</h1>
        <p>
          {heading} — GATE CS notes, concepts and previous year questions with
          clear, exam-focused explanations to help you understand the topic and
          prepare for the GATE Computer Science exam.
        </p>
      </div>
      <SlugClient />
    </>
  )
}
