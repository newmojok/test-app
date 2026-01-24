import { create } from 'zustand'
import type { CountryCode, Alert, ChartConfig } from '@/types'

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
}

export const useAppStore = create<AppState>((set) => ({
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
}))
