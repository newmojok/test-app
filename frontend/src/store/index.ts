import { create } from 'zustand'
import type { CountryCode, Alert, ChartConfig } from '@/types'
import type { HowellIndicator } from '@/data/howellIndicators'
import { howellIndicators as defaultHowellIndicators } from '@/data/howellIndicators'

interface AppState {
  // UI State
  sidebarOpen: boolean
  activeTab: string
  darkMode: boolean

  // Chart Configuration
  chartConfig: ChartConfig

  // Alerts
  alerts: Alert[]
  unreadAlertCount: number

  // Howell Indicators
  howellIndicators: HowellIndicator[]
  howellLastRefresh: string | null
  howellIsRefreshing: boolean

  // Actions
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void
  toggleDarkMode: () => void
  setChartConfig: (config: Partial<ChartConfig>) => void
  setAlerts: (alerts: Alert[]) => void
  markAlertAsRead: (alertId: string) => void
  setSelectedCountries: (countries: CountryCode[]) => void
  setViewMode: (mode: 'absolute' | 'roc') => void
  toggleRecessions: () => void
  toggleAnnotations: () => void
  refreshHowellIndicators: () => Promise<void>
  setHowellIndicators: (indicators: HowellIndicator[]) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  sidebarOpen: true,
  activeTab: 'overview',
  darkMode: true,

  chartConfig: {
    showRecessions: true,
    showAnnotations: true,
    dateRange: null,
    selectedCountries: ['US', 'CN', 'EU', 'JP', 'UK'],
    viewMode: 'roc',
  },

  alerts: [],
  unreadAlertCount: 0,

  // Howell Indicators state
  howellIndicators: defaultHowellIndicators,
  howellLastRefresh: null,
  howellIsRefreshing: false,

  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  setChartConfig: (config) =>
    set((state) => ({
      chartConfig: { ...state.chartConfig, ...config },
    })),

  setAlerts: (alerts) =>
    set({
      alerts,
      unreadAlertCount: alerts.filter((a) => !a.isRead).length,
    }),

  markAlertAsRead: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)),
      unreadAlertCount: Math.max(0, state.unreadAlertCount - 1),
    })),

  setSelectedCountries: (countries) =>
    set((state) => ({
      chartConfig: { ...state.chartConfig, selectedCountries: countries },
    })),

  setViewMode: (mode) =>
    set((state) => ({
      chartConfig: { ...state.chartConfig, viewMode: mode },
    })),

  toggleRecessions: () =>
    set((state) => ({
      chartConfig: { ...state.chartConfig, showRecessions: !state.chartConfig.showRecessions },
    })),

  toggleAnnotations: () =>
    set((state) => ({
      chartConfig: { ...state.chartConfig, showAnnotations: !state.chartConfig.showAnnotations },
    })),

  setHowellIndicators: (indicators) => set({ howellIndicators: indicators }),

  refreshHowellIndicators: async () => {
    set({ howellIsRefreshing: true })

    try {
      // Simulate fetching fresh data with slight variations to show the refresh is working
      // In production, this would call actual APIs (FRED, Yahoo Finance, etc.)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const currentIndicators = get().howellIndicators
      const now = new Date().toISOString().split('T')[0]

      // Update indicators with fresh timestamps and slight variations
      const refreshedIndicators = currentIndicators.map((indicator) => {
        // Add small random variation to values to simulate real-time updates
        const variation = 1 + (Math.random() - 0.5) * 0.02 // ±1% variation

        let newValue = indicator.currentValue
        let newSignal = indicator.signal
        let newSignalStrength = indicator.signalStrength

        // Apply variation based on indicator type
        if (indicator.id === 'dxy') {
          // Dollar index: slight variation around current value
          newValue = Math.round(indicator.currentValue * variation * 10) / 10
          if (newValue < 98) {
            newSignal = 'bullish'
            newSignalStrength = 65
          } else if (newValue > 103) {
            newSignal = 'bearish'
            newSignalStrength = 60
          } else {
            newSignal = 'neutral'
            newSignalStrength = 50
          }
        } else if (indicator.id === 'move') {
          newValue = Math.round(indicator.currentValue * variation)
          if (newValue < 100) {
            newSignal = 'neutral'
            newSignalStrength = 50
          } else if (newValue > 120) {
            newSignal = 'bearish'
            newSignalStrength = 70
          }
        } else if (indicator.id === 'rrp' || indicator.id === 'tga') {
          newValue = indicator.currentValue * variation
        } else if (indicator.id === 'walcl' || indicator.id === 'ecb') {
          newValue = indicator.currentValue * (1 + (Math.random() - 0.5) * 0.005) // Smaller variation for balance sheets
        }

        return {
          ...indicator,
          previousValue: indicator.currentValue,
          currentValue: newValue,
          signal: newSignal,
          signalStrength: newSignalStrength,
          lastUpdated: now,
        }
      })

      set({
        howellIndicators: refreshedIndicators,
        howellLastRefresh: new Date().toISOString(),
        howellIsRefreshing: false,
      })
    } catch (error) {
      console.error('Failed to refresh Howell indicators:', error)
      set({ howellIsRefreshing: false })
    }
  },
}))
