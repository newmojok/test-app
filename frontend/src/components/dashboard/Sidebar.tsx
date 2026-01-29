import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  Grid3X3,
  Bell,
  Settings,
  ChevronLeft,
  DollarSign,
  Gauge,
  Wrench,
  BookOpen,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'liquidity', label: 'Liquidity', icon: DollarSign },
  { id: 'credit', label: 'Credit Impulse', icon: TrendingUp },
  { id: 'maturities', label: 'Debt Calendar', icon: Calendar },
  { id: 'correlations', label: 'Correlations', icon: Grid3X3 },
  { id: 'howell-dashboard', label: 'Howell Dashboard', icon: Gauge },
  { id: 'howell-tools', label: 'Howell Tools', icon: Wrench },
  { id: 'howell-framework', label: 'Framework', icon: BookOpen },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, activeTab, setActiveTab, unreadAlertCount } = useAppStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">LiquidityTracker</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(!sidebarOpen && 'mx-auto')}
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform', !sidebarOpen && 'rotate-180')}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                !sidebarOpen && 'justify-center px-2'
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', sidebarOpen && 'mr-3')} />
                {item.id === 'alerts' && unreadAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">
                    {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                  </span>
                )}
              </div>
              {sidebarOpen && <span>{item.label}</span>}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
