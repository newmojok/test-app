import type {
  M2CountryData,
  CreditImpulseData,
  QuarterlyMaturity,
  DebtMaturity,
  Alert,
  CorrelationMatrix,
  DashboardStats,
} from '@/types'

// Generate realistic M2 data points
function generateM2Data(
  country: string,
  baseValue: number,
  startDate: Date,
  months: number
): { date: string; value: number; roc6m: number; yoyChange: number; zscore: number }[] {
  const data = []
  let value = baseValue

  for (let i = 0; i < months; i++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + i)

    // Add some realistic variation
    const growth = 0.002 + Math.sin(i * 0.2) * 0.005 + Math.random() * 0.003
    value *= 1 + growth

    // Calculate 6-month RoC
    const prev6m = i >= 6 ? data[i - 6].value : value * 0.97
    const roc6m = ((value - prev6m) / prev6m) * 100

    // Calculate YoY change
    const prevYear = i >= 12 ? data[i - 12].value : value * 0.92
    const yoyChange = ((value - prevYear) / prevYear) * 100

    // Calculate z-score (simplified)
    const zscore = (roc6m - 3.5) / 2.5

    data.push({
      date: date.toISOString().split('T')[0],
      value,
      roc6m,
      yoyChange,
      zscore,
    })
  }

  return data
}

const startDate = new Date('2020-01-01')
const months = 60

export const mockM2Data: M2CountryData[] = [
  {
    country: 'US',
    name: 'United States',
    data: generateM2Data('US', 15.4e12, startDate, months),
    latestValue: 21.2e12,
    latestRoc: 3.8,
    color: '#3b82f6',
  },
  {
    country: 'CN',
    name: 'China',
    data: generateM2Data('CN', 198e12 * 0.14, startDate, months), // Convert CNY to USD
    latestValue: 42.5e12,
    latestRoc: 7.2,
    color: '#ef4444',
  },
  {
    country: 'EU',
    name: 'Eurozone',
    data: generateM2Data('EU', 12.8e12, startDate, months),
    latestValue: 16.1e12,
    latestRoc: 2.1,
    color: '#22c55e',
  },
  {
    country: 'JP',
    name: 'Japan',
    data: generateM2Data('JP', 9.8e12 * 0.009, startDate, months), // Convert JPY to USD
    latestValue: 8.9e12,
    latestRoc: 1.8,
    color: '#f97316',
  },
  {
    country: 'UK',
    name: 'United Kingdom',
    data: generateM2Data('UK', 2.9e12, startDate, months),
    latestValue: 3.6e12,
    latestRoc: 2.4,
    color: '#8b5cf6',
  },
]

export const mockCreditImpulseData: CreditImpulseData[] = Array.from({ length: 20 }, (_, i) => {
  const date = new Date('2020-01-01')
  date.setMonth(date.getMonth() + i * 3)

  return {
    date: date.toISOString().split('T')[0],
    country: 'CN' as const,
    newCredit: 2500 + Math.random() * 1000,
    gdp: 17000 + i * 500,
    impulse: (Math.sin(i * 0.5) * 0.04) + (Math.random() - 0.5) * 0.02,
  }
})

export const mockQuarterlyMaturities: QuarterlyMaturity[] = [
  { quarter: 'Q1 2025', sovereign: 180, igCorp: 120, hyCorp: 45, total: 345 },
  { quarter: 'Q2 2025', sovereign: 210, igCorp: 150, hyCorp: 60, total: 420 },
  { quarter: 'Q3 2025', sovereign: 195, igCorp: 180, hyCorp: 55, total: 430 },
  { quarter: 'Q4 2025', sovereign: 240, igCorp: 200, hyCorp: 70, total: 510 },
  { quarter: 'Q1 2026', sovereign: 280, igCorp: 220, hyCorp: 85, total: 585 },
  { quarter: 'Q2 2026', sovereign: 320, igCorp: 250, hyCorp: 95, total: 665 },
  { quarter: 'Q3 2026', sovereign: 290, igCorp: 230, hyCorp: 80, total: 600 },
  { quarter: 'Q4 2026', sovereign: 350, igCorp: 280, hyCorp: 110, total: 740 },
  { quarter: 'Q1 2027', sovereign: 380, igCorp: 300, hyCorp: 120, total: 800 },
  { quarter: 'Q2 2027', sovereign: 340, igCorp: 260, hyCorp: 100, total: 700 },
]

