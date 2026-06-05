'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/** Real monthly revenue series — uses `currentColor` so bars switch with theme. */
export default function RevenueChart({
  data,
}: {
  data: { name: string; total: number }[]
}) {
  return (
    <div className="text-foreground">
      <ResponsiveContainer width="100%" height={320}>
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
            tickFormatter={(value) =>
              Number(value) >= 1000
                ? `₹${(Number(value) / 1000).toFixed(0)}k`
                : `₹${Number(value)}`
            }
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
            formatter={(value: number | string | readonly (number | string)[] | undefined) => [
              `₹${Number(value).toLocaleString('en-IN')}`,
              'Revenue',
            ]}
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