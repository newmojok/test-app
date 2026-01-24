import type { M2DataPoint, CreditImpulseData, CorrelationResult } from '../types/index.js'

/**
 * Calculates the rate of change over a given number of periods
 */
export function calculateRoC(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Calculates the z-score given a value, mean, and standard deviation
 */
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

/**
 * Calculates the standard deviation of an array of numbers
 */
export function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(avgSquaredDiff)
}

/**
 * Calculates the mean of an array of numbers
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Processes raw M2 data to calculate RoC, YoY change, and z-score
 */
export function processM2Data(
  rawData: { date: string; value: number }[],
  country: string
): M2DataPoint[] {
  const processed: M2DataPoint[] = []
  const values = rawData.map((d) => d.value)
  const rocs: number[] = []

  // First pass to calculate RoCs for z-score calculation
  for (let i = 6; i < rawData.length; i++) {
    const roc = calculateRoC(rawData[i].value, rawData[i - 6].value)
    rocs.push(roc)
  }

  const rocMean = calculateMean(rocs)
  const rocStdDev = calculateStdDev(rocs)

  // Second pass to build the full data points
  for (let i = 0; i < rawData.length; i++) {
    const point = rawData[i]

    // 6-month RoC
    let roc6m: number | null = null
    if (i >= 6) {
      roc6m = calculateRoC(point.value, rawData[i - 6].value)
    }

    // Year-over-year change
    let yoyChange: number | null = null
    if (i >= 12) {
      yoyChange = calculateRoC(point.value, rawData[i - 12].value)
    }

    // Z-score (only if we have enough data)
    let zscore: number | null = null
    if (roc6m !== null && rocStdDev > 0) {
      zscore = calculateZScore(roc6m, rocMean, rocStdDev)
    }

    processed.push({
      country: country as M2DataPoint['country'],
      date: new Date(point.date),
      value: point.value,
      roc6m,
      yoyChange,
      zscore,
    })
  }

  return processed
}

/**
 * Calculates credit impulse from credit and GDP data
 */
export function calculateCreditImpulse(
  creditData: { date: string; value: number }[],
  gdpData: { date: string; value: number }[]
): CreditImpulseData[] {
  const results: CreditImpulseData[] = []

  // Match credit data to nearest GDP quarter
  for (let i = 1; i < creditData.length; i++) {
    const current = creditData[i]
    const previous = creditData[i - 1]

    // Find corresponding GDP
    const gdp = gdpData.find((g) => {
      const creditDate = new Date(current.date)
      const gdpDate = new Date(g.date)
      // Match to same quarter
      return (
        creditDate.getFullYear() === gdpDate.getFullYear() &&
        Math.floor(creditDate.getMonth() / 3) === Math.floor(gdpDate.getMonth() / 3)
      )
    })

    if (gdp) {
      const newCredit = current.value - previous.value
      const impulse = newCredit / gdp.value

      results.push({
        country: 'US',
        quarter: new Date(current.date),
        newCredit: current.value,
        gdp: gdp.value,
        impulse,
      })
    }
  }

  return results
}

/**
 * Calculates Pearson correlation coefficient between two arrays
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0

  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return 0
  return numerator / denominator
}

/**
 * Calculates correlation matrix for multiple assets
 */
export function calculateCorrelationMatrix(
  data: Record<string, number[]>,
  lag: number = 0
): { assets: string[]; matrix: number[][] } {
  const assets = Object.keys(data)
  const matrix: number[][] = []

  for (let i = 0; i < assets.length; i++) {
    const row: number[] = []
    for (let j = 0; j < assets.length; j++) {
      let x = data[assets[i]]
      let y = data[assets[j]]

      // Apply lag if specified (shift y forward)
      if (lag > 0) {
        y = y.slice(lag)
        x = x.slice(0, -lag)
      }

      // Ensure same length
      const minLen = Math.min(x.length, y.length)
      x = x.slice(-minLen)
      y = y.slice(-minLen)

      row.push(calculatePearsonCorrelation(x, y))
    }
    matrix.push(row)
  }

  return { assets, matrix }
}

/**
 * Calculates weighted global M2 aggregate
 */
export function calculateGlobalM2Aggregate(
  m2ByCountry: Record<string, { date: string; value: number; roc6m: number | null }[]>
): { date: string; totalM2: number; weightedRoc: number }[] {
  // GDP-based weights (approximate)
  const weights: Record<string, number> = {
    US: 0.31,
    CN: 0.28,
    EU: 0.22,
    JP: 0.12,
    UK: 0.07,
  }

  // Find common dates across all countries
  const dateMap = new Map<string, Record<string, { value: number; roc6m: number | null }>>()

  for (const [country, data] of Object.entries(m2ByCountry)) {
    for (const point of data) {
      const existing = dateMap.get(point.date) || {}
      existing[country] = { value: point.value, roc6m: point.roc6m }
      dateMap.set(point.date, existing)
    }
  }

  const results: { date: string; totalM2: number; weightedRoc: number }[] = []

  for (const [date, countries] of dateMap) {
    let totalM2 = 0
    let weightedRoc = 0
    let totalWeight = 0

    for (const [country, data] of Object.entries(countries)) {
      const weight = weights[country] || 0
      totalM2 += data.value
      if (data.roc6m !== null) {
        weightedRoc += data.roc6m * weight
        totalWeight += weight
      }
    }

    if (totalWeight > 0) {
      weightedRoc /= totalWeight
    }

    results.push({ date, totalM2, weightedRoc })
  }

  return results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
