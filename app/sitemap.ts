import type { MetadataRoute } from 'next'
import {
  absoluteUrl,
  slugify,
  getSeoSubjectTree,
  getSeoAptitudeConcepts,
  getSeoMockYears,
  getSeoQuestionsForSitemap,
  questionPath,
} from '@/lib/seo'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const [tree, aptitudeConcepts, mockYears, questions] = await Promise.all([
    getSeoSubjectTree(),
    getSeoAptitudeConcepts(),
    getSeoMockYears(),
    getSeoQuestionsForSitemap(),
  ])

  const entries: MetadataRoute.Sitemap = []

  // ─── Static routes ──────────────────────────────────────────────────────
  const staticRoutes: {
    path: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/gate', priority: 0.9, changeFrequency: 'daily' },
    { path: '/gate/questions', priority: 0.9, changeFrequency: 'daily' },
    { path: '/aptitude', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/mock-tests', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/pricing', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/refund-policy', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'monthly' },
  ]
  for (const r of staticRoutes) {
    entries.push({
      url: absoluteUrl(r.path),
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })
  }

  // ─── GATE subjects ──────────────────────────────────────────────────────
  for (const subject of tree.subjects) {
    entries.push({
      url: absoluteUrl(`/gate/${slugify(subject.name)}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // ─── GATE concepts (subject/topic/concept) ──────────────────────────────
  const subjectById = new Map(tree.subjects.map((s) => [s._id, s]))
  const topicById = new Map(tree.topics.map((t) => [t._id, t]))
  for (const concept of tree.concepts) {
    const subject = subjectById.get(concept.subjectId)
    const topic = topicById.get(concept.topicId)
    if (!subject || !topic) continue
    entries.push({
      url: absoluteUrl(
        `/gate/${slugify(subject.name)}/${slugify(topic.name)}/${slugify(concept.title)}`
      ),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  // ─── Aptitude concepts ──────────────────────────────────────────────────
  for (const c of aptitudeConcepts) {
    entries.push({
      url: absoluteUrl(`/aptitude/${c.slug}`),
      lastModified: c.updatedAt ?? now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  // ─── Mock-test years ────────────────────────────────────────────────────
  for (const year of mockYears) {
    entries.push({
      url: absoluteUrl(`/mock-tests/${year}`),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    })
  }

  // ─── Question detail pages ──────────────────────────────────────────────
  for (const q of questions) {
    entries.push({
      url: absoluteUrl(questionPath(q)),
      lastModified: q.updatedAt ?? now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  // ─── De-dup by url (first occurrence wins) ──────────────────────────────
  const seen = new Set<string>()
  return entries.filter((e) => {
    if (seen.has(e.url)) return false
    seen.add(e.url)
    return true
  })
}
