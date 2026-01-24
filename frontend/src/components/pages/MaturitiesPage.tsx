import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { DebtMaturityChart } from '@/components/charts/DebtMaturityChart'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Download, Calendar, AlertTriangle } from 'lucide-react'
import type { QuarterlyMaturity, DebtMaturity } from '@/types'

interface MaturitiesPageProps {
  quarterlyData: QuarterlyMaturity[]
  maturities: DebtMaturity[]
  isLoading: boolean
}

export function MaturitiesPage({ quarterlyData, maturities, isLoading }: MaturitiesPageProps) {
  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [geographyFilter, setGeographyFilter] = useState<string>('all')

  const filteredMaturities = useMemo(() => {
    return maturities.filter((m) => {
      if (sectorFilter !== 'all' && m.sector !== sectorFilter) return false
      if (geographyFilter !== 'all' && m.geography !== geographyFilter) return false
      return true
    })
  }, [maturities, sectorFilter, geographyFilter])

  // Calculate totals
  const totalNext12Months = useMemo(() => {
    const today = new Date()
    const next12Months = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    return filteredMaturities
      .filter((m) => new Date(m.maturityDate) <= next12Months)
      .reduce((sum, m) => sum + m.amount, 0)
  }, [filteredMaturities])

  const highRiskQuarters = quarterlyData.filter((q) => q.total >= 500)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">12-Month Maturities</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalNext12Months * 1e9)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-chart-yellow" />
              <span className="text-sm text-muted-foreground">High-Risk Quarters</span>
            </div>
            <p className="text-3xl font-bold text-chart-yellow">{highRiskQuarters.length}</p>
            <p className="text-xs text-muted-foreground">Quarters with $500B+ maturities</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Peak Maturity Quarter</span>
            </div>
            <p className="text-2xl font-bold">
              {quarterlyData.length > 0
                ? quarterlyData.reduce((max, q) => (q.total > max.total ? q : max), quarterlyData[0])
                    .quarter
                : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">
              {quarterlyData.length > 0 &&
                formatCurrency(
                  quarterlyData.reduce((max, q) => (q.total > max.total ? q : max), quarterlyData[0])
                    .total * 1e9
                )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Maturity Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Debt Maturity Wall</CardTitle>
              <CardDescription>Quarterly debt maturities by sector (2025-2030)</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DebtMaturityChart data={quarterlyData} height={400} highlightThreshold={500} />
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Upcoming Maturities</CardTitle>
            <div className="flex items-center gap-4">
              <Select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-36"
              >
                <option value="all">All Sectors</option>
                <option value="Sovereign">Sovereign</option>
                <option value="IG_Corp">IG Corporate</option>
                <option value="HY_Corp">HY Corporate</option>
              </Select>
              <Select
                value={geographyFilter}
                onChange={(e) => setGeographyFilter(e.target.value)}
                className="w-36"
              >
                <option value="all">All Regions</option>
                <option value="US">United States</option>
                <option value="EU">Europe</option>
                <option value="China">China</option>
                <option value="EM">Emerging Markets</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Issuer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Maturity Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Coupon</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sector</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaturities.slice(0, 20).map((maturity) => (
                  <tr key={maturity.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{maturity.issuer}</td>
                    <td className="py-3 px-4">{formatCurrency(maturity.amount * 1e9)}</td>
                    <td className="py-3 px-4">{formatDate(maturity.maturityDate)}</td>
                    <td className="py-3 px-4">{maturity.coupon.toFixed(2)}%</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          maturity.rating.startsWith('A')
                            ? 'success'
                            : maturity.rating.startsWith('B')
                              ? 'warning'
                              : 'secondary'
                        }
                      >
                        {maturity.rating}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{maturity.sector.replace('_', ' ')}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMaturities.length > 20 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Showing 20 of {filteredMaturities.length} maturities
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
