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

    // Add some realistic variation with cycles
    const cyclePhase = i * 0.15
    const growth = 0.003 + Math.sin(cyclePhase) * 0.006 + (Math.random() - 0.5) * 0.002
    value *= 1 + growth

    // Calculate 6-month RoC
    const prev6mValue: number = i >= 6 ? data[i - 6].value : value * 0.97
    const roc6m = ((value - prev6mValue) / prev6mValue) * 100

    // Calculate YoY change
    const prevYearValue: number = i >= 12 ? data[i - 12].value : value * 0.94
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

// 2015-01 to 2026-01 = 133 months
const startDate = new Date('2015-01-01')
const months = 133

// Bitcoin price data (monthly, USD) - 2015 to Jan 2026
// Includes YoY % change for correlation analysis
export const mockBitcoinData: { date: string; price: number; yoyChange?: number }[] = [
  // 2015
  { date: '2015-01-01', price: 315 },
  { date: '2015-02-01', price: 254 },
  { date: '2015-03-01', price: 244 },
  { date: '2015-04-01', price: 236 },
  { date: '2015-05-01', price: 237 },
  { date: '2015-06-01', price: 263 },
  { date: '2015-07-01', price: 285 },
  { date: '2015-08-01', price: 230 },
  { date: '2015-09-01', price: 237 },
  { date: '2015-10-01', price: 315 },
  { date: '2015-11-01', price: 378 },
  { date: '2015-12-01', price: 430 },
  // 2016
  { date: '2016-01-01', price: 378 },
  { date: '2016-02-01', price: 436 },
  { date: '2016-03-01', price: 416 },
  { date: '2016-04-01', price: 454 },
  { date: '2016-05-01', price: 537 },
  { date: '2016-06-01', price: 674 },
  { date: '2016-07-01', price: 624 },
  { date: '2016-08-01', price: 573 },
  { date: '2016-09-01', price: 608 },
  { date: '2016-10-01', price: 702 },
  { date: '2016-11-01', price: 742 },
  { date: '2016-12-01', price: 963 },
  // 2017
  { date: '2017-01-01', price: 970 },
  { date: '2017-02-01', price: 1190 },
  { date: '2017-03-01', price: 1080 },
  { date: '2017-04-01', price: 1348 },
  { date: '2017-05-01', price: 2300 },
  { date: '2017-06-01', price: 2450 },
  { date: '2017-07-01', price: 2875 },
  { date: '2017-08-01', price: 4700 },
  { date: '2017-09-01', price: 4338 },
  { date: '2017-10-01', price: 6468 },
  { date: '2017-11-01', price: 10400 },
  { date: '2017-12-01', price: 14156 },
  // 2018
  { date: '2018-01-01', price: 10221 },
  { date: '2018-02-01', price: 10900 },
  { date: '2018-03-01', price: 6928 },
  { date: '2018-04-01', price: 9240 },
  { date: '2018-05-01', price: 7495 },
  { date: '2018-06-01', price: 6166 },
  { date: '2018-07-01', price: 8220 },
  { date: '2018-08-01', price: 7010 },
  { date: '2018-09-01', price: 6588 },
  { date: '2018-10-01', price: 6371 },
  { date: '2018-11-01', price: 4017 },
  { date: '2018-12-01', price: 3742 },
  // 2019
  { date: '2019-01-01', price: 3457 },
  { date: '2019-02-01', price: 3854 },
  { date: '2019-03-01', price: 4105 },
  { date: '2019-04-01', price: 5350 },
  { date: '2019-05-01', price: 8574 },
  { date: '2019-06-01', price: 10817 },
  { date: '2019-07-01', price: 9590 },
  { date: '2019-08-01', price: 9630 },
  { date: '2019-09-01', price: 8293 },
  { date: '2019-10-01', price: 9199 },
  { date: '2019-11-01', price: 7569 },
  { date: '2019-12-01', price: 7193 },
  // 2020
  { date: '2020-01-01', price: 9350 },
  { date: '2020-02-01', price: 8599 },
  { date: '2020-03-01', price: 6424 },
  { date: '2020-04-01', price: 8624 },
  { date: '2020-05-01', price: 9455 },
  { date: '2020-06-01', price: 9137 },
  { date: '2020-07-01', price: 11351 },
  { date: '2020-08-01', price: 11655 },
  { date: '2020-09-01', price: 10778 },
  { date: '2020-10-01', price: 13803 },
  { date: '2020-11-01', price: 19698 },
  { date: '2020-12-01', price: 29001 },
  // 2021
  { date: '2021-01-01', price: 33114 },
  { date: '2021-02-01', price: 45137 },
  { date: '2021-03-01', price: 58918 },
  { date: '2021-04-01', price: 57750 },
  { date: '2021-05-01', price: 37332 },
  { date: '2021-06-01', price: 35040 },
  { date: '2021-07-01', price: 41461 },
  { date: '2021-08-01', price: 47166 },
  { date: '2021-09-01', price: 43790 },
  { date: '2021-10-01', price: 61318 },
  { date: '2021-11-01', price: 56905 },
  { date: '2021-12-01', price: 46306 },
  // 2022
  { date: '2022-01-01', price: 38483 },
  { date: '2022-02-01', price: 43193 },
  { date: '2022-03-01', price: 45538 },
  { date: '2022-04-01', price: 37644 },
  { date: '2022-05-01', price: 31792 },
  { date: '2022-06-01', price: 19985 },
  { date: '2022-07-01', price: 23307 },
  { date: '2022-08-01', price: 20050 },
  { date: '2022-09-01', price: 19432 },
  { date: '2022-10-01', price: 20495 },
  { date: '2022-11-01', price: 17168 },
  { date: '2022-12-01', price: 16547 },
  // 2023
  { date: '2023-01-01', price: 23125 },
  { date: '2023-02-01', price: 23475 },
  { date: '2023-03-01', price: 28478 },
  { date: '2023-04-01', price: 29252 },
  { date: '2023-05-01', price: 27220 },
  { date: '2023-06-01', price: 30477 },
  { date: '2023-07-01', price: 29236 },
  { date: '2023-08-01', price: 26044 },
  { date: '2023-09-01', price: 26968 },
  { date: '2023-10-01', price: 34502 },
  { date: '2023-11-01', price: 37715 },
  { date: '2023-12-01', price: 42265 },
  // 2024
  { date: '2024-01-01', price: 42584 },
  { date: '2024-02-01', price: 51811 },
  { date: '2024-03-01', price: 71289 },
  { date: '2024-04-01', price: 64115 },
  { date: '2024-05-01', price: 67472 },
  { date: '2024-06-01', price: 62678 },
  { date: '2024-07-01', price: 64623 },
  { date: '2024-08-01', price: 59017 },
  { date: '2024-09-01', price: 63329 },
  { date: '2024-10-01', price: 69538 },
  { date: '2024-11-01', price: 91052 },
  { date: '2024-12-01', price: 97185 },
  // 2025-2026
  { date: '2025-01-01', price: 102350 },
  { date: '2025-02-01', price: 96200 },
  { date: '2025-03-01', price: 88500 },
  { date: '2025-04-01', price: 94800 },
  { date: '2025-05-01', price: 103500 },
  { date: '2025-06-01', price: 98700 },
  { date: '2025-07-01', price: 105200 },
  { date: '2025-08-01', price: 112400 },
  { date: '2025-09-01', price: 108900 },
  { date: '2025-10-01', price: 115600 },
  { date: '2025-11-01', price: 121300 },
  { date: '2025-12-01', price: 118500 },
  { date: '2026-01-01', price: 124800 },
]

