/**
 * Live Data API Service
 * Fetches real-time financial data from various free APIs
 */

// CORS proxy for APIs that don't support CORS
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

export interface LiveIndicatorData {
  id: string
  value: number
  timestamp: string
  source: string
}

export interface LivePriceData {
  symbol: string
  price: number
  change24h: number
  timestamp: string
}

// ============================================
// CoinGecko API (Free, CORS-friendly)
// ============================================

export async function fetchCryptoPrices(): Promise<{
  bitcoin: LivePriceData
  ethereum: LivePriceData
}> {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
  )

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`)
  }

  const data = await response.json()
  const now = new Date().toISOString()

  return {
    bitcoin: {
      symbol: 'BTC',
      price: data.bitcoin.usd,
      change24h: data.bitcoin.usd_24h_change || 0,
      timestamp: now,
    },
    ethereum: {
      symbol: 'ETH',
      price: data.ethereum.usd,
      change24h: data.ethereum.usd_24h_change || 0,
      timestamp: now,
    },
  }
}

// ============================================
// FRED API (Federal Reserve Economic Data)
// Free API key available at https://fred.stlouisfed.org/docs/api/api_key.html
// ============================================

const FRED_API_KEY = 'DEMO_KEY' // Replace with real key for production

interface FredObservation {
  date: string
  value: string
}

interface FredResponse {
  observations: FredObservation[]
}

async function fetchFredSeries(seriesId: string): Promise<number | null> {
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`

    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`FRED API error for ${seriesId}: ${response.status}`)
      return null
    }

    const data: FredResponse = await response.json()
    if (data.observations && data.observations.length > 0) {
      const value = parseFloat(data.observations[0].value)
      return isNaN(value) ? null : value
    }
    return null
  } catch (error) {
    console.warn(`Failed to fetch FRED series ${seriesId}:`, error)
    return null
  }
}

export async function fetchFedBalanceSheet(): Promise<LiveIndicatorData | null> {
  // WALCL: Total Assets (Less Eliminations from Consolidation)
  const value = await fetchFredSeries('WALCL')
  if (value === null) return null

  return {
    id: 'walcl',
    value: value * 1e6, // FRED reports in millions
    timestamp: new Date().toISOString(),
    source: 'FRED',
  }
}

export async function fetchTGA(): Promise<LiveIndicatorData | null> {
  // WTREGEN: Treasury General Account
  const value = await fetchFredSeries('WTREGEN')
  if (value === null) return null

  return {
    id: 'tga',
    value: value * 1e6, // FRED reports in millions
    timestamp: new Date().toISOString(),
    source: 'FRED',
  }
}

export async function fetchRRP(): Promise<LiveIndicatorData | null> {
  // RRPONTSYD: Overnight Reverse Repurchase Agreements
  const value = await fetchFredSeries('RRPONTSYD')
  if (value === null) return null

  return {
    id: 'rrp',
    value: value * 1e9, // FRED reports in billions
    timestamp: new Date().toISOString(),
    source: 'FRED',
  }
}

// ============================================
// Exchange Rate / DXY Data
// Using exchangerate.host (free, CORS-friendly)
// ============================================

export async function fetchDXYApprox(): Promise<LiveIndicatorData | null> {
  try {
    // DXY is weighted: EUR 57.6%, JPY 13.6%, GBP 11.9%, CAD 9.1%, SEK 4.2%, CHF 3.6%
    // We'll fetch EUR/USD as the main component (57.6% weight)
    const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=EUR,JPY,GBP,CAD,SEK,CHF')

    if (!response.ok) {
      // Try alternative API
      return await fetchDXYFromAlternative()
    }

    const data = await response.json()
    if (!data.rates) {
      return await fetchDXYFromAlternative()
    }

    // Calculate approximate DXY using the basket weights
    // DXY = 50.14348112 × EUR/USD^(-0.576) × USD/JPY^(0.136) × GBP/USD^(-0.119) × USD/CAD^(0.091) × USD/SEK^(0.042) × USD/CHF^(0.036)
    const eurUsd = 1 / data.rates.EUR
    const usdJpy = data.rates.JPY
    const gbpUsd = 1 / data.rates.GBP
    const usdCad = data.rates.CAD
    const usdSek = data.rates.SEK
    const usdChf = data.rates.CHF

    const dxy =
      50.14348112 *
      Math.pow(eurUsd, -0.576) *
      Math.pow(usdJpy, 0.136) *
      Math.pow(gbpUsd, -0.119) *
      Math.pow(usdCad, 0.091) *
      Math.pow(usdSek, 0.042) *
      Math.pow(usdChf, 0.036)

    return {
      id: 'dxy',
      value: Math.round(dxy * 100) / 100,
      timestamp: new Date().toISOString(),
      source: 'Calculated from exchange rates',
    }
  } catch (error) {
    console.warn('Failed to fetch DXY:', error)
    return await fetchDXYFromAlternative()
  }
}

