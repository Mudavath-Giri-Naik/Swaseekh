'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

/**
 * Bars use `currentColor` so they pick up the surrounding text color,
 * which Tailwind toggles via `text-foreground` (dark = near-white,
 * light = near-black). Tooltip styles use CSS vars so they switch too.
 */
export default function YearChart({
  data,
}: {
  data: { name: string; total: number }[]
}) {
  return (
    <div className="text-foreground">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="currentColor"
            opacity={0.55}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="currentColor"
            opacity={0.55}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'currentColor', opacity: 0.06 }}
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 8,
              fontSize: 12,
              color: 'hsl(var(--popover-foreground))',
            }}
            formatter={(v: number) => [`${v} questions`, 'Total']}
          />
          <Bar
            dataKey="total"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
