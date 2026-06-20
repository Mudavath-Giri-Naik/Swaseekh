/**
 * lib/seo.ts — SERVER-ONLY read-only helpers for SEO.
 *
 * IMPORTANT: This module imports mongoose models and connectDB. It must only
 * ever be imported from Server Components / generateMetadata / sitemap / robots
 * — never from a 'use client' file.
 *
 * Every DB helper here is strictly READ-ONLY and independent of the app's
 * existing data-fetching code (API routes / client fetches). It does NOT reuse
 * or alter any existing fetch function — it issues its own lean() queries used
 * solely to generate metadata, JSON-LD and the sitemap. None of these helpers
 * change query shape, filters, sort, pagination or behaviour of the live app.
 */
import { connectDB } from '@/lib/mongodb'
import SubjectModel from '@/models/Subject'
import TopicModel from '@/models/Topic'
import ConceptModel from '@/models/Concept'
import QuestionModel from '@/models/Question'
import AptitudeConceptModel from '@/models/AptitudeConcept'
import { slugify, truncate } from '@/lib/utils'

export { slugify, truncate }

// ─── Site constants ─────────────────────────────────────────────────────────

export const SITE_URL = 'https://swaseekh.in'
export const SITE_NAME = 'Swaseekh'
export const SITE_TAGLINE = 'GATE CS Preparation, Decoded.'

/** Join a path onto the canonical origin. Accepts '/foo' or 'foo'. */
export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

// ─── Lightweight read-only types ────────────────────────────────────────────

export interface SeoSubject {
  _id: string
  name: string
  code: string
  section: string
  order: number
}

export interface SeoTopic {
  _id: string
  subjectId: string
  name: string
  order: number
}

export interface SeoConcept {
  _id: string
  subjectId: string
  topicId: string
  title: string
  order: number
}

export interface SeoQuestionMeta {
  exam?: string
  year?: number
  marks?: number
  difficulty?: string
  type?: string
  subject?: string
  topic?: string
  subtopic?: string
}

export interface SeoQuestion {
  _id: string
  id?: string
  meta?: SeoQuestionMeta
  question?: string
  answer?: string
  to_find?: string
  understand?: { plain?: string }
  solution?: { result?: string; steps?: { title?: string; apply?: string }[] }
  updatedAt?: Date
}

export interface SeoAptitudeConcept {
  conceptId: string
  name: string
  slug: string
  description: string
  totalQuestions: number
  totalFormulas: number
  totalModels: number
  updatedAt?: Date
}

// ─── Read-only data fetchers (all fail-soft) ────────────────────────────────

export async function getSeoSubjects(): Promise<SeoSubject[]> {
  try {
    await connectDB()
    const rows = await SubjectModel.find({})
      .select('name code section order')
      .sort({ order: 1 })
      .lean()
    return rows as unknown as SeoSubject[]
  } catch {
    return []
  }
}

export interface SeoSubjectTree {
  subjects: SeoSubject[]
  topics: SeoTopic[]
  concepts: SeoConcept[]
}

export async function getSeoSubjectTree(): Promise<SeoSubjectTree> {
  try {
    await connectDB()
    const [subjects, topics, concepts] = await Promise.all([
      SubjectModel.find({}).select('name code section order').sort({ order: 1 }).lean(),
      TopicModel.find({}).select('subjectId name order').sort({ order: 1 }).lean(),
      ConceptModel.find({}).select('subjectId topicId title order').sort({ order: 1 }).lean(),
    ])
    return {
      subjects: subjects as unknown as SeoSubject[],
      topics: topics as unknown as SeoTopic[],
      concepts: concepts as unknown as SeoConcept[],
    }
  } catch {
    return { subjects: [], topics: [], concepts: [] }
  }
}

/**
 * Resolve a /gate/[...slug] path (subject / topic / concept slugs) to the
 * matching documents, mirroring the slugify() resolution the client UI uses.
 */
