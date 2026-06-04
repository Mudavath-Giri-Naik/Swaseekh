'use client'

import Link from 'next/link'
import { slugify } from '@/lib/utils'

export default function SubjectList({
  items,
  total,
}: {
  items: { name: string; count: number }[]
  total: number
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No subjects yet.
      </p>
    )
  }
  const max = Math.max(...items.map((i) => i.count))
  return (
    <ul className="space-y-3">
      {items.map((s) => {
        const pct = total > 0 ? (s.count / total) * 100 : 0
        const bar = max > 0 ? (s.count / max) * 100 : 0
        return (
          <li key={s.name}>
            <Link
              href={`/gate/questions?subject=${encodeURIComponent(s.name)}`}
              className="block rounded-md p-2 transition-colors hover:bg-accent"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {s.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {s.count} · {pct.toFixed(0)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground"
                  style={{ width: `${bar}%` }}
                />
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