async function fetchDXYFromAlternative(): Promise<LiveIndicatorData | null> {
  try {
    // Alternative: Use frankfurter.app (free, no key needed)
    const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,JPY,GBP,CAD,SEK,CHF')

    if (!response.ok) return null

    const data = await response.json()
    if (!data.rates) return null

    const eurUsd = 1 / data.rates.EUR
    const usdJpy = data.rates.JPY
    const gbpUsd = 1 / data.rates.GBP
    const usdCad = data.rates.CAD
    const usdSek = data.rates.SEK
    const usdChf = data.rates.CHF

    const dxy =
      50.14348112 *
      Math.pow(eurUsd, -0.576) *
      Math.pow(usdJpy, 0.136) *
      Math.pow(gbpUsd, -0.119) *
      Math.pow(usdCad, 0.091) *
      Math.pow(usdSek, 0.042) *
      Math.pow(usdChf, 0.036)

    return {
      id: 'dxy',
      value: Math.round(dxy * 100) / 100,
      timestamp: new Date().toISOString(),
      source: 'Calculated from Frankfurter API',
    }
  } catch (error) {
    console.warn('Alternative DXY fetch failed:', error)
    return null
  }
}

// ============================================
// Fear & Greed / VIX Data
// ============================================

export async function fetchVIX(): Promise<LiveIndicatorData | null> {
  try {
    // Use Yahoo Finance via CORS proxy for VIX
    const url = `${CORS_PROXY}${encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=1d')}`

    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice

    if (!price) return null

    return {
      id: 'vix',
      value: Math.round(price * 100) / 100,
      timestamp: new Date().toISOString(),
      source: 'Yahoo Finance',
    }
  } catch (error) {
    console.warn('Failed to fetch VIX:', error)
    return null
  }
}

// ============================================
// S&P 500 Data
// ============================================

export async function fetchSP500(): Promise<LivePriceData | null> {
  try {
    const url = `${CORS_PROXY}${encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?interval=1d&range=5d')}`

    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    const result = data?.chart?.result?.[0]
    const price = result?.meta?.regularMarketPrice
    const prevClose = result?.meta?.chartPreviousClose

    if (!price) return null

    const change24h = prevClose ? ((price - prevClose) / prevClose) * 100 : 0

    return {
      symbol: 'SPX',
      price: Math.round(price * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.warn('Failed to fetch S&P 500:', error)
    return null
  }
}

// ============================================
// Gold Price
// ============================================

export async function fetchGoldPrice(): Promise<LivePriceData | null> {
  try {
    const url = `${CORS_PROXY}${encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=5d')}`

    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    const result = data?.chart?.result?.[0]
    const price = result?.meta?.regularMarketPrice
    const prevClose = result?.meta?.chartPreviousClose

    if (!price) return null

    const change24h = prevClose ? ((price - prevClose) / prevClose) * 100 : 0

    return {
      symbol: 'GOLD',
      price: Math.round(price * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.warn('Failed to fetch Gold price:', error)
    return null
  }
}

// ============================================
// Aggregate fetch function
// ============================================

export interface AllLiveData {
  crypto: {
    bitcoin: LivePriceData | null
    ethereum: LivePriceData | null
  }
  fed: {
    walcl: LiveIndicatorData | null
    tga: LiveIndicatorData | null
    rrp: LiveIndicatorData | null
  }
  market: {
    dxy: LiveIndicatorData | null
    vix: LiveIndicatorData | null
    sp500: LivePriceData | null
    gold: LivePriceData | null
  }
  fetchedAt: string
  errors: string[]
}

export async function fetchAllLiveData(): Promise<AllLiveData> {
  const errors: string[] = []

  // Fetch all data in parallel
  const [cryptoResult, walclResult, tgaResult, rrpResult, dxyResult, vixResult, sp500Result, goldResult] =
    await Promise.allSettled([
      fetchCryptoPrices(),
      fetchFedBalanceSheet(),
      fetchTGA(),
      fetchRRP(),
      fetchDXYApprox(),
      fetchVIX(),
      fetchSP500(),
      fetchGoldPrice(),
    ])

  // Process crypto
  let bitcoin: LivePriceData | null = null
  let ethereum: LivePriceData | null = null
  if (cryptoResult.status === 'fulfilled') {
    bitcoin = cryptoResult.value.bitcoin
    ethereum = cryptoResult.value.ethereum
  } else {
    errors.push('Failed to fetch crypto prices')
  }

  // Process Fed data
  const walcl = walclResult.status === 'fulfilled' ? walclResult.value : null
  const tga = tgaResult.status === 'fulfilled' ? tgaResult.value : null
  const rrp = rrpResult.status === 'fulfilled' ? rrpResult.value : null

  if (!walcl) errors.push('Failed to fetch Fed balance sheet')
  if (!tga) errors.push('Failed to fetch TGA')
  if (!rrp) errors.push('Failed to fetch RRP')

  // Process market data
  const dxy = dxyResult.status === 'fulfilled' ? dxyResult.value : null
  const vix = vixResult.status === 'fulfilled' ? vixResult.value : null
  const sp500 = sp500Result.status === 'fulfilled' ? sp500Result.value : null
  const gold = goldResult.status === 'fulfilled' ? goldResult.value : null

  if (!dxy) errors.push('Failed to fetch DXY')

  return {
    crypto: { bitcoin, ethereum },
    fed: { walcl, tga, rrp },
    market: { dxy, vix, sp500, gold },
    fetchedAt: new Date().toISOString(),
    errors,
  }
}