// Calculate YoY changes for Bitcoin
mockBitcoinData.forEach((item, index) => {
  if (index >= 12) {
    const prevYearPrice = mockBitcoinData[index - 12].price
    item.yoyChange = ((item.price - prevYearPrice) / prevYearPrice) * 100
  }
})

// S&P 500 price data (monthly) - 2015 to Jan 2026
export const mockSP500Data: { date: string; price: number }[] = [
  // 2015
  { date: '2015-01-01', price: 2028 }, { date: '2015-02-01', price: 2105 }, { date: '2015-03-01', price: 2068 },
  { date: '2015-04-01', price: 2086 }, { date: '2015-05-01', price: 2107 }, { date: '2015-06-01', price: 2063 },
  { date: '2015-07-01', price: 2104 }, { date: '2015-08-01', price: 1972 }, { date: '2015-09-01', price: 1920 },
  { date: '2015-10-01', price: 2079 }, { date: '2015-11-01', price: 2080 }, { date: '2015-12-01', price: 2044 },
  // 2016
  { date: '2016-01-01', price: 1940 }, { date: '2016-02-01', price: 1932 }, { date: '2016-03-01', price: 2060 },
  { date: '2016-04-01', price: 2065 }, { date: '2016-05-01', price: 2097 }, { date: '2016-06-01', price: 2099 },
  { date: '2016-07-01', price: 2174 }, { date: '2016-08-01', price: 2171 }, { date: '2016-09-01', price: 2168 },
  { date: '2016-10-01', price: 2126 }, { date: '2016-11-01', price: 2199 }, { date: '2016-12-01', price: 2239 },
  // 2017
  { date: '2017-01-01', price: 2279 }, { date: '2017-02-01', price: 2364 }, { date: '2017-03-01', price: 2362 },
  { date: '2017-04-01', price: 2384 }, { date: '2017-05-01', price: 2412 }, { date: '2017-06-01', price: 2423 },
  { date: '2017-07-01', price: 2470 }, { date: '2017-08-01', price: 2472 }, { date: '2017-09-01', price: 2519 },
  { date: '2017-10-01', price: 2575 }, { date: '2017-11-01', price: 2648 }, { date: '2017-12-01', price: 2674 },
  // 2018
  { date: '2018-01-01', price: 2824 }, { date: '2018-02-01', price: 2714 }, { date: '2018-03-01', price: 2641 },
  { date: '2018-04-01', price: 2648 }, { date: '2018-05-01', price: 2705 }, { date: '2018-06-01', price: 2718 },
  { date: '2018-07-01', price: 2816 }, { date: '2018-08-01', price: 2901 }, { date: '2018-09-01', price: 2914 },
  { date: '2018-10-01', price: 2712 }, { date: '2018-11-01', price: 2760 }, { date: '2018-12-01', price: 2507 },
  // 2019
  { date: '2019-01-01', price: 2704 }, { date: '2019-02-01', price: 2784 }, { date: '2019-03-01', price: 2834 },
  { date: '2019-04-01', price: 2946 }, { date: '2019-05-01', price: 2752 }, { date: '2019-06-01', price: 2942 },
  { date: '2019-07-01', price: 2980 }, { date: '2019-08-01', price: 2926 }, { date: '2019-09-01', price: 2977 },
  { date: '2019-10-01', price: 3038 }, { date: '2019-11-01', price: 3141 }, { date: '2019-12-01', price: 3231 },
  // 2020
  { date: '2020-01-01', price: 3226 }, { date: '2020-02-01', price: 2954 }, { date: '2020-03-01', price: 2585 },
  { date: '2020-04-01', price: 2912 }, { date: '2020-05-01', price: 3044 }, { date: '2020-06-01', price: 3100 },
  { date: '2020-07-01', price: 3271 }, { date: '2020-08-01', price: 3500 }, { date: '2020-09-01', price: 3363 },
  { date: '2020-10-01', price: 3270 }, { date: '2020-11-01', price: 3622 }, { date: '2020-12-01', price: 3756 },
  // 2021
  { date: '2021-01-01', price: 3714 }, { date: '2021-02-01', price: 3811 }, { date: '2021-03-01', price: 3973 },
  { date: '2021-04-01', price: 4181 }, { date: '2021-05-01', price: 4204 }, { date: '2021-06-01', price: 4298 },
  { date: '2021-07-01', price: 4395 }, { date: '2021-08-01', price: 4522 }, { date: '2021-09-01', price: 4307 },
  { date: '2021-10-01', price: 4605 }, { date: '2021-11-01', price: 4567 }, { date: '2021-12-01', price: 4766 },
  // 2022
  { date: '2022-01-01', price: 4516 }, { date: '2022-02-01', price: 4374 }, { date: '2022-03-01', price: 4530 },
  { date: '2022-04-01', price: 4132 }, { date: '2022-05-01', price: 4132 }, { date: '2022-06-01', price: 3785 },
  { date: '2022-07-01', price: 4130 }, { date: '2022-08-01', price: 3955 }, { date: '2022-09-01', price: 3586 },
  { date: '2022-10-01', price: 3872 }, { date: '2022-11-01', price: 4080 }, { date: '2022-12-01', price: 3840 },
  // 2023
  { date: '2023-01-01', price: 4077 }, { date: '2023-02-01', price: 3970 }, { date: '2023-03-01', price: 4109 },
  { date: '2023-04-01', price: 4169 }, { date: '2023-05-01', price: 4180 }, { date: '2023-06-01', price: 4450 },
  { date: '2023-07-01', price: 4589 }, { date: '2023-08-01', price: 4508 }, { date: '2023-09-01', price: 4288 },
  { date: '2023-10-01', price: 4194 }, { date: '2023-11-01', price: 4568 }, { date: '2023-12-01', price: 4770 },
  // 2024
  { date: '2024-01-01', price: 4846 }, { date: '2024-02-01', price: 5096 }, { date: '2024-03-01', price: 5254 },
  { date: '2024-04-01', price: 5036 }, { date: '2024-05-01', price: 5277 }, { date: '2024-06-01', price: 5460 },
  { date: '2024-07-01', price: 5522 }, { date: '2024-08-01', price: 5648 }, { date: '2024-09-01', price: 5762 },
  { date: '2024-10-01', price: 5705 }, { date: '2024-11-01', price: 5970 }, { date: '2024-12-01', price: 5882 },
  // 2025-2026
  { date: '2025-01-01', price: 5950 }, { date: '2025-02-01', price: 5820 }, { date: '2025-03-01', price: 5680 },
  { date: '2025-04-01', price: 5890 }, { date: '2025-05-01', price: 6050 }, { date: '2025-06-01', price: 5980 },
  { date: '2025-07-01', price: 6150 }, { date: '2025-08-01', price: 6280 }, { date: '2025-09-01', price: 6180 },
  { date: '2025-10-01', price: 6350 }, { date: '2025-11-01', price: 6420 }, { date: '2025-12-01', price: 6380 },
  { date: '2026-01-01', price: 6520 },
]

