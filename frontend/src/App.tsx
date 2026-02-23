import { useCallback } from 'react'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
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
import { HowellDashboardPage } from './components/pages/HowellDashboardPage'
import { HowellToolsPage } from './components/pages/HowellToolsPage'
import { HowellFrameworkPage } from './components/pages/HowellFrameworkPage'

// Data hooks for real API data
import { useM2Data } from './hooks/useM2Data'
import { useAlerts, useMarkAlertRead } from './hooks/useAlerts'
import { useDashboardStats } from './hooks/useDashboardStats'
import { useCreditImpulse } from './hooks/useCreditImpulse'
import { useDebtMaturities, useQuarterlyMaturities } from './hooks/useDebtMaturities'
import { useCorrelationMatrix } from './hooks/useCorrelations'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

function Dashboard() {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    refreshHowellIndicators,
    howellIsRefreshing,
  } = useAppStore()

  const queryClientInstance = useQueryClient()

  // Fetch all data using React Query hooks (real API data)
  const { data: m2Data, isLoading: m2Loading } = useM2Data()
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: creditImpulseData, isLoading: creditLoading } = useCreditImpulse()
  const { data: maturities, isLoading: maturitiesLoading } = useDebtMaturities()
  const { data: quarterlyMaturities, isLoading: quarterlyLoading } = useQuarterlyMaturities()
  const { data: correlationMatrix, isLoading: correlationsLoading } = useCorrelationMatrix()

  const markAlertReadMutation = useMarkAlertRead()

  const isLoading = m2Loading || alertsLoading || statsLoading

  const handleRefresh = useCallback(async () => {
    // Refresh Howell indicators
    await refreshHowellIndicators()

    // Invalidate all queries to refetch fresh data from API
    await queryClientInstance.invalidateQueries()
  }, [refreshHowellIndicators, queryClientInstance])

  const handleDismissAlert = useCallback(
    (alertId: string) => {
      markAlertReadMutation.mutate(alertId)
    },
    [markAlertReadMutation]
  )

  const handleMarkAllRead = useCallback(() => {
    alerts.forEach((alert) => {
      if (!alert.isRead) {
        markAlertReadMutation.mutate(alert.id)
      }
    })
  }, [alerts, markAlertReadMutation])

  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewPage
            m2Data={m2Data ?? []}
            alerts={alerts}
            stats={stats ?? null}
            isLoading={isLoading}
            onDismissAlert={handleDismissAlert}
            onViewAllAlerts={() => setActiveTab('alerts')}
          />
        )
      case 'liquidity':
        return <LiquidityPage m2Data={m2Data ?? []} isLoading={m2Loading} />
      case 'credit':
        return <CreditImpulsePage data={creditImpulseData ?? []} isLoading={creditLoading} />
      case 'maturities':
        return (
          <MaturitiesPage
            quarterlyData={quarterlyMaturities ?? []}
            maturities={maturities ?? []}
            isLoading={maturitiesLoading || quarterlyLoading}
          />
        )
      case 'correlations':
        return <CorrelationsPage data={correlationMatrix ?? null} isLoading={correlationsLoading} />
      case 'howell-dashboard':
        return <HowellDashboardPage />
      case 'howell-tools':
        return <HowellToolsPage />
      case 'howell-framework':
        return <HowellFrameworkPage />
      case 'alerts':
        return (
          <AlertsPage
            alerts={alerts}
            isLoading={alertsLoading}
            onMarkRead={handleDismissAlert}
            onMarkAllRead={handleMarkAllRead}
          />
        )
      case 'settings':
        return <SettingsPage />
      default:
        return (
          <OverviewPage
            m2Data={m2Data ?? []}
            alerts={alerts}
            stats={stats ?? null}
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
        <Header onRefresh={handleRefresh} isLoading={isLoading || howellIsRefreshing} />
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
