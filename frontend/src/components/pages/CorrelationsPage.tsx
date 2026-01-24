import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { CorrelationHeatmap } from '@/components/charts/CorrelationHeatmap'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import type { CorrelationMatrix } from '@/types'

interface CorrelationsPageProps {
  data: CorrelationMatrix | null
  isLoading: boolean
}

export function CorrelationsPage({ data, isLoading }: CorrelationsPageProps) {
  const [lagPeriod, setLagPeriod] = useState(0)
  const [timePeriod, setTimePeriod] = useState('90')

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
          {data ? (
            <CorrelationHeatmap data={data} height={500} />
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Global M2 RoC → Bitcoin</p>
                <p className="text-xs text-muted-foreground">6-month lag</p>
              </div>
              <span className="text-xl font-bold text-accent">+0.78</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Credit Impulse → S&P 500</p>
                <p className="text-xs text-muted-foreground">6-month lag</p>
              </div>
              <span className="text-xl font-bold text-accent">+0.67</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">Global M2 RoC → Gold</p>
                <p className="text-xs text-muted-foreground">3-month lag</p>
              </div>
              <span className="text-xl font-bold text-accent">+0.54</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium">DXY → Bitcoin</p>
                <p className="text-xs text-muted-foreground">Contemporaneous</p>
              </div>
              <span className="text-xl font-bold text-destructive">-0.62</span>
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
              future asset prices. A 6-month lag means today's liquidity reading correlates with
              asset prices 6 months from now.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
