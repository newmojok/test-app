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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store'
import {
  generateNetLiquidityHistory,
  type HowellIndicator,
  type DecisionMatrixRow,
} from '@/data/howellIndicators'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'

// Local function to generate decision matrix from indicators
function generateDecisionMatrixFromIndicators(indicators: HowellIndicator[]): DecisionMatrixRow[] {
  const signalMap = {
    bullish: 'Bullish' as const,
    bearish: 'Bearish' as const,
    neutral: 'Neutral' as const,
  }

  const weightMap: Record<string, number> = {
    walcl: 25,
    tga: 15,
    rrp: 10,
    dxy: 15,
    move: 10,
    cycle: 10,
    pboc: 10,
    ecb: 5,
  }

  return indicators.map((ind) => {
    const weight = weightMap[ind.id] || 10
    const signalScore = ind.signal === 'bullish' ? 1 : ind.signal === 'bearish' ? -1 : 0
    const contribution = (signalScore * weight * ind.signalStrength) / 100

    return {
      indicator: ind.shortName,
      currentSignal: signalMap[ind.signal],
      weight,
      contribution: Math.round(contribution * 10) / 10,
      notes: ind.interpretation,
    }
  })
}

// Local function to get aggregate signal from decision matrix
function getAggregateSignalFromMatrix(matrix: DecisionMatrixRow[]): {
  signal: 'Bullish' | 'Bearish' | 'Neutral'
  score: number
  description: string
} {
  const totalContribution = matrix.reduce((sum, row) => sum + row.contribution, 0)

  let signal: 'Bullish' | 'Bearish' | 'Neutral'
  let description: string

  if (totalContribution > 10) {
    signal = 'Bullish'
    description = 'Net liquidity conditions favor risk assets'
  } else if (totalContribution < -10) {
    signal = 'Bearish'
    description = 'Net liquidity conditions are restrictive'
  } else {
    signal = 'Neutral'
    description = 'Mixed signals - wait for clarity'
  }

  return { signal, score: Math.round(totalContribution), description }
}

