import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts'
import { formatDateShort, formatPercent } from '@/lib/utils'
import type { M2CountryData, RecessionPeriod } from '@/types'

const COUNTRY_COLORS: Record<string, string> = {
  US: '#3b82f6',
  CN: '#ef4444',
  EU: '#22c55e',
  JP: '#f97316',
  UK: '#8b5cf6',
}

const RECESSION_PERIODS: RecessionPeriod[] = [
  { start: '2020-02-01', end: '2020-04-01', name: 'COVID-19' },
  { start: '2007-12-01', end: '2009-06-01', name: 'Great Recession' },
  { start: '2001-03-01', end: '2001-11-01', name: 'Dot-com' },
]

interface M2ChartProps {
  data: M2CountryData[]
  viewMode: 'absolute' | 'roc'
  showRecessions?: boolean
  selectedCountries?: string[]
  height?: number
}

export function M2Chart({
  data,
  viewMode,
  showRecessions = true,
  selectedCountries,
  height = 400,
}: M2ChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Combine all country data into unified date format
    const dateMap = new Map<string, Record<string, number>>()

    data.forEach((countryData) => {
      if (selectedCountries && !selectedCountries.includes(countryData.country)) return

      countryData.data.forEach((point) => {
        const existing = dateMap.get(point.date) || { date: point.date }
        if (viewMode === 'absolute') {
          existing[countryData.country] = point.value / 1e12 // Convert to trillions
        } else {
          existing[countryData.country] = point.roc6m
        }
        dateMap.set(point.date, existing)
      })
    })

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [data, viewMode, selectedCountries])

  const activeCountries = useMemo(() => {
    return data
      .filter((c) => !selectedCountries || selectedCountries.includes(c.country))
      .map((c) => c.country)
  }, [data, selectedCountries])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) =>
            viewMode === 'absolute' ? `$${value}T` : `${value.toFixed(1)}%`
          }
          tickMargin={10}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
          }}
          labelFormatter={(label) => formatDateShort(label)}
          formatter={(value: number, name: string) => [
            viewMode === 'absolute' ? `$${value.toFixed(2)}T` : formatPercent(value),
            name,
          ]}
        />
        <Legend />

        {/* Recession shading */}
        {showRecessions &&
          RECESSION_PERIODS.map((recession, idx) => (
            <ReferenceArea
              key={idx}
              x1={recession.start}
              x2={recession.end}
              fill="var(--color-destructive)"
              fillOpacity={0.1}
              strokeOpacity={0}
            />
          ))}

        {/* Zero line for RoC view */}
        {viewMode === 'roc' && (
          <ReferenceLine y={0} stroke="var(--color-muted-foreground)" strokeDasharray="5 5" />
        )}

        {/* 5% threshold line */}
        {viewMode === 'roc' && (
          <ReferenceLine
            y={5}
            stroke="var(--color-accent)"
            strokeDasharray="3 3"
            label={{ value: '5% threshold', fill: 'var(--color-accent)', fontSize: 10 }}
          />
        )}

        {activeCountries.map((country) => (
          <Line
            key={country}
            type="monotone"
            dataKey={country}
            stroke={COUNTRY_COLORS[country] || '#888'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
