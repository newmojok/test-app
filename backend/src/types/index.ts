export interface M2DataPoint {
  id?: number
  country: CountryCode
  date: Date
  value: number
  roc6m: number | null
  yoyChange: number | null
  zscore: number | null
}

export type CountryCode = 'US' | 'CN' | 'EU' | 'JP' | 'UK'

export interface CreditImpulseData {
  id?: number
  country: CountryCode
  quarter: Date
  newCredit: number
  gdp: number
  impulse: number
}

export interface DebtMaturity {
  id?: number
  issuer: string
  amount: number
  maturityDate: Date
  coupon: number
  rating: string
  geography: string
  sector: 'Sovereign' | 'IG_Corp' | 'HY_Corp'
}

export interface Alert {
  id?: number
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  timestamp: Date
  relatedChart: string | null
  isRead: boolean
  userId?: string
}

export type AlertType = 'M2_INFLECTION' | 'CREDIT_REVERSAL' | 'MATURITY_SPIKE' | 'CUSTOM'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface AlertThresholds {
  m2RocUpper: number
  m2RocLower: number
  maturitySpike: number
}

export interface CorrelationResult {
  asset1: string
  asset2: string
  correlation: number
  lag: number
  period: string
}

export interface FredSeriesResponse {
  realtime_start: string
  realtime_end: string
  observation_start: string
  observation_end: string
  units: string
  output_type: number
  file_type: string
  order_by: string
  sort_order: string
  count: number
  offset: number
  limit: number
  observations: FredObservation[]
}

export interface FredObservation {
  realtime_start: string
  realtime_end: string
  date: string
  value: string
}

export interface DashboardStats {
  globalM2Roc: number
  creditImpulse: number
  next12MonthMaturities: number
  activeAlerts: number
}

export interface QuarterlyMaturity {
  quarter: string
  sovereign: number
  igCorp: number
  hyCorp: number
  total: number
}
