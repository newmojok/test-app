import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { AlertsBanner } from '@/components/dashboard/AlertsBanner'
import { M2Chart } from '@/components/charts/M2Chart'
import { ChartControls } from '@/components/dashboard/ChartControls'
import { useAppStore } from '@/store'
import { Spinner } from '@/components/ui/spinner'
import type { M2CountryData, Alert, DashboardStats } from '@/types'

interface OverviewPageProps {
  m2Data: M2CountryData[]
  alerts: Alert[]
  stats: DashboardStats | null
  isLoading: boolean
  onDismissAlert: (id: string) => void
  onViewAllAlerts: () => void
}

export function OverviewPage({
  m2Data,
  alerts,
  stats,
  isLoading,
  onDismissAlert,
  onViewAllAlerts,
}: OverviewPageProps) {
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
      {/* Alert Banner */}
      <AlertsBanner
        alerts={alerts}
        onDismiss={onDismissAlert}
        onViewAll={onViewAllAlerts}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Global M2 6M RoC"
          value={stats?.globalM2Roc ?? 0}
          format="percent"
          description="Weighted average across major economies"
          trend={stats?.globalM2Roc && stats.globalM2Roc > 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Credit Impulse"
          value={stats?.creditImpulse ?? 0}
          format="percent"
          description="China + US combined"
          trend={stats?.creditImpulse && stats.creditImpulse > 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="12M Maturities"
          value={stats?.next12MonthMaturities ?? 0}
          format="currency"
          description="Upcoming debt maturities"
          trend="neutral"
        />
        <MetricCard
          title="Active Alerts"
          value={stats?.activeAlerts ?? 0}
          description="Unread notifications"
          trend={stats?.activeAlerts && stats.activeAlerts > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Main M2 Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Global M2 Money Supply</CardTitle>
          <CardDescription>
            {chartConfig.viewMode === 'roc'
              ? '6-Month Rate of Change (Howell Leading Indicator)'
              : 'Absolute M2 Values in Trillions USD'}
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
              height={450}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
