import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Alert, AlertTitle, AlertDescription, AlertIcon } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, Bell } from 'lucide-react'
import type { Alert as AlertType, AlertSeverity } from '@/types'

interface AlertsBannerProps {
  alerts: AlertType[]
  onDismiss?: (alertId: string) => void
  onViewAll?: () => void
}

function getAlertVariant(severity: AlertSeverity) {
  switch (severity) {
    case 'critical':
      return 'destructive'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
}

export function AlertsBanner({ alerts, onDismiss, onViewAll }: AlertsBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const unreadAlerts = alerts.filter((a) => !a.isRead)

  if (unreadAlerts.length === 0) {
    return null
  }

  const currentAlert = unreadAlerts[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % unreadAlerts.length)
  }

  const handleDismiss = () => {
    if (onDismiss && currentAlert) {
      onDismiss(currentAlert.id)
      if (currentIndex >= unreadAlerts.length - 1) {
        setCurrentIndex(0)
      }
    }
  }

  return (
    <Alert variant={getAlertVariant(currentAlert.severity)} className="relative">
      <AlertIcon variant={getAlertVariant(currentAlert.severity) as 'info' | 'success' | 'warning' | 'destructive'} />
      <AlertTitle className="flex items-center gap-2">
        <Bell className="h-4 w-4" />
        {currentAlert.title}
        {unreadAlerts.length > 1 && (
          <span className="text-xs opacity-70">
            ({currentIndex + 1} of {unreadAlerts.length})
          </span>
        )}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{currentAlert.message}</span>
        <div className="flex items-center gap-2">
          {unreadAlerts.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  )
}
