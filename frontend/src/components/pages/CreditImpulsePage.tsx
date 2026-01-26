import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { CreditImpulseChart } from '@/components/charts/CreditImpulseChart'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import type { CreditImpulseData } from '@/types'
import { mockBitcoinData, mockSP500Data } from '@/data/mockData'

interface CreditImpulsePageProps {
  data: CreditImpulseData[]
  isLoading: boolean
}

export function CreditImpulsePage({ data, isLoading }: CreditImpulsePageProps) {
  const [selectedCountry, setSelectedCountry] = useState<'US' | 'CN'>('CN')
  const [lagMonths, setLagMonths] = useState(6)
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'SPX'>('BTC')

  // Filter data by country
  const countryData = data.filter((d) => d.country === selectedCountry)

  // Asset data based on selection
  const assetData = selectedAsset === 'BTC'
    ? mockBitcoinData.map((d) => ({ date: d.date, price: d.price }))
    : mockSP500Data.map((d) => ({ date: d.date, price: d.price }))

  const assetName = selectedAsset === 'BTC' ? 'Bitcoin' : 'S&P 500'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const latestImpulse = countryData[countryData.length - 1]?.impulse ?? 0
  const isPositive = latestImpulse > 0

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">China Credit Impulse</p>
            <p
              className={`text-3xl font-bold ${isPositive ? 'text-accent' : 'text-destructive'}`}
            >
              {(latestImpulse * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isPositive ? 'Expansionary' : 'Contractionary'} phase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Correlation to {assetName}</p>
            <p className="text-3xl font-bold text-primary">
              {selectedAsset === 'BTC' ? '0.78' : '0.67'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">90-day rolling, {lagMonths}mo lag</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Signal</p>
            <Badge variant={isPositive ? 'success' : 'destructive'} className="text-lg py-1 px-3">
              {isPositive ? 'RISK ON' : 'RISK OFF'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Based on impulse direction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Credit Impulse vs {assetName}</CardTitle>
              <CardDescription>
                Credit impulse leads {assetName.toLowerCase()} by {lagMonths} months
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Asset:</span>
                <Select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value as 'BTC' | 'SPX')}
                  className="w-32"
                >
                  <option value="BTC">Bitcoin</option>
                  <option value="SPX">S&P 500</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Country:</span>
                <Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value as 'US' | 'CN')}
                  className="w-32"
                >
                  <option value="CN">China</option>
                  <option value="US">United States</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Lag:</span>
                <Select
                  value={lagMonths.toString()}
                  onChange={(e) => setLagMonths(parseInt(e.target.value))}
                  className="w-24"
                >
                  <option value="3">3 mo</option>
                  <option value="6">6 mo</option>
                  <option value="9">9 mo</option>
                  <option value="12">12 mo</option>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CreditImpulseChart
            data={countryData}
            assetData={assetData}
            assetName={assetName}
            lagMonths={lagMonths}
            height={450}
          />
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>What is Credit Impulse?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-4">
          <p>
            <strong>Credit Impulse</strong> measures the change in new credit creation as a
            percentage of GDP. It's the "second derivative" of credit growth - not just whether
            credit is growing, but whether it's growing faster or slower than before.
          </p>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs">
            Credit Impulse = Δ(New Credit) / GDP
            <br />
            Where Δ = change from previous period
          </div>
          <p>
            <strong>Why China dominates:</strong> China accounts for ~40% of global credit
            creation. When China's credit impulse turns positive, it typically precedes global
            risk-on conditions by 6-9 months.
          </p>
          <p>
            <strong>Bitcoin correlation:</strong> Bitcoin has shown strong correlation (0.78) with
            global liquidity conditions. When credit impulse turns positive, BTC typically rallies
            6-9 months later.
          </p>
          <p>
            <strong>Key thresholds:</strong>
          </p>
          <ul className="list-disc list-inside">
            <li>Above 0%: Expansionary (bullish for risk assets)</li>
            <li>Below 0%: Contractionary (bearish for risk assets)</li>
            <li>Reversal from negative to positive: Major inflection point</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
