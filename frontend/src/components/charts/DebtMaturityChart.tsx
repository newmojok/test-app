import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { QuarterlyMaturity } from '@/types'

interface DebtMaturityChartProps {
  data: QuarterlyMaturity[]
  height?: number
  highlightThreshold?: number
}

export function DebtMaturityChart({
  data,
  height = 400,
  highlightThreshold = 500,
}: DebtMaturityChartProps) {
  const chartData = useMemo(() => {
    if (!data) return []
    return data.map((q) => ({
      ...q,
      isHighlighted: q.total >= highlightThreshold,
    }))
  }, [data, highlightThreshold])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
        <XAxis
          dataKey="quarter"
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value}B`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => [
            formatCurrency(value * 1e9),
            name === 'sovereign' ? 'Sovereign' : name === 'igCorp' ? 'IG Corporate' : 'HY Corporate',
          ]}
        />
        <Legend />

        <ReferenceLine
          y={highlightThreshold}
          stroke="var(--color-destructive)"
          strokeDasharray="5 5"
          label={{
            value: `$${highlightThreshold}B threshold`,
            fill: 'var(--color-destructive)',
            fontSize: 10,
          }}
        />

        <Bar dataKey="sovereign" stackId="a" fill="var(--color-chart-blue)" name="Sovereign">
          {chartData.map((entry, index) => (
            <Cell
              key={`sovereign-${index}`}
              fill={entry.isHighlighted ? 'var(--color-chart-blue)' : 'var(--color-chart-blue)'}
              opacity={entry.isHighlighted ? 1 : 0.7}
            />
          ))}
        </Bar>
        <Bar dataKey="igCorp" stackId="a" fill="var(--color-chart-green)" name="IG Corporate">
          {chartData.map((entry, index) => (
            <Cell
              key={`igCorp-${index}`}
              fill={entry.isHighlighted ? 'var(--color-chart-green)' : 'var(--color-chart-green)'}
              opacity={entry.isHighlighted ? 1 : 0.7}
            />
          ))}
        </Bar>
        <Bar dataKey="hyCorp" stackId="a" fill="var(--color-chart-yellow)" name="HY Corporate">
          {chartData.map((entry, index) => (
            <Cell
              key={`hyCorp-${index}`}
              fill={entry.isHighlighted ? 'var(--color-chart-yellow)' : 'var(--color-chart-yellow)'}
              opacity={entry.isHighlighted ? 1 : 0.7}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
