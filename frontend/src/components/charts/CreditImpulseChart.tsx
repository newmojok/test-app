import { useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { formatDateShort } from '@/lib/utils'
import type { CreditImpulseData } from '@/types'

interface CreditImpulseChartProps {
  data: CreditImpulseData[]
  assetData?: { date: string; price: number }[]
  assetName?: string
  lagMonths?: number
  height?: number
}

export function CreditImpulseChart({
  data,
  assetData,
  assetName = 'S&P 500',
  lagMonths = 6,
  height = 400,
}: CreditImpulseChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const dateMap = new Map<string, { date: string; impulse: number; asset?: number }>()

    // Add credit impulse data
    data.forEach((point) => {
      dateMap.set(point.date, {
        date: point.date,
        impulse: point.impulse * 100, // Convert to percentage
      })
    })

    // Add asset data with lag if provided
    if (assetData) {
      assetData.forEach((point) => {
        // Shift the asset date back by lagMonths to align with credit impulse
        const originalDate = new Date(point.date)
        originalDate.setMonth(originalDate.getMonth() - lagMonths)
        const laggedDateStr = originalDate.toISOString().split('T')[0]

        const existing = dateMap.get(laggedDateStr)
        if (existing) {
          existing.asset = point.price
        }
      })
    }

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [data, assetData, lagMonths])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="impulseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-green)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-chart-green)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="impulseNegGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-red)" stopOpacity={0} />
            <stop offset="95%" stopColor="var(--color-chart-red)" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          stroke="var(--color-chart-green)"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value.toFixed(1)}%`}
          label={{
            value: 'Credit Impulse',
            angle: -90,
            position: 'insideLeft',
            style: { fill: 'var(--color-chart-green)', fontSize: 12 },
          }}
        />
        {assetData && (
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="var(--color-chart-blue)"
            tick={{ fontSize: 12 }}
            label={{
              value: `${assetName} (${lagMonths}mo lag)`,
              angle: 90,
              position: 'insideRight',
              style: { fill: 'var(--color-chart-blue)', fontSize: 12 },
            }}
          />
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
          }}
          labelFormatter={(label) => formatDateShort(label)}
          formatter={(value: number, name: string) => {
            if (name === 'impulse') return [`${value.toFixed(2)}%`, 'Credit Impulse']
            return [value.toFixed(2), name]
          }}
        />
        <Legend />

        <ReferenceLine yAxisId="left" y={0} stroke="var(--color-muted-foreground)" strokeDasharray="5 5" />

        <Area
          yAxisId="left"
          type="monotone"
          dataKey="impulse"
          stroke="var(--color-chart-green)"
          fill="url(#impulseGradient)"
          strokeWidth={2}
          name="Credit Impulse"
        />

        {assetData && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="asset"
            stroke="var(--color-chart-blue)"
            strokeWidth={2}
            dot={false}
            name={assetName}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
