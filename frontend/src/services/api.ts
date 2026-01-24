import axios from 'axios'
import type {
  M2CountryData,
  GlobalM2Aggregate,
  CreditImpulseData,
  DebtMaturity,
  QuarterlyMaturity,
  Alert,
  CorrelationMatrix,
  DashboardStats,
  CountryCode,
} from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// M2 Data endpoints
export async function fetchM2Data(country?: CountryCode): Promise<M2CountryData[]> {
  const params = country ? { country } : {}
  const response = await api.get<M2CountryData[]>('/m2', { params })
  return response.data
}

export async function fetchGlobalM2Aggregate(): Promise<GlobalM2Aggregate[]> {
  const response = await api.get<GlobalM2Aggregate[]>('/m2/aggregate')
  return response.data
}

// Credit Impulse endpoints
export async function fetchCreditImpulse(country?: CountryCode): Promise<CreditImpulseData[]> {
  const params = country ? { country } : {}
  const response = await api.get<CreditImpulseData[]>('/credit-impulse', { params })
  return response.data
}

// Debt Maturity endpoints
export async function fetchDebtMaturities(filters?: {
  geography?: string
  sector?: string
  rating?: string
  startDate?: string
  endDate?: string
}): Promise<DebtMaturity[]> {
  const response = await api.get<DebtMaturity[]>('/maturities', { params: filters })
  return response.data
}

export async function fetchQuarterlyMaturities(): Promise<QuarterlyMaturity[]> {
  const response = await api.get<QuarterlyMaturity[]>('/maturities/quarterly')
  return response.data
}

// Alert endpoints
export async function fetchAlerts(unreadOnly?: boolean): Promise<Alert[]> {
  const params = unreadOnly ? { unread: true } : {}
  const response = await api.get<Alert[]>('/alerts', { params })
  return response.data
}

export async function markAlertRead(alertId: string): Promise<void> {
  await api.patch(`/alerts/${alertId}/read`)
}

export async function updateAlertThresholds(thresholds: {
  m2RocUpper: number
  m2RocLower: number
  maturitySpike: number
}): Promise<void> {
  await api.put('/alerts/thresholds', thresholds)
}

// Correlation endpoints
export async function fetchCorrelationMatrix(
  assets?: string[],
  lag?: number
): Promise<CorrelationMatrix> {
  const params: Record<string, string | number> = {}
  if (assets) params.assets = assets.join(',')
  if (lag !== undefined) params.lag = lag
  const response = await api.get<CorrelationMatrix>('/correlations', { params })
  return response.data
}

// Dashboard stats
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>('/stats')
  return response.data
}

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  const response = await api.get<{ status: string }>('/health')
  return response.data
}