export async function resolveGateSlug(
  slug: string[]
): Promise<{ subject: SeoSubject | null; topic: SeoTopic | null; concept: SeoConcept | null }> {
  const empty = { subject: null, topic: null, concept: null }
  try {
    await connectDB()
    const subjects = (await SubjectModel.find({})
      .select('name code section order')
      .lean()) as unknown as SeoSubject[]
    const subject =
      subjects.find((s) => slugify(s.name) === slug[0]) ??
      subjects.find((s) => s._id === slug[0]) ??
      null
    if (!subject) return empty

    let topic: SeoTopic | null = null
    let concept: SeoConcept | null = null

    if (slug[1]) {
      const topics = (await TopicModel.find({ subjectId: subject._id })
        .select('subjectId name order')
        .lean()) as unknown as SeoTopic[]
      topic = topics.find((t) => slugify(t.name) === slug[1]) ?? null
    }

    if (slug[2] && topic) {
      const concepts = (await ConceptModel.find({ subjectId: subject._id, topicId: topic._id })
        .select('subjectId topicId title order')
        .lean()) as unknown as SeoConcept[]
      concept = concepts.find((c) => slugify(c.title) === slug[2]) ?? null
    }

    return { subject, topic, concept }
  } catch {
    return empty
  }
}

export async function getSeoQuestion(id: string): Promise<SeoQuestion | null> {
  try {
    await connectDB()
    const q = await QuestionModel.findOne({ $or: [{ _id: id }, { id }] }).lean()
    return (q as unknown as SeoQuestion) ?? null
  } catch {
    return null
  }
}

/** Minimal projection of every question, for building sitemap URLs. */
export async function getSeoQuestionsForSitemap(): Promise<SeoQuestion[]> {
  try {
    await connectDB()
    const rows = await QuestionModel.find({})
      .select('meta.subject meta.subtopic meta.topic meta.year updatedAt')
      .lean()
    return rows as unknown as SeoQuestion[]
  } catch {
    return []
  }
}

export async function getSeoAptitudeConcepts(): Promise<SeoAptitudeConcept[]> {
  try {
    await connectDB()
    const rows = await AptitudeConceptModel.find({})
      .select('conceptId name slug description totalQuestions totalFormulas totalModels updatedAt')
      .sort({ conceptId: 1 })
      .lean()
    return rows as unknown as SeoAptitudeConcept[]
  } catch {
    return []
  }
}

export async function getSeoAptitudeConcept(slug: string): Promise<SeoAptitudeConcept | null> {
  try {
    await connectDB()
    const c = await AptitudeConceptModel.findOne({ slug })
      .select('conceptId name slug description totalQuestions totalFormulas totalModels updatedAt')
      .lean()
    return (c as unknown as SeoAptitudeConcept) ?? null
  } catch {
    return null
  }
}

/** Distinct GATE years present in the questions collection (descending). */
export async function getSeoMockYears(): Promise<number[]> {
  try {
    await connectDB()
    const years = (await QuestionModel.distinct('meta.year')) as (number | null)[]
    return years
      .filter((y): y is number => typeof y === 'number')
      .sort((a, b) => b - a)
  } catch {
    return []
  }
}

// ─── URL builders ───────────────────────────────────────────────────────────

/**
 * Build a question-detail path identical to the one the in-app list links to:
 *   /gate/questions/{subjectSlug}/{topicSlug}/{conceptSlug}/{_id}
 * where the display hierarchy is meta.subject > meta.subtopic > meta.topic
 * (see lib/enrich-question.ts).
 */
export function questionPath(q: { _id: string; meta?: SeoQuestionMeta }): string {
  const m = q.meta ?? {}
  return `/gate/questions/${slugify(m.subject ?? '')}/${slugify(m.subtopic ?? '')}/${slugify(
    m.topic ?? ''
  )}/${q._id}`
}

// ─── JSON-LD schema builders ────────────────────────────────────────────────

export type Schema = Record<string, unknown>

export function organizationSchema(): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
    description:
      'Swaseekh is a focused GATE Computer Science (CS) exam-preparation platform with previous year questions, mock tests and concept notes.',
  }
}

export function websiteSchema(): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/gate/questions?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  }
}

export function itemListSchema(name: string, items: { name: string; path: string }[]): Schema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  }
}
