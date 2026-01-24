export interface M2DataPoint {
  date: string
  value: number
  roc6m: number
  yoyChange: number
  zscore: number
}

export interface M2CountryData {
  country: CountryCode
  name: string
  data: M2DataPoint[]
  latestValue: number
  latestRoc: number
  color: string
}

export type CountryCode = 'US' | 'CN' | 'EU' | 'JP' | 'UK'

export interface GlobalM2Aggregate {
  date: string
  totalM2: number
  weightedRoc: number
  byCountry: Record<CountryCode, number>
}

export interface CreditImpulseData {
  date: string
  country: CountryCode
  newCredit: number
  gdp: number
  impulse: number
}

export interface DebtMaturity {
  id: string
  issuer: string
  amount: number
  maturityDate: string
  coupon: number
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB+' | 'BB' | 'B' | 'HY'
  geography: 'US' | 'EU' | 'China' | 'EM' | 'Other'
  sector: 'Sovereign' | 'IG_Corp' | 'HY_Corp'
}

export interface QuarterlyMaturity {
  quarter: string
  sovereign: number
  igCorp: number
  hyCorp: number
  total: number
}

export type AlertType = 'M2_INFLECTION' | 'CREDIT_REVERSAL' | 'MATURITY_SPIKE' | 'CUSTOM'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  timestamp: string
  relatedChart?: string
  isRead: boolean
}

export interface CorrelationData {
  asset1: string
  asset2: string
  lag: number
  correlation: number
  period: string
}

export interface CorrelationMatrix {
  assets: string[]
  matrix: number[][]
  period: string
}

export interface AssetPrice {
  date: string
  symbol: string
  price: number
}

export interface RecessionPeriod {
  start: string
  end: string
  name: string
}

export interface ChartConfig {
  showRecessions: boolean
  showAnnotations: boolean
  dateRange: [Date, Date] | null
  selectedCountries: CountryCode[]
  viewMode: 'absolute' | 'roc'
}

export interface DashboardStats {
  globalM2Roc: number
  creditImpulse: number
  next12MonthMaturities: number
  activeAlerts: number
}