export const mockM2Data: M2CountryData[] = [
  {
    country: 'US',
    name: 'United States',
    data: generateM2Data('US', 11.5e12, startDate, months),
    latestValue: 21.5e12,
    latestRoc: 4.2,
    color: '#3b82f6',
  },
  {
    country: 'CN',
    name: 'China',
    data: generateM2Data('CN', 18e12, startDate, months),
    latestValue: 48.5e12,
    latestRoc: 7.8,
    color: '#ef4444',
  },
  {
    country: 'EU',
    name: 'Eurozone',
    data: generateM2Data('EU', 10.2e12, startDate, months),
    latestValue: 16.8e12,
    latestRoc: 2.4,
    color: '#22c55e',
  },
  {
    country: 'JP',
    name: 'Japan',
    data: generateM2Data('JP', 8.2e12, startDate, months),
    latestValue: 10.2e12,
    latestRoc: 2.1,
    color: '#f97316',
  },
  {
    country: 'UK',
    name: 'United Kingdom',
    data: generateM2Data('UK', 2.4e12, startDate, months),
    latestValue: 3.8e12,
    latestRoc: 2.8,
    color: '#8b5cf6',
  },
]

// Credit impulse data quarterly from 2015
export const mockCreditImpulseData: CreditImpulseData[] = Array.from({ length: 45 }, (_, i) => {
  const date = new Date('2015-01-01')
  date.setMonth(date.getMonth() + i * 3)

  // Create realistic credit impulse cycles
  const cyclePhase = i * 0.35
  const baseImpulse = Math.sin(cyclePhase) * 0.035

  return {
    date: date.toISOString().split('T')[0],
    country: 'CN' as const,
    newCredit: 2200 + i * 80 + Math.random() * 500,
    gdp: 11000 + i * 600,
    impulse: baseImpulse + (Math.random() - 0.5) * 0.015,
  }
})