export const mockDebtMaturities: DebtMaturity[] = [
  { id: '1', issuer: 'US Treasury', amount: 85, maturityDate: '2025-03-15', coupon: 2.5, rating: 'AAA', geography: 'US', sector: 'Sovereign' },
  { id: '2', issuer: 'Apple Inc', amount: 12, maturityDate: '2025-05-01', coupon: 3.2, rating: 'AA', geography: 'US', sector: 'IG_Corp' },
  { id: '3', issuer: 'Microsoft Corp', amount: 8, maturityDate: '2025-06-15', coupon: 2.8, rating: 'AAA', geography: 'US', sector: 'IG_Corp' },
  { id: '4', issuer: 'Germany Bund', amount: 45, maturityDate: '2025-07-01', coupon: 1.5, rating: 'AAA', geography: 'EU', sector: 'Sovereign' },
  { id: '5', issuer: 'China Govt', amount: 120, maturityDate: '2025-08-15', coupon: 3.0, rating: 'A', geography: 'China', sector: 'Sovereign' },
  { id: '6', issuer: 'UK Gilt', amount: 35, maturityDate: '2025-09-01', coupon: 2.2, rating: 'AA', geography: 'EU', sector: 'Sovereign' },
  { id: '7', issuer: 'Amazon.com', amount: 10, maturityDate: '2025-10-15', coupon: 3.5, rating: 'AA', geography: 'US', sector: 'IG_Corp' },
  { id: '8', issuer: 'Toyota Motor', amount: 6, maturityDate: '2025-11-01', coupon: 2.1, rating: 'A', geography: 'EM', sector: 'IG_Corp' },
  { id: '9', issuer: 'Tesla Inc', amount: 4, maturityDate: '2025-12-15', coupon: 5.5, rating: 'BB+', geography: 'US', sector: 'HY_Corp' },
  { id: '10', issuer: 'France OAT', amount: 55, maturityDate: '2026-01-01', coupon: 1.8, rating: 'AA', geography: 'EU', sector: 'Sovereign' },
  { id: '11', issuer: 'Japan JGB', amount: 95, maturityDate: '2026-02-15', coupon: 0.5, rating: 'A', geography: 'EM', sector: 'Sovereign' },
  { id: '12', issuer: 'Netflix Inc', amount: 3, maturityDate: '2026-03-01', coupon: 5.8, rating: 'BB', geography: 'US', sector: 'HY_Corp' },
  { id: '13', issuer: 'Goldman Sachs', amount: 15, maturityDate: '2026-04-15', coupon: 3.8, rating: 'A', geography: 'US', sector: 'IG_Corp' },
  { id: '14', issuer: 'Italy BTP', amount: 65, maturityDate: '2026-05-01', coupon: 2.5, rating: 'BBB', geography: 'EU', sector: 'Sovereign' },
  { id: '15', issuer: 'Ford Motor', amount: 5, maturityDate: '2026-06-15', coupon: 6.2, rating: 'BB+', geography: 'US', sector: 'HY_Corp' },
]

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'M2_INFLECTION',
    severity: 'critical',
    title: 'M2 RoC Crossed +5% Threshold',
    message: 'Global M2 6-month rate of change has crossed above +5%, signaling potential risk-on conditions ahead.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relatedChart: 'liquidity',
    isRead: false,
  },
  {
    id: '2',
    type: 'CREDIT_REVERSAL',
    severity: 'warning',
    title: 'China Credit Impulse Turning Positive',
    message: 'China credit impulse is showing signs of reversal from negative to positive territory.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    relatedChart: 'credit',
    isRead: false,
  },
  {
    id: '3',
    type: 'MATURITY_SPIKE',
    severity: 'warning',
    title: 'Q4 2026 Maturity Wall Alert',
    message: 'Quarterly maturities exceed $700B in Q4 2026, potential refinancing stress.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    relatedChart: 'maturities',
    isRead: true,
  },
  {
    id: '4',
    type: 'M2_INFLECTION',
    severity: 'info',
    title: 'US M2 Growth Accelerating',
    message: 'US M2 6-month RoC has increased for 3 consecutive months.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    relatedChart: 'liquidity',
    isRead: true,
  },
]

export const mockCorrelationMatrix: CorrelationMatrix = {
  assets: ['Global M2 RoC', 'Credit Impulse', 'BTC', 'S&P 500', 'Gold', 'DXY'],
  matrix: [
    [1.0, 0.45, 0.78, 0.62, 0.54, -0.48],
    [0.45, 1.0, 0.52, 0.67, 0.38, -0.35],
    [0.78, 0.52, 1.0, 0.68, 0.42, -0.62],
    [0.62, 0.67, 0.68, 1.0, 0.35, -0.45],
    [0.54, 0.38, 0.42, 0.35, 1.0, -0.55],
    [-0.48, -0.35, -0.62, -0.45, -0.55, 1.0],
  ],
  period: '90-day rolling',
}

export const mockDashboardStats: DashboardStats = {
  globalM2Roc: 4.2,
  creditImpulse: 1.8,
  next12MonthMaturities: 1.85e12,
  activeAlerts: 2,
}
