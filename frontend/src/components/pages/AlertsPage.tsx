import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Bell, Settings, CheckCheck } from 'lucide-react'
import type { Alert } from '@/types'

interface AlertsPageProps {
  alerts: Alert[]
  isLoading: boolean
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}

export function AlertsPage({ alerts, isLoading, onMarkRead, onMarkAllRead }: AlertsPageProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [showThresholds, setShowThresholds] = useState(false)

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType !== 'all' && alert.type !== filterType) return false
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false
    return true
  })

  const unreadCount = alerts.filter((a) => !a.isRead).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-40"
          >
            <option value="all">All Types</option>
            <option value="M2_INFLECTION">M2 Inflection</option>
            <option value="CREDIT_REVERSAL">Credit Reversal</option>
            <option value="MATURITY_SPIKE">Maturity Spike</option>
            <option value="CUSTOM">Custom</option>
          </Select>
          <Select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-36"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={onMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowThresholds(!showThresholds)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure Thresholds
          </Button>
        </div>
      </div>

      {/* Threshold Configuration */}
      {showThresholds && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Thresholds</CardTitle>
            <CardDescription>Configure when alerts should be triggered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">M2 RoC Upper Threshold</label>
                <input
                  type="number"
                  defaultValue={5}
                  className="w-full h-9 px-3 rounded-md border border-border bg-transparent text-sm"
                  placeholder="5"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when 6M RoC crosses above this %
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">M2 RoC Lower Threshold</label>
                <input
                  type="number"
                  defaultValue={-2}
                  className="w-full h-9 px-3 rounded-md border border-border bg-transparent text-sm"
                  placeholder="-2"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when 6M RoC crosses below this %
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maturity Spike Threshold ($B)</label>
                <input
                  type="number"
                  defaultValue={500}
                  className="w-full h-9 px-3 rounded-md border border-border bg-transparent text-sm"
                  placeholder="500"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when quarterly maturities exceed this
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm">Save Thresholds</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <AlertsPanel
        alerts={filteredAlerts}
        onMarkRead={onMarkRead}
      />

      {/* Alert Types Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-medium text-primary">M2 Inflection</p>
            <p className="text-muted-foreground">
              Triggered when the global M2 6-month rate of change crosses above +5% (bullish) or
              below -2% (bearish). Historically precedes Bitcoin/equity moves by 3-6 months.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-accent">Credit Reversal</p>
            <p className="text-muted-foreground">
              Triggered when China or US credit impulse changes sign (positive to negative or vice
              versa). Major leading indicator for global risk appetite.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-chart-yellow">Maturity Spike</p>
            <p className="text-muted-foreground">
              Triggered when upcoming quarterly debt maturities exceed $500B. High refinancing
              concentration can stress credit markets.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-muted-foreground">Custom</p>
            <p className="text-muted-foreground">
              User-defined alerts based on custom thresholds. Configure your own conditions in the
              settings above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
