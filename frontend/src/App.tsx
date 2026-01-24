import { useState, useCallback, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAppStore } from './store'
import { cn } from './lib/utils'

// Layout components
import { Sidebar } from './components/dashboard/Sidebar'
import { Header } from './components/dashboard/Header'

// Page components
import { OverviewPage } from './components/pages/OverviewPage'
import { LiquidityPage } from './components/pages/LiquidityPage'
import { CreditImpulsePage } from './components/pages/CreditImpulsePage'
import { MaturitiesPage } from './components/pages/MaturitiesPage'
import { CorrelationsPage } from './components/pages/CorrelationsPage'
import { AlertsPage } from './components/pages/AlertsPage'
import { SettingsPage } from './components/pages/SettingsPage'

// Mock data for development
import {
  mockM2Data,
  mockCreditImpulseData,
  mockQuarterlyMaturities,
  mockDebtMaturities,
  mockAlerts,
  mockCorrelationMatrix,
  mockDashboardStats,
} from './data/mockData'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

function Dashboard() {
  const { activeTab, setActiveTab, sidebarOpen, setAlerts, alerts, markAlertAsRead } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)

  // Initialize alerts from mock data
  useEffect(() => {
    setAlerts(mockAlerts)
  }, [setAlerts])

  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    // Simulate API refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }, [])

  const handleDismissAlert = useCallback(
    (alertId: string) => {
      markAlertAsRead(alertId)
    },
    [markAlertAsRead]
  )

  const handleMarkAllRead = useCallback(() => {
    alerts.forEach((alert) => {
      if (!alert.isRead) {
        markAlertAsRead(alert.id)
      }
    })
  }, [alerts, markAlertAsRead])

  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            m2Data={mockM2Data}
            alerts={alerts}
            stats={mockDashboardStats}
            isLoading={isLoading}
            onDismissAlert={handleDismissAlert}
            onViewAllAlerts={() => setActiveTab('alerts')}
          />
        )
      case 'liquidity':
        return <LiquidityPage m2Data={mockM2Data} isLoading={isLoading} />
      case 'credit':
        return <CreditImpulsePage data={mockCreditImpulseData} isLoading={isLoading} />
      case 'maturities':
        return (
          <MaturitiesPage
            quarterlyData={mockQuarterlyMaturities}
            maturities={mockDebtMaturities}
            isLoading={isLoading}
          />
        )
      case 'correlations':
        return <CorrelationsPage data={mockCorrelationMatrix} isLoading={isLoading} />
      case 'alerts':
        return (
          <AlertsPage
            alerts={alerts}
            isLoading={isLoading}
            onMarkRead={handleDismissAlert}
            onMarkAllRead={handleMarkAllRead}
          />
        )
      case 'settings':
        return <SettingsPage />
      default:
        return (
          <OverviewPage
            m2Data={mockM2Data}
            alerts={alerts}
            stats={mockDashboardStats}
            isLoading={isLoading}
            onDismissAlert={handleDismissAlert}
            onViewAllAlerts={() => setActiveTab('alerts')}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <Header onRefresh={handleRefresh} isLoading={isLoading} />
        <main className="p-6">{renderPage()}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}
