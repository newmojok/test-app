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
interface M2DataPoint {
  date: string
  value: number
  roc6m: number
  yoyChange: number
  zscore: number
}

function generateM2Data(
  _country: string,
  baseValue: number,
  startDate: Date,
  months: number
): M2DataPoint[] {
  const data: M2DataPoint[] = []
  let value = baseValue

  for (let i = 0; i < months; i++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + i)

    // Add some realistic variation
    const growth = 0.002 + Math.sin(i * 0.2) * 0.005 + Math.random() * 0.003
    value *= 1 + growth

    // Calculate 6-month RoC
    const prev6mValue: number = i >= 6 ? data[i - 6].value : value * 0.97
    const roc6m = ((value - prev6mValue) / prev6mValue) * 100

    // Calculate YoY change
    const prevYearValue: number = i >= 12 ? data[i - 12].value : value * 0.92
    const yoyChange = ((value - prevYearValue) / prevYearValue) * 100

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
const months = 61 // Through January 2025

// Bitcoin price data (monthly, USD) - for overlay on charts
export const mockBitcoinData: { date: string; price: number }[] = [
  { date: '2020-01-01', price: 7200 },
  { date: '2020-02-01', price: 8500 },
  { date: '2020-03-01', price: 6400 },
  { date: '2020-04-01', price: 8800 },
  { date: '2020-05-01', price: 9500 },
  { date: '2020-06-01', price: 9100 },
  { date: '2020-07-01', price: 11100 },
  { date: '2020-08-01', price: 11700 },
  { date: '2020-09-01', price: 10800 },
  { date: '2020-10-01', price: 13800 },
  { date: '2020-11-01', price: 19700 },
  { date: '2020-12-01', price: 29000 },
  { date: '2021-01-01', price: 33100 },
  { date: '2021-02-01', price: 45200 },
  { date: '2021-03-01', price: 58800 },
  { date: '2021-04-01', price: 57700 },
  { date: '2021-05-01', price: 37300 },
  { date: '2021-06-01', price: 35000 },
  { date: '2021-07-01', price: 41500 },
  { date: '2021-08-01', price: 47100 },
  { date: '2021-09-01', price: 43800 },
  { date: '2021-10-01', price: 61300 },
  { date: '2021-11-01', price: 57000 },
  { date: '2021-12-01', price: 46200 },
  { date: '2022-01-01', price: 38500 },
  { date: '2022-02-01', price: 43200 },
  { date: '2022-03-01', price: 45500 },
  { date: '2022-04-01', price: 38000 },
  { date: '2022-05-01', price: 31800 },
  { date: '2022-06-01', price: 19900 },
  { date: '2022-07-01', price: 23300 },
  { date: '2022-08-01', price: 20000 },
  { date: '2022-09-01', price: 19400 },
  { date: '2022-10-01', price: 20500 },
  { date: '2022-11-01', price: 17200 },
  { date: '2022-12-01', price: 16500 },
  { date: '2023-01-01', price: 23100 },
  { date: '2023-02-01', price: 23500 },
  { date: '2023-03-01', price: 28400 },
  { date: '2023-04-01', price: 29200 },
  { date: '2023-05-01', price: 27200 },
  { date: '2023-06-01', price: 30500 },
  { date: '2023-07-01', price: 29200 },
  { date: '2023-08-01', price: 26000 },
  { date: '2023-09-01', price: 27000 },
  { date: '2023-10-01', price: 34500 },
  { date: '2023-11-01', price: 37700 },
  { date: '2023-12-01', price: 42200 },
  { date: '2024-01-01', price: 42500 },
  { date: '2024-02-01', price: 51800 },
  { date: '2024-03-01', price: 71000 },
  { date: '2024-04-01', price: 64000 },
  { date: '2024-05-01', price: 67500 },
  { date: '2024-06-01', price: 62700 },
  { date: '2024-07-01', price: 64600 },
  { date: '2024-08-01', price: 59000 },
  { date: '2024-09-01', price: 63300 },
  { date: '2024-10-01', price: 69500 },
  { date: '2024-11-01', price: 91000 },
  { date: '2024-12-01', price: 97000 },
  { date: '2025-01-01', price: 102000 },
]

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

export const mockCreditImpulseData: CreditImpulseData[] = Array.from({ length: 21 }, (_, i) => {
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
