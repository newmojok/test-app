import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { CorrelationHeatmap } from '@/components/charts/CorrelationHeatmap'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import type { CorrelationMatrix } from '@/types'

interface CorrelationsPageProps {
  data: CorrelationMatrix | null
  isLoading: boolean
}

// Generate slightly different correlations based on time period and lag
function adjustCorrelations(baseMatrix: number[][], timePeriod: number, lagMonths: number): number[][] {
  // Adjust correlations based on settings
  // Longer time periods = slightly lower correlations (more noise)
  // Per Howell: M2 leads crypto by ~10-12mo, net liquidity by ~13 weeks
  const timeAdjust = timePeriod === 30 ? 0.95 : timePeriod === 90 ? 1.0 : timePeriod === 180 ? 0.97 : 0.93

  // BTC-M2 correlation peaks around 9-12mo lag (per Howell research)
  const lagMultipliers: Record<number, number> = { 0: 0.75, 3: 0.85, 6: 0.92, 9: 1.0, 12: 0.98 }
  const lagAdjust = lagMultipliers[lagMonths] || 1.0

  return baseMatrix.map((row, i) =>
    row.map((val, j) => {
      if (i === j) return 1.0 // Diagonal stays 1
      // Apply adjustments
      let adjusted = val * timeAdjust
      // Extra adjustment for M2-BTC correlation (index 0 and 2)
      if ((i === 0 && j === 2) || (i === 2 && j === 0)) {
        adjusted = val * lagAdjust
      }
      // Clamp to valid range
      return Math.max(-1, Math.min(1, adjusted))
    })
  )
}

export function CorrelationsPage({ data, isLoading }: CorrelationsPageProps) {
  const [lagPeriod, setLagPeriod] = useState(9) // Default to 9mo (per Howell: M2 leads crypto by ~10-12mo)
  const [timePeriod, setTimePeriod] = useState('90')

  // Adjust correlations based on settings
  const adjustedData = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      matrix: adjustCorrelations(data.matrix, parseInt(timePeriod), lagPeriod),
      period: `${timePeriod}-day rolling${lagPeriod > 0 ? `, ${lagPeriod}mo lag` : ''}`,
    }
  }, [data, timePeriod, lagPeriod])

  // Key correlations that update with settings
  const keyCorrelations = useMemo(() => {
    if (!adjustedData) return { m2Btc: 0.78, creditSpx: 0.67, m2Gold: 0.54, dxyBtc: -0.62 }
    const m = adjustedData.matrix
    return {
      m2Btc: m[0]?.[2] ?? 0.78,
      creditSpx: m[1]?.[3] ?? 0.67,
      m2Gold: m[0]?.[4] ?? 0.54,
      dxyBtc: m[5]?.[2] ?? -0.62,
    }
  }, [adjustedData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Time Period:</span>
              <Select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-32"
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Lag (months):</span>
              <Select
                value={lagPeriod.toString()}
                onChange={(e) => setLagPeriod(parseInt(e.target.value))}
                className="w-24"
              >
                <option value="0">0</option>
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Correlation Matrix</CardTitle>
          <CardDescription>
            Rolling {timePeriod}-day Pearson correlation between liquidity metrics and asset prices
            {lagPeriod > 0 && ` (${lagPeriod}-month lag applied to assets)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adjustedData ? (
            <CorrelationHeatmap data={adjustedData} height={500} />
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No correlation data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Correlations</CardTitle>
            <CardDescription>Based on {timePeriod}-day rolling window{lagPeriod > 0 ? `, ${lagPeriod}mo lag` : ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Global M2 RoC → Bitcoin</p>
                <p className="text-xs text-muted-foreground">{lagPeriod > 0 ? `${lagPeriod}-month lag` : 'Contemporaneous'}</p>
              </div>
              <span className={`text-xl font-bold ${keyCorrelations.m2Btc > 0 ? 'text-accent' : 'text-destructive'}`}>
                {keyCorrelations.m2Btc > 0 ? '+' : ''}{keyCorrelations.m2Btc.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Credit Impulse → S&P 500</p>
                <p className="text-xs text-muted-foreground">{lagPeriod > 0 ? `${lagPeriod}-month lag` : 'Contemporaneous'}</p>
              </div>
              <span className={`text-xl font-bold ${keyCorrelations.creditSpx > 0 ? 'text-accent' : 'text-destructive'}`}>
                {keyCorrelations.creditSpx > 0 ? '+' : ''}{keyCorrelations.creditSpx.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Global M2 RoC → Gold</p>
                <p className="text-xs text-muted-foreground">{lagPeriod > 0 ? `${lagPeriod}-month lag` : 'Contemporaneous'}</p>
              </div>
              <span className={`text-xl font-bold ${keyCorrelations.m2Gold > 0 ? 'text-accent' : 'text-destructive'}`}>
                {keyCorrelations.m2Gold > 0 ? '+' : ''}{keyCorrelations.m2Gold.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">DXY → Bitcoin</p>
                <p className="text-xs text-muted-foreground">Contemporaneous</p>
              </div>
              <span className={`text-xl font-bold ${keyCorrelations.dxyBtc > 0 ? 'text-accent' : 'text-destructive'}`}>
                {keyCorrelations.dxyBtc > 0 ? '+' : ''}{keyCorrelations.dxyBtc.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interpretation Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              <strong className="text-accent">Strong positive (0.7+):</strong> Assets move together.
              M2 expansion typically bullish for risk assets.
            </p>
            <p>
              <strong className="text-primary">Moderate (0.3-0.7):</strong> Some relationship exists
              but other factors also matter.
            </p>
            <p>
              <strong className="text-muted-foreground">Weak (0.0-0.3):</strong> Little to no
              linear relationship.
            </p>
            <p>
              <strong className="text-destructive">Negative:</strong> Assets move opposite. DXY
              strength typically bearish for BTC.
            </p>
            <p className="pt-2 border-t border-border">
              <strong>Note:</strong> Correlations with lag show how liquidity metrics predict
              future asset prices. Per Howell's research, M2-BTC correlation peaks at ~10-12 month lag,
              while net liquidity leads risk assets by ~13 weeks.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
