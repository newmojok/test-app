import axios from 'axios'
import { config } from '../config/index.js'
import type { FredSeriesResponse, CountryCode } from '../types/index.js'

const fredClient = axios.create({
  baseURL: config.fred.baseUrl,
  timeout: 30000,
})

export interface FredDataPoint {
  date: string
  value: number
}

/**
 * Fetches time series data from the FRED API
 */
export async function fetchFredSeries(
  seriesId: string,
  startDate?: string,
  endDate?: string
): Promise<FredDataPoint[]> {
  if (!config.fred.apiKey) {
    console.warn('FRED API key not configured, returning empty data')
    return []
  }

  const params: Record<string, string> = {
    api_key: config.fred.apiKey,
    series_id: seriesId,
    file_type: 'json',
    sort_order: 'asc',
  }

  if (startDate) params.observation_start = startDate
  if (endDate) params.observation_end = endDate

  try {
    const response = await fredClient.get<FredSeriesResponse>('/series/observations', { params })

    return response.data.observations
      .filter((obs) => obs.value !== '.')
      .map((obs) => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }))
  } catch (error) {
    console.error(`Failed to fetch FRED series ${seriesId}:`, error)
    throw error
  }
}

/**
 * Fetches M2 data for a specific country
 */
export async function fetchM2ForCountry(
  country: CountryCode,
  startDate?: string
): Promise<FredDataPoint[]> {
  const seriesId = config.fred.series[country]

  if (!seriesId) {
    console.warn(`No FRED series configured for country: ${country}`)
    return []
  }

  const data = await fetchFredSeries(seriesId, startDate)

  // Apply currency conversion for non-USD countries
  // China M2 is reported in 100 million CNY, Japan in 100 million JPY, etc.
  const conversionFactors: Record<string, number> = {
    CN: 1e8 * 0.14, // 100M CNY to USD (approximate)
    JP: 1e8 * 0.0067, // 100M JPY to USD (approximate)
    UK: 1, // Already in millions GBP, need conversion
    EU: 1e6, // Millions EUR to USD (approximate)
    US: 1e9, // Billions to base units
  }

  const factor = conversionFactors[country] || 1

  return data.map((point) => ({
    date: point.date,
    value: point.value * factor,
  }))
}

/**
 * Fetches M2 data for all configured countries
 */
export async function fetchAllM2Data(startDate?: string): Promise<
  Record<CountryCode, FredDataPoint[]>
> {
  const countries = Object.keys(config.fred.series) as CountryCode[]

  const results = await Promise.allSettled(
    countries.map(async (country) => ({
      country,
      data: await fetchM2ForCountry(country, startDate),
    }))
  )

  const data: Record<string, FredDataPoint[]> = {}

  for (const result of results) {
    if (result.status === 'fulfilled') {
      data[result.value.country] = result.value.data
    } else {
      console.error('Failed to fetch M2 data:', result.reason)
    }
  }

  return data as Record<CountryCode, FredDataPoint[]>
}

/**
 * Fetches US commercial bank credit (for credit impulse calculation)
 */
export async function fetchUSBankCredit(startDate?: string): Promise<FredDataPoint[]> {
  return fetchFredSeries('TOTBKCR', startDate)
}

/**
 * Fetches US GDP (quarterly)
 */
export async function fetchUSGDP(startDate?: string): Promise<FredDataPoint[]> {
  return fetchFredSeries('GDP', startDate)
}

/**
 * Fetches NBER recession dates
 */
export async function fetchRecessionDates(): Promise<FredDataPoint[]> {
  return fetchFredSeries('USREC')
}

/**
 * Test API connection
 */
export async function testFredConnection(): Promise<boolean> {
  try {
    // Fetch a small amount of recent data to test
    const data = await fetchFredSeries('M2SL', '2024-01-01')
    return data.length > 0
  } catch {
    return false
  }
}
