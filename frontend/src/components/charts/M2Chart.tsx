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
  ReferenceDot,
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

// Key inflection points where M2 signaled BTC moves
const INFLECTION_POINTS = [
  { date: '2016-06-01', label: 'BTC rally', type: 'bullish' },
  { date: '2019-01-01', label: 'BTC bottom', type: 'bullish' },
  { date: '2020-04-01', label: 'QE signal', type: 'bullish' },
  { date: '2022-01-01', label: 'BTC top', type: 'bearish' },
  { date: '2023-10-01', label: 'BTC rally', type: 'bullish' },
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
  const [btcLag, setBtcLag] = useState(3) // Default 3 month lag (BTC follows M2)
  const [btcViewMode, setBtcViewMode] = useState<'price' | 'yoy'>('yoy')
  const [showSignals, setShowSignals] = useState(true)

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

    // Add Bitcoin data with lag adjustment
    if (showBitcoin) {
      // Create a map of BTC data by year-month for flexible matching
      const btcByMonth = new Map<string, { price: number; yoyChange?: number }>()
      mockBitcoinData.forEach((btcPoint) => {
        const key = btcPoint.date.substring(0, 7) // "YYYY-MM"
        btcByMonth.set(key, { price: btcPoint.price, yoyChange: btcPoint.yoyChange })
      })

      // Apply BTC data to chart with lag
      dateMap.forEach((entry, dateStr) => {
        const entryDate = new Date(dateStr)
        // Subtract lag months to get the BTC data point that should align here
        entryDate.setMonth(entryDate.getMonth() - btcLag)
        const btcKey = entryDate.toISOString().substring(0, 7)
        const btcData = btcByMonth.get(btcKey)

        if (btcData) {
          if (btcViewMode === 'yoy' && btcData.yoyChange !== undefined) {
            entry.BTC = btcData.yoyChange / 10 // Scale down YoY to fit chart
          } else if (btcViewMode === 'price') {
            entry.BTC = btcData.price / 1000 // Price in thousands
          } else if (btcData.yoyChange === undefined && btcViewMode === 'yoy') {
            // For first year without YoY data, skip
          }
        }
      })
    }

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime()
    )
  }, [data, viewMode, selectedCountries, showBitcoin, btcLag, btcViewMode])

  const activeCountries = useMemo(() => {
    return data
      .filter((c) => !selectedCountries || selectedCountries.includes(c.country))
      .map((c) => c.country)
  }, [data, selectedCountries])

  // Find inflection points that are in view
  const visibleInflections = useMemo(() => {
    if (!showSignals) return []
    const dates = chartData.map(d => String(d.date))
    return INFLECTION_POINTS.filter(ip => dates.includes(ip.date))
  }, [chartData, showSignals])

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
        <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
          <button
            onClick={() => setShowSignals(!showSignals)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              showSignals
                ? 'bg-purple-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Signals
          </button>
          <button
            onClick={() => setShowBitcoin(!showBitcoin)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              showBitcoin
                ? 'bg-amber-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            ₿ BTC
          </button>
          {showBitcoin && (
            <>
              <select
                value={btcViewMode}
                onChange={(e) => setBtcViewMode(e.target.value as 'price' | 'yoy')}
                className="px-2 py-1 text-xs rounded-md bg-muted border border-border"
              >
                <option value="yoy">YoY %</option>
                <option value="price">Price</option>
              </select>
              <select
                value={btcLag}
                onChange={(e) => setBtcLag(parseInt(e.target.value))}
                className="px-2 py-1 text-xs rounded-md bg-muted border border-border"
              >
                <option value="0">No lag</option>
                <option value="3">BTC +3mo lag</option>
                <option value="6">BTC +6mo lag</option>
                <option value="9">BTC +9mo lag</option>
              </select>
            </>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 30, right: 60, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 11 }}
            tickMargin={10}
          />
          <YAxis
            yAxisId="left"
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 11 }}
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
              tick={{ fontSize: 11, fill: '#f59e0b' }}
              tickFormatter={(value) =>
                btcViewMode === 'yoy' ? `${(value * 10).toFixed(0)}%` : `$${value}K`
              }
              tickMargin={10}
              label={{
                value: btcViewMode === 'yoy' ? `BTC YoY% (${btcLag}mo lag)` : `BTC Price (${btcLag}mo lag)`,
                angle: 90,
                position: 'insideRight',
                style: { fill: '#f59e0b', fontSize: 10 },
                offset: 10,
              }}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelFormatter={(label) => formatDateShort(label)}
            formatter={(value, name) => {
              if (typeof value !== 'number') return ['-', String(name)]
              if (name === 'BTC') {
                if (btcViewMode === 'yoy') {
                  return [`${(value * 10).toFixed(1)}% YoY`, 'Bitcoin']
                }
                return [`$${(value * 1000).toLocaleString()}`, 'Bitcoin']
              }
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

          {/* Inflection point signals */}
          {showSignals && visibleInflections.map((ip, idx) => (
            <ReferenceLine
              key={idx}
              yAxisId="left"
              x={ip.date}
              stroke={ip.type === 'bullish' ? '#22c55e' : '#ef4444'}
              strokeDasharray="2 2"
              strokeWidth={2}
              label={{
                value: ip.label,
                fill: ip.type === 'bullish' ? '#22c55e' : '#ef4444',
                fontSize: 9,
                position: 'top',
              }}
            />
          ))}

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

      {showBitcoin && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          💡 Tip: M2 RoC typically leads BTC by 3-6 months. Adjust lag to see correlation.
        </div>
      )}
    </div>
  )
}
