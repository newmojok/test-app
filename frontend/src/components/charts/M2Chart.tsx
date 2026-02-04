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
import { formatDateQuarterly, formatDateShort, formatPercent, isQuarterStart } from '@/lib/utils'
import type { M2CountryData, RecessionPeriod } from '@/types'
import { mockBitcoinData, mockEthereumData } from '@/data/mockData'
import { generateNetLiquidityHistory } from '@/data/howellIndicators'

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
  const [showEthereum, setShowEthereum] = useState(false)
  const [showNetLiquidity, setShowNetLiquidity] = useState(false)
  const [cryptoLag, setCryptoLag] = useState(3) // Default 3 month lag (~13 weeks per Howell's research)
  const [cryptoViewMode, setCryptoViewMode] = useState<'price' | 'yoy'>('yoy')
  const [showSignals, setShowSignals] = useState(true)
  const [useLogScale, setUseLogScale] = useState(false) // Log scale for price axis
  // Separate forecast controls for BTC and Liquidity (in weeks)
  const [btcForecastWeeks, setBtcForecastWeeks] = useState(13) // Default ~13 weeks per Howell
  const [liqForecastWeeks, setLiqForecastWeeks] = useState(0) // Default off for liquidity

  // Generate net liquidity data
  const netLiquidityHistory = useMemo(() => generateNetLiquidityHistory(), [])

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
    // M2 LEADS crypto, so we look FORWARD in time for BTC data
    // e.g., with 3mo lag, Jan 2026 M2 predicts Apr 2026 BTC
    if (showBitcoin) {
      const btcByMonth = new Map<string, { price: number; yoyChange?: number }>()
      mockBitcoinData.forEach((btcPoint) => {
        const key = btcPoint.date.substring(0, 7)
        btcByMonth.set(key, { price: btcPoint.price, yoyChange: btcPoint.yoyChange })
      })

      dateMap.forEach((entry, dateStr) => {
        const entryDate = new Date(dateStr)
        entryDate.setMonth(entryDate.getMonth() + cryptoLag) // ADD lag (look forward)
        const btcKey = entryDate.toISOString().substring(0, 7)
        const btcData = btcByMonth.get(btcKey)

        if (btcData) {
          if (cryptoViewMode === 'yoy' && btcData.yoyChange !== undefined) {
            entry.BTC = btcData.yoyChange / 10
          } else if (cryptoViewMode === 'price') {
            entry.BTC = btcData.price / 1000
          }
        }
      })
    }

    // Add Ethereum data with lag adjustment
    // M2 LEADS crypto, so we look FORWARD in time for ETH data
    if (showEthereum) {
      const ethByMonth = new Map<string, number>()
      mockEthereumData.forEach((ethPoint) => {
        if (ethPoint.price > 0) {
          const key = ethPoint.date.substring(0, 7)
          ethByMonth.set(key, ethPoint.price)
        }
      })

      dateMap.forEach((entry, dateStr) => {
        const entryDate = new Date(dateStr)
        entryDate.setMonth(entryDate.getMonth() + cryptoLag) // ADD lag (look forward)
        const ethKey = entryDate.toISOString().substring(0, 7)
        const ethPrice = ethByMonth.get(ethKey)

        if (ethPrice !== undefined) {
          if (cryptoViewMode === 'price') {
            entry.ETH = ethPrice / 100 // Scale for chart
          } else {
            // Calculate YoY for ETH
            const prevYearDate = new Date(entryDate)
            prevYearDate.setFullYear(prevYearDate.getFullYear() - 1)
            const prevKey = prevYearDate.toISOString().substring(0, 7)
            const prevPrice = ethByMonth.get(prevKey)
            if (prevPrice && prevPrice > 0) {
              entry.ETH = ((ethPrice - prevPrice) / prevPrice) * 10 // Scale for chart
            }
          }
        }
      })
    }

    // Add Net Liquidity data (Fed Balance Sheet - TGA - RRP)
    if (showNetLiquidity) {
      const nlByMonth = new Map<string, number>()
      netLiquidityHistory.forEach((nlPoint) => {
        const key = nlPoint.date.substring(0, 7)
        nlByMonth.set(key, nlPoint.netLiquidity)
      })

      dateMap.forEach((entry, dateStr) => {
        const key = dateStr.substring(0, 7)
        const nlValue = nlByMonth.get(key)
        if (nlValue !== undefined) {
          entry.NetLiq = nlValue / 1e12 // Convert to trillions for chart scale
        }
      })
    }

    let result = Array.from(dateMap.values()).sort(
      (a, b) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime()
    )

    // Add forecast zones: extend x-axis to accommodate both BTC and Liquidity forecasts
    const btcForecastMonths = Math.ceil(btcForecastWeeks / 4.33) // Convert weeks to months
    const liqForecastMonths = Math.ceil(liqForecastWeeks / 4.33)
    const maxForecastMonths = Math.max(
      (showBitcoin || showEthereum) ? btcForecastMonths : 0,
      liqForecastMonths // Liquidity forecast applies to M2/NetLiq data
    )

    if (maxForecastMonths > 0) {
      const lastDataDate = result.length > 0 ? new Date(String(result[result.length - 1].date)) : new Date()

      // Add future months for the longest forecast period
      for (let i = 1; i <= maxForecastMonths; i++) {
        const futureDate = new Date(lastDataDate)
        futureDate.setMonth(futureDate.getMonth() + i)
        const futureDateStr = futureDate.toISOString().split('T')[0]

        // Create forecast entry with isForecast flag
        const forecastEntry: Record<string, string | number | boolean> = {
          date: futureDateStr,
          isForecast: true,
        }

        result.push(forecastEntry as Record<string, string | number>)
      }
    }

    return result
  }, [data, viewMode, selectedCountries, showBitcoin, showEthereum, showNetLiquidity, netLiquidityHistory, cryptoLag, cryptoViewMode, btcForecastWeeks, liqForecastWeeks])

  // Calculate separate forecast zone boundaries for BTC and Liquidity
  const forecastZones = useMemo(() => {
    const nonForecastData = chartData.filter(d => !d.isForecast)
    if (nonForecastData.length === 0) return { btc: null, liquidity: null }

    const lastRealDate = String(nonForecastData[nonForecastData.length - 1].date)
    const lastRealDateObj = new Date(lastRealDate)

    // BTC forecast zone
    let btcZone = null
    const btcForecastMonths = Math.ceil(btcForecastWeeks / 4.33)
    if (btcForecastWeeks > 0 && (showBitcoin || showEthereum)) {
      const btcEndDate = new Date(lastRealDateObj)
      btcEndDate.setMonth(btcEndDate.getMonth() + btcForecastMonths)
      const btcEndDateStr = btcEndDate.toISOString().split('T')[0]
      const btcEndLabel = formatDateShort(btcEndDate)
      btcZone = { start: lastRealDate, end: btcEndDateStr, endLabel: btcEndLabel }
    }

    // Liquidity forecast zone
    let liqZone = null
    const liqForecastMonths = Math.ceil(liqForecastWeeks / 4.33)
    if (liqForecastWeeks > 0) {
      const liqEndDate = new Date(lastRealDateObj)
      liqEndDate.setMonth(liqEndDate.getMonth() + liqForecastMonths)
      const liqEndDateStr = liqEndDate.toISOString().split('T')[0]
      const liqEndLabel = formatDateShort(liqEndDate)
      liqZone = { start: lastRealDate, end: liqEndDateStr, endLabel: liqEndLabel }
    }

    return { btc: btcZone, liquidity: liqZone }
  }, [chartData, btcForecastWeeks, liqForecastWeeks, showBitcoin, showEthereum])

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
            onClick={() => setShowNetLiquidity(!showNetLiquidity)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              showNetLiquidity
                ? 'bg-cyan-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            title="Net Liquidity = Fed Balance Sheet - TGA - RRP"
          >
            Net Liq
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
          <button
            onClick={() => setShowEthereum(!showEthereum)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              showEthereum
                ? 'bg-indigo-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Ξ ETH
          </button>
          {(showBitcoin || showEthereum) && (
            <>
              <select
                value={cryptoViewMode}
                onChange={(e) => setCryptoViewMode(e.target.value as 'price' | 'yoy')}
                className="px-2 py-1 text-xs rounded-md bg-muted border border-border"
              >
                <option value="yoy">YoY %</option>
                <option value="price">Price</option>
              </select>
              <select
                value={cryptoLag}
                onChange={(e) => setCryptoLag(parseInt(e.target.value))}
                className="px-2 py-1 text-xs rounded-md bg-muted border border-border"
                title="How far ahead liquidity predicts crypto prices (Howell: ~13 weeks)"
              >
                <option value="0">No shift</option>
                <option value="2">~8 weeks</option>
                <option value="3">~13 weeks ★</option>
                <option value="4">~4 months</option>
                <option value="6">~6 months</option>
                <option value="9">~9 months</option>
                <option value="12">~12 months</option>
              </select>
              <select
                value={btcForecastWeeks}
                onChange={(e) => setBtcForecastWeeks(parseInt(e.target.value))}
                className={`px-2 py-1 text-xs rounded-md border ${
                  btcForecastWeeks > 0
                    ? 'bg-amber-500/20 border-amber-500 text-amber-600'
                    : 'bg-muted border-border'
                }`}
                title="How far to forecast Bitcoin price"
              >
                <option value="0">BTC Forecast: Off</option>
                <option value="4">BTC: 4 weeks</option>
                <option value="8">BTC: 8 weeks</option>
                <option value="13">BTC: 13 weeks ★</option>
                <option value="26">BTC: 26 weeks</option>
                <option value="52">BTC: 52 weeks</option>
              </select>
              {cryptoViewMode === 'price' && (
                <button
                  onClick={() => setUseLogScale(!useLogScale)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    useLogScale
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  title="Toggle logarithmic scale for price"
                >
                  Log
                </button>
              )}
            </>
          )}
          <select
            value={liqForecastWeeks}
            onChange={(e) => setLiqForecastWeeks(parseInt(e.target.value))}
            className={`px-2 py-1 text-xs rounded-md border ${
              liqForecastWeeks > 0
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600'
                : 'bg-muted border-border'
            }`}
            title="How far to forecast Global Liquidity"
          >
            <option value="0">Liquidity Forecast: Off</option>
            <option value="4">Liq: 4 weeks</option>
            <option value="8">Liq: 8 weeks</option>
            <option value="13">Liq: 13 weeks</option>
            <option value="26">Liq: 26 weeks</option>
            <option value="52">Liq: 52 weeks</option>
          </select>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 30, right: 60, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateQuarterly}
            stroke="var(--color-muted-foreground)"
            tick={{ fontSize: 11 }}
            tickMargin={10}
            ticks={chartData.filter((d) => isQuarterStart(String(d.date))).map((d) => d.date)}
            interval={0}
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
          {(showBitcoin || showEthereum) && (
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f59e0b"
              tick={{ fontSize: 11, fill: '#f59e0b' }}
              tickFormatter={(value) =>
                cryptoViewMode === 'yoy' ? `${(value * 10).toFixed(0)}%` : `$${value}K`
              }
              tickMargin={10}
              scale={cryptoViewMode === 'price' && useLogScale ? 'log' : 'auto'}
              domain={cryptoViewMode === 'price' && useLogScale ? ['auto', 'auto'] : undefined}
              label={{
                value: cryptoViewMode === 'yoy'
                  ? `Crypto YoY% (M2 leads ${cryptoLag}mo)`
                  : `Crypto Price${useLogScale ? ' (Log)' : ''} (M2 leads ${cryptoLag}mo)`,
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
                if (cryptoViewMode === 'yoy') {
                  return [`${(value * 10).toFixed(1)}% YoY`, 'Bitcoin']
                }
                return [`$${(value * 1000).toLocaleString()}`, 'Bitcoin']
              }
              if (name === 'ETH') {
                if (cryptoViewMode === 'yoy') {
                  return [`${(value * 10).toFixed(1)}% YoY`, 'Ethereum']
                }
                return [`$${(value * 100).toLocaleString()}`, 'Ethereum']
              }
              if (name === 'Net Liquidity' || name === 'NetLiq') {
                return [`$${value.toFixed(2)}T`, 'Net Liquidity']
              }
              return [
                viewMode === 'absolute' ? `$${value.toFixed(2)}T` : formatPercent(value),
                String(name),
              ]
            }}
          />
          <Legend />

          {/* BTC Forecast zone shading */}
          {forecastZones.btc && (
            <ReferenceArea
              yAxisId="left"
              x1={forecastZones.btc.start}
              x2={forecastZones.btc.end}
              fill="#f59e0b"
              fillOpacity={0.12}
              strokeOpacity={0}
              label={{
                value: `BTC → ${forecastZones.btc.endLabel}`,
                position: 'insideTop',
                fill: '#f59e0b',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}

          {/* Liquidity Forecast zone shading */}
          {forecastZones.liquidity && (
            <ReferenceArea
              yAxisId="left"
              x1={forecastZones.liquidity.start}
              x2={forecastZones.liquidity.end}
              fill="#06b6d4"
              fillOpacity={0.12}
              strokeOpacity={0}
              label={{
                value: `Liquidity → ${forecastZones.liquidity.endLabel}`,
                position: forecastZones.btc ? 'insideBottom' : 'insideTop',
                fill: '#06b6d4',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}

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

          {showNetLiquidity && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="NetLiq"
              name="Net Liquidity"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}

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

          {showEthereum && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ETH"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              strokeDasharray="3 3"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {(showBitcoin || showEthereum || liqForecastWeeks > 0) && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Per Howell's research, global liquidity leads crypto by ~13 weeks. Use forecast dropdowns to project BTC and Liquidity independently.
        </div>
      )}
    </div>
  )
}
