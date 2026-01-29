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
import {
  howellIndicators,
  generateNetLiquidityHistory,
  generateDecisionMatrix,
  getAggregateSignal,
} from '@/data/howellIndicators'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export function HowellDashboardPage() {
  const netLiquidityData = useMemo(() => generateNetLiquidityHistory(), [])
  const decisionMatrix = useMemo(() => generateDecisionMatrix(), [])
  const aggregateSignal = useMemo(() => getAggregateSignal(), [])

  // Get current net liquidity
  const currentNetLiquidity = useMemo(() => {
    const fedBalance = howellIndicators.find((i) => i.id === 'walcl')?.currentValue || 0
    const tga = howellIndicators.find((i) => i.id === 'tga')?.currentValue || 0
    const rrp = howellIndicators.find((i) => i.id === 'rrp')?.currentValue || 0
    return fedBalance - tga - rrp
  }, [])

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
      <div>
        <h1 className="text-3xl font-bold">Howell Liquidity Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Real-time liquidity indicators based on Michael Howell's framework
        </p>
      </div>

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
          <CardTitle>Net Liquidity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={netLiquidityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date)
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                  }}
                  tick={{ fontSize: 12 }}
                  interval={6}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => `$${(value / 1e12).toFixed(1)}T`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => {
                    const num = typeof value === 'number' ? value : 0
                    return `$${(num / 1e12).toFixed(2)}T`
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <ReferenceLine
                  yAxisId="left"
                  y={6e12}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: 'QT Target', fill: '#ef4444', fontSize: 12 }}
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
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
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

      {/* Key Insight */}
      <Card className="bg-blue-500/5 border-blue-500/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-500">13-Week Lead Time</h4>
              <p className="text-sm text-muted-foreground">
                Remember: Changes in net liquidity lead risk asset prices by approximately 13 weeks.
                Current conditions suggest risk asset performance in Q2 2026.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
