import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Bell, Moon, Sun, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  onRefresh?: () => void
  isLoading?: boolean
}

export function Header({ onRefresh, isLoading }: HeaderProps) {
  const { darkMode, toggleDarkMode, unreadAlertCount, setActiveTab } = useAppStore()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div>
        <h1 className="text-xl font-semibold">Global Liquidity Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Real-time M2, Credit Impulse & Debt Maturity Tracking
        </p>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setActiveTab('alerts')}
        >
          <Bell className="h-5 w-5" />
          {unreadAlertCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
            </Badge>
          )}
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  )
}