export function HowellDashboardPage() {
  const {
    howellIndicators,
    howellLastRefresh,
    howellIsRefreshing,
    refreshHowellIndicators,
    howellRefreshErrors,
    livePrices,
  } = useAppStore()

  const netLiquidityData = useMemo(() => generateNetLiquidityHistory(), [])
  const decisionMatrix = useMemo(
    () => generateDecisionMatrixFromIndicators(howellIndicators),
    [howellIndicators]
  )
  const aggregateSignal = useMemo(
    () => getAggregateSignalFromMatrix(decisionMatrix),
    [decisionMatrix]
  )

  // Get current net liquidity
  const currentNetLiquidity = useMemo(() => {
    const fedBalance = howellIndicators.find((i) => i.id === 'walcl')?.currentValue || 0
    const tga = howellIndicators.find((i) => i.id === 'tga')?.currentValue || 0
    const rrp = howellIndicators.find((i) => i.id === 'rrp')?.currentValue || 0
    return fedBalance - tga - rrp
  }, [howellIndicators])

  // Format for display
  const formatTrillions = (value: number) => `$${(value / 1e12).toFixed(2)}T`
  const formatBillions = (value: number) => `$${(value / 1e9).toFixed(0)}B`

  const SignalIcon = ({ signal }: { signal: string }) => {
    switch (signal) {
      case 'Bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'Bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const SignalBadge = ({ signal }: { signal: string }) => {
    const variant =
      signal === 'Bullish' ? 'default' : signal === 'Bearish' ? 'destructive' : 'secondary'
    return <Badge variant={variant}>{signal}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Howell Liquidity Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time liquidity indicators based on Michael Howell's framework
          </p>
          {howellLastRefresh && (
            <p className="text-xs text-muted-foreground mt-1">
              Last refreshed: {new Date(howellLastRefresh).toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={() => refreshHowellIndicators()}
          disabled={howellIsRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${howellIsRefreshing ? 'animate-spin' : ''}`} />
          {howellIsRefreshing ? 'Fetching Live Data...' : 'Refresh All Data'}
        </button>
      </div>

      {/* Refresh Errors */}
      {howellRefreshErrors.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-500/5">
          <CardContent className="py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-600">Some data sources unavailable:</p>
                <ul className="text-xs text-muted-foreground mt-1">
                  {howellRefreshErrors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Market Prices */}
      {(livePrices.bitcoin || livePrices.ethereum || livePrices.sp500 || livePrices.gold) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {livePrices.bitcoin && (
            <Card className="bg-orange-500/5 border-orange-500/30">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground">Bitcoin (Live)</p>
                <p className="text-xl font-bold text-orange-500">
                  ${livePrices.bitcoin.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
          {livePrices.ethereum && (
            <Card className="bg-purple-500/5 border-purple-500/30">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground">Ethereum (Live)</p>
                <p className="text-xl font-bold text-purple-500">
                  ${livePrices.ethereum.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
          {livePrices.sp500 && (
            <Card className="bg-blue-500/5 border-blue-500/30">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground">S&P 500 (Live)</p>
                <p className="text-xl font-bold text-blue-500">
                  {livePrices.sp500.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
          {livePrices.gold && (
            <Card className="bg-yellow-500/5 border-yellow-500/30">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground">Gold (Live)</p>
                <p className="text-xl font-bold text-yellow-600">
                  ${livePrices.gold.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Aggregate Signal Card */}
      <Card
        className={`border-2 ${
          aggregateSignal.signal === 'Bullish'
            ? 'border-green-500 bg-green-500/5'
            : aggregateSignal.signal === 'Bearish'
              ? 'border-red-500 bg-red-500/5'
              : 'border-yellow-500 bg-yellow-500/5'
        }`}
      >
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {aggregateSignal.signal === 'Bullish' ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : aggregateSignal.signal === 'Bearish' ? (
                <XCircle className="h-12 w-12 text-red-500" />
              ) : (
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
              )}
              <div>
                <h2 className="text-2xl font-bold">{aggregateSignal.signal} Aggregate Signal</h2>
                <p className="text-muted-foreground">{aggregateSignal.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{aggregateSignal.score > 0 ? '+' : ''}{aggregateSignal.score}</div>
              <div className="text-sm text-muted-foreground">Composite Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Liquidity Components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fed Balance Sheet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {formatTrillions(howellIndicators.find((i) => i.id === 'walcl')?.currentValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">WALCL</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              TGA (minus)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              -{formatBillions(howellIndicators.find((i) => i.id === 'tga')?.currentValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Treasury Cash</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              RRP (minus)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              -{formatBillions(howellIndicators.find((i) => i.id === 'rrp')?.currentValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Reverse Repo</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              = Net Liquidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatTrillions(currentNetLiquidity)}
            </div>
            <p className="text-xs text-muted-foreground">Available Liquidity</p>
          </CardContent>
        </Card>
      </div>

      {/* Net Liquidity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Net Liquidity Over Time with Bitcoin Correlation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Bitcoin price (orange) shown with 13-week lag to demonstrate liquidity leading price action
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={netLiquidityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date)
                    // Show year only for January (cleaner with 11 years of data)
                    return String(d.getFullYear())
                  }}
                  tick={{ fontSize: 11 }}
                  ticks={netLiquidityData
                    .filter((d) => new Date(d.date).getMonth() === 0) // January only
                    .map((d) => d.date)}
                  interval={0}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => `$${(value / 1e12).toFixed(1)}T`}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Liquidity', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'BTC Price', angle: 90, position: 'insideRight', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => {
                    const num = typeof value === 'number' ? value : 0
                    if (name === 'BTC (13wk lag)' || name === 'BTC Price') {
                      return [`$${num.toLocaleString()}`, name]
                    }
                    return [`$${(num / 1e12).toFixed(2)}T`, name]
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <ReferenceLine
                  yAxisId="left"
                  y={6e12}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: 'QT Target ($6T)', fill: '#ef4444', fontSize: 12 }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="fedBalance"
                  name="Fed Balance Sheet"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="netLiquidity"
                  name="Net Liquidity"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="btcPriceLagged"
                  name="BTC (13wk lag)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="tga"
                  name="TGA"
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rrp"
                  name="RRP"
                  stroke="#f97316"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* QT Target Explanation */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-sm mb-1">About the QT Target Line ($6T)</h4>
            <p className="text-xs text-muted-foreground">
              The $6 trillion line represents the Fed's estimated terminal balance sheet target under Quantitative Tightening (QT).
              This is not from Howell's framework directly, but represents the market consensus for where the Fed may stop reducing its balance sheet
              to maintain adequate reserves in the banking system. When net liquidity approaches this level, expect increased market volatility
              and potential Fed intervention signals. The Fed started QT in June 2022 from ~$9T and has been reducing at ~$95B/month.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Decision Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Decision Matrix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Weighted signal contributions based on Howell's framework
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Indicator</th>
                  <th className="text-center py-3 px-4 font-medium">Signal</th>
                  <th className="text-center py-3 px-4 font-medium">Weight</th>
                  <th className="text-center py-3 px-4 font-medium">Contribution</th>
                  <th className="text-left py-3 px-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {decisionMatrix.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{row.indicator}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <SignalIcon signal={row.currentSignal} />
                        <SignalBadge signal={row.currentSignal} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{row.weight}%</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono ${
                          row.contribution > 0
                            ? 'text-green-500'
                            : row.contribution < 0
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {row.contribution > 0 ? '+' : ''}
                        {row.contribution.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-md">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30">
                  <td className="py-3 px-4 font-bold">Total</td>
                  <td className="py-3 px-4 text-center">
                    <SignalBadge signal={aggregateSignal.signal} />
                  </td>
                  <td className="py-3 px-4 text-center font-bold">100%</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-mono font-bold ${
                        aggregateSignal.score > 0
                          ? 'text-green-500'
                          : aggregateSignal.score < 0
                            ? 'text-red-500'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {aggregateSignal.score > 0 ? '+' : ''}
                      {aggregateSignal.score}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{aggregateSignal.description}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insight - 13 Week Lead Time Explanation */}
      <Card className="bg-blue-500/5 border-blue-500/50">
        <CardContent className="py-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <h4 className="font-medium text-blue-500">13-Week Lead Time: Why Liquidity Leads Price</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>The Core Mechanism:</strong> Michael Howell's research at CrossBorder Capital demonstrates that changes
                  in global net liquidity lead risk asset prices (especially Bitcoin and equities) by approximately 13 weeks (~3 months).
                  This relationship has shown 85%+ correlation historically.
                </p>
                <p>
                  <strong>Why 13 Weeks?</strong> This lag exists because:
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li><strong>Transmission delay:</strong> It takes time for liquidity changes to flow through the financial system—from central bank operations to commercial banks to asset markets</li>
                  <li><strong>Portfolio rebalancing:</strong> Fund managers and institutions don't react instantly; they assess conditions, adjust allocations, and execute over weeks</li>
                  <li><strong>Sentiment shift:</strong> Market participants need time to recognize and act on changing liquidity conditions</li>
                  <li><strong>Collateral effects:</strong> Improved liquidity enhances collateral values, enabling more leverage, which takes time to deploy</li>
                </ul>
                <p>
                  <strong>Current Implication (Q2 2026):</strong> Based on current net liquidity levels and trends observed today (late January 2026),
                  we can project risk asset behavior for approximately April-May 2026. If net liquidity is expanding now, expect supportive conditions
                  for BTC/equities in Q2. If contracting, expect headwinds. The chart above shows BTC price shifted back 13 weeks to visually demonstrate
                  how liquidity movements precede price action.
                </p>
                <p className="text-xs italic">
                  Source: Michael Howell's "Capital Wars" and CrossBorder Capital research. This framework is used by institutional investors
                  globally to time risk asset allocation decisions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
