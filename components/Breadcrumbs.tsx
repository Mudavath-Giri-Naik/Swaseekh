/**
 * Breadcrumbs — visual breadcrumb trail + BreadcrumbList JSON-LD.
 *
 * Server-safe (no hooks / no 'use client'). Pass the full trail including the
 * current page as the LAST item; the last item renders as plain text (not a
 * link) but is still included in the structured data with its canonical URL.
 *
 * Styling intentionally mirrors the existing muted/foreground design tokens so
 * it blends with the current UI. It is rendered inside the server SEO shell on
 * content pages.
 */
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import JsonLd from './JsonLd'
import { breadcrumbSchema } from '@/lib/seo'

export interface Crumb {
  name: string
  href: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items.length) return null

  return (
    <>
      <JsonLd data={breadcrumbSchema(items.map((i) => ({ name: i.name, path: i.href })))} />
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
          {items.map((item, i) => {
            const isLast = i === items.length - 1
            return (
              <li key={`${item.href}-${i}`} className="flex items-center gap-1.5">
                {isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="transition-colors hover:text-foreground">
                    {item.name}
                  </Link>
                )}
                {!isLast && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
