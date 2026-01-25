import { useMemo, useState } from 'react'
import {
  ComposedChart,
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
import { mockBitcoinData } from '@/data/mockData'

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
  showBitcoinToggle?: boolean
}

export function M2Chart({
  data,
  viewMode,
  showRecessions = true,
  selectedCountries,
  height = 400,
  showBitcoinToggle = true,
}: M2ChartProps) {
  const [showBitcoin, setShowBitcoin] = useState(true)

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Combine all country data into unified date format
    const dateMap = new Map<string, Record<string, string | number>>()

    data.forEach((countryData) => {
      if (selectedCountries && !selectedCountries.includes(countryData.country)) return

      countryData.data.forEach((point) => {
        const existing = dateMap.get(point.date) || { date: point.date }
        if (viewMode === 'absolute') {
          existing[countryData.country] = point.value / 1e12 // Convert to trillions
        } else {
          existing[countryData.country] = point.roc6m
        }
        dateMap.set(point.date, existing as Record<string, string | number>)
      })
    })

    // Add Bitcoin price data
    if (showBitcoin) {
      mockBitcoinData.forEach((btcPoint) => {
        const existing = dateMap.get(btcPoint.date)
        if (existing) {
          existing.BTC = btcPoint.price / 1000 // Convert to thousands for scale
        }
      })
    }

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime()
    )
  }, [data, viewMode, selectedCountries, showBitcoin])

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
    <div>
      {showBitcoinToggle && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShowBitcoin(!showBitcoin)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              showBitcoin
                ? 'bg-amber-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            ₿ BTC
          </button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 60, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            yAxisId="left"
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              viewMode === 'absolute' ? `$${value}T` : `${value.toFixed(1)}%`
            }
            tickMargin={10}
          />
          {showBitcoin && (
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f59e0b"
              tick={{ fontSize: 12, fill: '#f59e0b' }}
              tickFormatter={(value) => `$${value}K`}
              tickMargin={10}
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
              if (typeof value !== 'number') return ['-', String(name)]
              if (name === 'BTC') return [`$${(value * 1000).toLocaleString()}`, 'Bitcoin']
              return [
                viewMode === 'absolute' ? `$${value.toFixed(2)}T` : formatPercent(value),
                String(name),
              ]
            }}
          />
          <Legend />

          {/* Recession shading */}
          {showRecessions &&
            RECESSION_PERIODS.map((recession, idx) => (
              <ReferenceArea
                key={idx}
                yAxisId="left"
                x1={recession.start}
                x2={recession.end}
                fill="var(--color-destructive)"
                fillOpacity={0.1}
                strokeOpacity={0}
              />
            ))}

          {/* Zero line for RoC view */}
          {viewMode === 'roc' && (
            <ReferenceLine yAxisId="left" y={0} stroke="var(--color-muted-foreground)" strokeDasharray="5 5" />
          )}

          {/* 5% threshold line */}
          {viewMode === 'roc' && (
            <ReferenceLine
              yAxisId="left"
              y={5}
              stroke="var(--color-accent)"
              strokeDasharray="3 3"
              label={{ value: '5% threshold', fill: 'var(--color-accent)', fontSize: 10 }}
            />
          )}

          {activeCountries.map((country) => (
            <Line
              key={country}
              yAxisId="left"
              type="monotone"
              dataKey={country}
              stroke={COUNTRY_COLORS[country] || '#888'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}

          {showBitcoin && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="BTC"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              strokeDasharray="5 5"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
