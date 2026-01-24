import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { M2Chart } from '@/components/charts/M2Chart'
import { ChartControls } from '@/components/dashboard/ChartControls'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store'
import { Spinner } from '@/components/ui/spinner'
import { formatPercent, formatCurrency } from '@/lib/utils'
import type { M2CountryData } from '@/types'

interface LiquidityPageProps {
  m2Data: M2CountryData[]
  isLoading: boolean
}

const COUNTRY_INFO: Record<string, { name: string; flag: string; gdpWeight: number }> = {
  US: { name: 'United States', flag: '🇺🇸', gdpWeight: 0.31 },
  CN: { name: 'China', flag: '🇨🇳', gdpWeight: 0.28 },
  EU: { name: 'Eurozone', flag: '🇪🇺', gdpWeight: 0.22 },
  JP: { name: 'Japan', flag: '🇯🇵', gdpWeight: 0.12 },
  UK: { name: 'United Kingdom', flag: '🇬🇧', gdpWeight: 0.07 },
}

export function LiquidityPage({ m2Data, isLoading }: LiquidityPageProps) {
  const { chartConfig } = useAppStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Country Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {m2Data.map((country) => {
          const info = COUNTRY_INFO[country.country]
          const isPositive = country.latestRoc > 0

          return (
            <Card key={country.country} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-1 w-full"
                style={{ backgroundColor: country.color }}
              />
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{info?.flag}</span>
                  <span className="font-medium">{info?.name}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">M2 Supply</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(country.latestValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">6M RoC</p>
                    <p
                      className={`text-lg font-bold ${isPositive ? 'text-accent' : 'text-destructive'}`}
                    >
                      {formatPercent(country.latestRoc)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Weight: {((info?.gdpWeight ?? 0) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>M2 Money Supply by Economy</CardTitle>
          <CardDescription>
            Compare liquidity conditions across the 5 largest economies (covering ~70% of global M2)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartControls />
          <div className="mt-4">
            <M2Chart
              data={m2Data}
              viewMode={chartConfig.viewMode}
              showRecessions={chartConfig.showRecessions}
              selectedCountries={chartConfig.selectedCountries}
              height={500}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Methodology</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>6-Month Rate of Change (RoC)</strong> is calculated as the percentage change
              in M2 money supply over a rolling 6-month period.
            </p>
            <p>
              Per Michael Howell's research, this metric leads global asset prices (Bitcoin, equities)
              by 3-6 months. A cross above +5% typically signals risk-on conditions.
            </p>
            <p>
              <strong>Z-Score</strong> shows how current readings compare to the 10-year historical
              average, normalized by standard deviation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong>US:</strong> Federal Reserve M2SL (FRED)</p>
            <p><strong>China:</strong> PBOC M2 via World Bank</p>
            <p><strong>Eurozone:</strong> ECB M3 Monetary Aggregate</p>
            <p><strong>Japan:</strong> BOJ M2 Statistics</p>
            <p><strong>UK:</strong> Bank of England M4</p>
            <p className="text-xs mt-4">
              Data updated monthly. Last refresh: {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
