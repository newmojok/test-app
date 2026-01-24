import { formatDate, cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { Alert, AlertSeverity, AlertType } from '@/types'

interface AlertsPanelProps {
  alerts: Alert[]
  onMarkRead?: (alertId: string) => void
  onAlertClick?: (alert: Alert) => void
}

function getSeverityIcon(severity: AlertSeverity) {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="h-4 w-4 text-destructive" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-chart-yellow" />
    default:
      return <Info className="h-4 w-4 text-primary" />
  }
}

function getSeverityBadge(severity: AlertSeverity) {
  switch (severity) {
    case 'critical':
      return <Badge variant="destructive">Critical</Badge>
    case 'warning':
      return <Badge variant="warning">Warning</Badge>
    default:
      return <Badge variant="secondary">Info</Badge>
  }
}

function getTypeLabel(type: AlertType) {
  switch (type) {
    case 'M2_INFLECTION':
      return 'M2 Inflection'
    case 'CREDIT_REVERSAL':
      return 'Credit Reversal'
    case 'MATURITY_SPIKE':
      return 'Maturity Spike'
    default:
      return 'Custom'
  }
}

export function AlertsPanel({ alerts, onMarkRead, onAlertClick }: AlertsPanelProps) {
  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alerts
        </CardTitle>
        <Badge variant="outline">{alerts.filter((a) => !a.isRead).length} unread</Badge>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No alerts yet</p>
          </div>
        ) : (
          sortedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'p-4 rounded-lg border border-border transition-colors cursor-pointer hover:bg-muted/50',
                !alert.isRead && 'bg-muted/30 border-primary/30'
              )}
              onClick={() => onAlertClick?.(alert)}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{alert.title}</span>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(alert.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(alert.timestamp)}
                      </span>
                    </div>
                    {!alert.isRead && onMarkRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          onMarkRead(alert.id)
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