export const mockQuarterlyMaturities: QuarterlyMaturity[] = [
  { quarter: 'Q1 2026', sovereign: 280, igCorp: 220, hyCorp: 85, total: 585 },
  { quarter: 'Q2 2026', sovereign: 320, igCorp: 250, hyCorp: 95, total: 665 },
  { quarter: 'Q3 2026', sovereign: 290, igCorp: 230, hyCorp: 80, total: 600 },
  { quarter: 'Q4 2026', sovereign: 350, igCorp: 280, hyCorp: 110, total: 740 },
  { quarter: 'Q1 2027', sovereign: 380, igCorp: 300, hyCorp: 120, total: 800 },
  { quarter: 'Q2 2027', sovereign: 340, igCorp: 260, hyCorp: 100, total: 700 },
  { quarter: 'Q3 2027', sovereign: 310, igCorp: 240, hyCorp: 90, total: 640 },
  { quarter: 'Q4 2027', sovereign: 390, igCorp: 310, hyCorp: 125, total: 825 },
  { quarter: 'Q1 2028', sovereign: 420, igCorp: 340, hyCorp: 140, total: 900 },
  { quarter: 'Q2 2028', sovereign: 380, igCorp: 290, hyCorp: 115, total: 785 },
]

export const mockDebtMaturities: DebtMaturity[] = [
  { id: '1', issuer: 'US Treasury', amount: 95, maturityDate: '2026-03-15', coupon: 4.5, rating: 'AAA', geography: 'US', sector: 'Sovereign' },
  { id: '2', issuer: 'Apple Inc', amount: 14, maturityDate: '2026-05-01', coupon: 4.2, rating: 'AA', geography: 'US', sector: 'IG_Corp' },
  { id: '3', issuer: 'Microsoft Corp', amount: 10, maturityDate: '2026-06-15', coupon: 3.8, rating: 'AAA', geography: 'US', sector: 'IG_Corp' },
  { id: '4', issuer: 'Germany Bund', amount: 55, maturityDate: '2026-07-01', coupon: 2.5, rating: 'AAA', geography: 'EU', sector: 'Sovereign' },
  { id: '5', issuer: 'China Govt', amount: 140, maturityDate: '2026-08-15', coupon: 3.2, rating: 'A', geography: 'China', sector: 'Sovereign' },
  { id: '6', issuer: 'UK Gilt', amount: 42, maturityDate: '2026-09-01', coupon: 4.0, rating: 'AA', geography: 'EU', sector: 'Sovereign' },
  { id: '7', issuer: 'Amazon.com', amount: 12, maturityDate: '2026-10-15', coupon: 4.5, rating: 'AA', geography: 'US', sector: 'IG_Corp' },
  { id: '8', issuer: 'Toyota Motor', amount: 8, maturityDate: '2026-11-01', coupon: 3.1, rating: 'A', geography: 'EM', sector: 'IG_Corp' },
  { id: '9', issuer: 'Tesla Inc', amount: 5, maturityDate: '2026-12-15', coupon: 6.5, rating: 'BB+', geography: 'US', sector: 'HY_Corp' },
  { id: '10', issuer: 'France OAT', amount: 65, maturityDate: '2027-01-01', coupon: 2.8, rating: 'AA', geography: 'EU', sector: 'Sovereign' },
  { id: '11', issuer: 'Japan JGB', amount: 110, maturityDate: '2027-02-15', coupon: 1.2, rating: 'A', geography: 'EM', sector: 'Sovereign' },
  { id: '12', issuer: 'Netflix Inc', amount: 4, maturityDate: '2027-03-01', coupon: 6.2, rating: 'BB', geography: 'US', sector: 'HY_Corp' },
  { id: '13', issuer: 'Goldman Sachs', amount: 18, maturityDate: '2027-04-15', coupon: 4.8, rating: 'A', geography: 'US', sector: 'IG_Corp' },
  { id: '14', issuer: 'Italy BTP', amount: 75, maturityDate: '2027-05-01', coupon: 3.5, rating: 'BBB', geography: 'EU', sector: 'Sovereign' },
  { id: '15', issuer: 'Ford Motor', amount: 6, maturityDate: '2027-06-15', coupon: 7.2, rating: 'BB+', geography: 'US', sector: 'HY_Corp' },
]

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'M2_INFLECTION',
    severity: 'critical',
    title: 'Global M2 RoC Crossed +5% Threshold',
    message: 'Global M2 6-month rate of change has crossed above +5%, signaling potential risk-on conditions. BTC has historically rallied 3-6 months after this signal.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relatedChart: 'liquidity',
    isRead: false,
  },
  {
    id: '2',
    type: 'CREDIT_REVERSAL',
    severity: 'warning',
    title: 'China Credit Impulse Turning Positive',
    message: 'China credit impulse is showing signs of reversal from negative to positive territory. This typically leads global risk assets by 6-9 months.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    relatedChart: 'credit',
    isRead: false,
  },
  {
    id: '3',
    type: 'MATURITY_SPIKE',
    severity: 'warning',
    title: 'Q4 2026 Maturity Wall Alert',
    message: 'Quarterly maturities exceed $740B in Q4 2026, potential refinancing stress ahead.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    relatedChart: 'maturities',
    isRead: true,
  },
  {
    id: '4',
    type: 'M2_INFLECTION',
    severity: 'info',
    title: 'BTC-M2 Correlation Strengthening',
    message: 'Rolling 90-day correlation between BTC and Global M2 RoC has increased to 0.82, above historical average.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    relatedChart: 'liquidity',
    isRead: true,
  },
]

export const mockCorrelationMatrix: CorrelationMatrix = {
  assets: ['Global M2 RoC', 'Credit Impulse', 'BTC', 'S&P 500', 'Gold', 'DXY'],
  matrix: [
    [1.0, 0.45, 0.82, 0.62, 0.54, -0.48],
    [0.45, 1.0, 0.58, 0.67, 0.38, -0.35],
    [0.82, 0.58, 1.0, 0.72, 0.45, -0.65],
    [0.62, 0.67, 0.72, 1.0, 0.35, -0.45],
    [0.54, 0.38, 0.45, 0.35, 1.0, -0.55],
    [-0.48, -0.35, -0.65, -0.45, -0.55, 1.0],
  ],
  period: '90-day rolling',
}

export const mockDashboardStats: DashboardStats = {
  globalM2Roc: 4.8,
  creditImpulse: 2.1,
  next12MonthMaturities: 2.59e12,
  activeAlerts: 2,
}
