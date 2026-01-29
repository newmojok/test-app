import { create } from 'zustand'
import type { CountryCode, Alert, ChartConfig } from '@/types'
import type { HowellIndicator } from '@/data/howellIndicators'
import { howellIndicators as defaultHowellIndicators } from '@/data/howellIndicators'
import { fetchAllLiveData, type AllLiveData } from '@/services/liveDataApi'

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
  howellRefreshErrors: string[]

  // Live prices (for display elsewhere)
  livePrices: {
    bitcoin: number | null
    ethereum: number | null
    sp500: number | null
    gold: number | null
  }

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
  howellRefreshErrors: [],

  // Live prices
  livePrices: {
    bitcoin: null,
    ethereum: null,
    sp500: null,
    gold: null,
  },

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
    set({ howellIsRefreshing: true, howellRefreshErrors: [] })

    try {
      // Fetch real data from APIs
      const liveData: AllLiveData = await fetchAllLiveData()

      const currentIndicators = get().howellIndicators
      const now = new Date().toISOString().split('T')[0]

      // Helper to determine signal based on indicator and value
      const getSignalForIndicator = (
        id: string,
        value: number,
        prevValue: number
      ): { signal: 'bullish' | 'bearish' | 'neutral'; strength: number; interpretation: string } => {
        switch (id) {
          case 'dxy':
            if (value < 98)
              return {
                signal: 'bullish',
                strength: 70,
                interpretation: `DXY at ${value.toFixed(1)} is below 98, providing tailwinds for risk assets and global liquidity.`,
              }
            if (value > 105)
              return {
                signal: 'bearish',
                strength: 65,
                interpretation: `DXY at ${value.toFixed(1)} represents dollar strength above 105, creating headwinds for global liquidity.`,
              }
            return {
              signal: 'neutral',
              strength: 50,
              interpretation: `DXY at ${value.toFixed(1)} is in neutral territory (98-105). Watch for directional break.`,
            }

          case 'walcl':
            const walclInT = value / 1e12
            if (walclInT > 7.5)
              return {
                signal: 'bullish',
                strength: 70,
                interpretation: `Fed balance sheet at $${walclInT.toFixed(2)}T remains elevated, supporting liquidity conditions.`,
              }
            if (walclInT < 6.5)
              return {
                signal: 'bearish',
                strength: 65,
                interpretation: `Fed balance sheet at $${walclInT.toFixed(2)}T approaching QT targets, tightening liquidity.`,
              }
            return {
              signal: 'neutral',
              strength: 50,
              interpretation: `Fed balance sheet at $${walclInT.toFixed(2)}T in transition phase of QT.`,
            }

          case 'tga':
            const tgaInB = value / 1e9
            if (tgaInB > 700)
              return {
                signal: 'bearish',
                strength: 60,
                interpretation: `TGA at $${tgaInB.toFixed(0)}B is elevated, draining reserves from the system.`,
              }
            if (tgaInB < 300)
              return {
                signal: 'bullish',
                strength: 65,
                interpretation: `TGA at $${tgaInB.toFixed(0)}B is low, releasing liquidity into the system.`,
              }
            return {
              signal: 'neutral',
              strength: 50,
              interpretation: `TGA at $${tgaInB.toFixed(0)}B is at moderate levels.`,
            }

          case 'rrp':
            const rrpInB = value / 1e9
            if (rrpInB < 200)
              return {
                signal: 'bullish',
                strength: 75,
                interpretation: `RRP at $${rrpInB.toFixed(0)}B is near zero, indicating liquidity has been fully deployed into markets.`,
              }
            if (rrpInB > 1000)
              return {
                signal: 'bearish',
                strength: 60,
                interpretation: `RRP at $${rrpInB.toFixed(0)}B shows excess liquidity parked at the Fed rather than in markets.`,
              }
            return {
              signal: 'neutral',
              strength: 55,
              interpretation: `RRP at $${rrpInB.toFixed(0)}B declining, gradually releasing liquidity.`,
            }

          default:
            return { signal: 'neutral', strength: 50, interpretation: '' }
        }
      }

      // Update indicators with real data where available
      const refreshedIndicators = currentIndicators.map((indicator) => {
        let newValue = indicator.currentValue
        let newSignal = indicator.signal
        let newSignalStrength = indicator.signalStrength
        let newInterpretation = indicator.interpretation
        let source = indicator.source.name

        // Map live data to indicators
        if (indicator.id === 'walcl' && liveData.fed.walcl) {
          newValue = liveData.fed.walcl.value
          source = 'FRED (Live)'
          const signalData = getSignalForIndicator('walcl', newValue, indicator.currentValue)
          newSignal = signalData.signal
          newSignalStrength = signalData.strength
          newInterpretation = signalData.interpretation
        } else if (indicator.id === 'tga' && liveData.fed.tga) {
          newValue = liveData.fed.tga.value
          source = 'FRED (Live)'
          const signalData = getSignalForIndicator('tga', newValue, indicator.currentValue)
          newSignal = signalData.signal
          newSignalStrength = signalData.strength
          newInterpretation = signalData.interpretation
        } else if (indicator.id === 'rrp' && liveData.fed.rrp) {
          newValue = liveData.fed.rrp.value
          source = 'FRED (Live)'
          const signalData = getSignalForIndicator('rrp', newValue, indicator.currentValue)
          newSignal = signalData.signal
          newSignalStrength = signalData.strength
          newInterpretation = signalData.interpretation
        } else if (indicator.id === 'dxy' && liveData.market.dxy) {
          newValue = liveData.market.dxy.value
          source = liveData.market.dxy.source + ' (Live)'
          const signalData = getSignalForIndicator('dxy', newValue, indicator.currentValue)
          newSignal = signalData.signal
          newSignalStrength = signalData.strength
          newInterpretation = signalData.interpretation
        }

        return {
          ...indicator,
          previousValue: indicator.currentValue,
          currentValue: newValue,
          signal: newSignal,
          signalStrength: newSignalStrength,
          interpretation: newInterpretation,
          lastUpdated: now,
          source: { ...indicator.source, name: source },
        }
      })

      // Update live prices
      const newLivePrices = {
        bitcoin: liveData.crypto.bitcoin?.price ?? get().livePrices.bitcoin,
        ethereum: liveData.crypto.ethereum?.price ?? get().livePrices.ethereum,
        sp500: liveData.market.sp500?.price ?? get().livePrices.sp500,
        gold: liveData.market.gold?.price ?? get().livePrices.gold,
      }

      set({
        howellIndicators: refreshedIndicators,
        howellLastRefresh: new Date().toISOString(),
        howellIsRefreshing: false,
        howellRefreshErrors: liveData.errors,
        livePrices: newLivePrices,
      })

      // Log what was updated
      console.log('Live data refresh complete:', {
        btc: liveData.crypto.bitcoin?.price,
        eth: liveData.crypto.ethereum?.price,
        dxy: liveData.market.dxy?.value,
        walcl: liveData.fed.walcl?.value,
        tga: liveData.fed.tga?.value,
        rrp: liveData.fed.rrp?.value,
        errors: liveData.errors,
      })
    } catch (error) {
      console.error('Failed to refresh Howell indicators:', error)
      set({
        howellIsRefreshing: false,
        howellRefreshErrors: ['Failed to fetch live data. Please try again.'],
      })
    }
  },
}))
