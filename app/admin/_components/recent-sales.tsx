'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

interface RecentSale {
  id: string
  amount: number
  paidAt: string | null
  user: { name: string; email: string; image: string }
}

/** Last 5 paid payments, mapped from /api/admin/stats. */
export default function RecentSales({ items }: { items: RecentSale[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No sales recorded yet.
      </p>
    )
  }
  return (
    <div className="space-y-6">
      {items.map((s) => (
        <div key={s.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            {s.user.image && <AvatarImage src={s.user.image} alt={s.user.name} />}
            <AvatarFallback>{initials(s.user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-wrap items-center justify-between gap-x-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-none">
                {s.user.name}
              </p>
              <p className="text-xs text-muted-foreground">{s.user.email}</p>
            </div>
            <div className="text-sm font-semibold">
              +{INR.format(s.amount)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}
