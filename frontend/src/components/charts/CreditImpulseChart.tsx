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
import { formatDateQuarterly, formatDateShort, isQuarterStart } from '@/lib/utils'
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

    // Create a map of asset data by year-month for flexible matching
    const assetByMonth = new Map<string, number>()
    if (assetData) {
      assetData.forEach((point) => {
        const key = point.date.substring(0, 7) // "YYYY-MM"
        assetByMonth.set(key, point.price)
      })
    }

    // Build chart data from credit impulse dates
    const result = data.map((point) => {
      const entry: { date: string; impulse: number; asset?: number } = {
        date: point.date,
        impulse: point.impulse * 100, // Convert to percentage
      }

      // Find matching asset data with lag adjustment
      if (assetData && assetByMonth.size > 0) {
        const impulseDate = new Date(point.date)
        // Add lag months to find the future asset price that corresponds to this impulse
        impulseDate.setMonth(impulseDate.getMonth() + lagMonths)
        const assetKey = impulseDate.toISOString().substring(0, 7)
        const assetPrice = assetByMonth.get(assetKey)
        if (assetPrice !== undefined) {
          entry.asset = assetPrice
        }
      }

      return entry
    })

    return result.sort(
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
          tickFormatter={formatDateQuarterly}
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 12 }}
          ticks={chartData.filter((d) => isQuarterStart(d.date)).map((d) => d.date)}
          interval={0}
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
            stroke="#f59e0b"
            tick={{ fontSize: 12, fill: '#f59e0b' }}
            tickFormatter={(value) => assetName === 'Bitcoin' ? `$${(value/1000).toFixed(0)}K` : `${value.toFixed(0)}`}
            label={{
              value: `${assetName} (${lagMonths}mo lag)`,
              angle: 90,
              position: 'insideRight',
              style: { fill: '#f59e0b', fontSize: 12 },
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
          formatter={(value, name) => {
            if (typeof value !== 'number') return ['-', name]
            if (name === 'impulse' || name === 'Credit Impulse') return [`${value.toFixed(2)}%`, 'Credit Impulse']
            if (assetName === 'Bitcoin') return [`$${value.toLocaleString()}`, assetName]
            return [value.toFixed(0), assetName]
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
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name={assetName}
            connectNulls={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
