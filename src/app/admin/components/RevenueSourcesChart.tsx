import React from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts'

interface Slice { name: string; value: number }
const COLORS = ['#4F46E5', '#10B981', '#3B82F6', '#F59E0B']

export function RevenueSourcesChart({ data }: { data: Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius="80%"
          label={({ name, percent }) =>
            `${name} ${(percent! * 100).toFixed(0)}%`
          }
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  )
}
