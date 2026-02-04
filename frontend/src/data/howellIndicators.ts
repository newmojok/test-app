// Howell Liquidity Framework Indicators
// Based on Michael Howell's research from Capital Wars

export interface HowellIndicator {
  id: string
  name: string
  shortName: string
  category: 'fed' | 'treasury' | 'market' | 'cycle' | 'global'
  currentValue: number
  previousValue: number
  unit: string
  signal: 'bullish' | 'bearish' | 'neutral'
  signalStrength: number // 0-100
  lastUpdated: string
  updateFrequency: string
  source: {
    name: string
    url: string
    seriesId?: string
  }
  description: string
  howToUse: string
  interpretation: string
}

export interface NetLiquidityData {
  date: string // This is the BTC date (anchor)
  fedBalance: number // Shifted: Fed balance from 3 months ago
  tga: number // Shifted: TGA from 3 months ago
  rrp: number // Shifted: RRP from 3 months ago
  netLiquidity: number // Shifted: Net liquidity from 3 months ago (what predicted this BTC date)
  btcPrice?: number // Actual BTC price for this date (no shift)
  // For backwards compatibility with any existing code
  btcPriceLagged?: number
}

export interface DecisionMatrixRow {
  indicator: string
  currentSignal: 'Bullish' | 'Bearish' | 'Neutral'
  weight: number
  contribution: number
  notes: string
}

// Mock current values - In production, these would come from APIs
export const howellIndicators: HowellIndicator[] = [
  {
    id: 'walcl',
    name: 'Federal Reserve Balance Sheet (WALCL)',
    shortName: 'Fed Balance Sheet',
    category: 'fed',
    currentValue: 6.81e12, // $6.81 trillion
    previousValue: 6.85e12,
    unit: 'USD',
    signal: 'bearish',
    signalStrength: 65,
    lastUpdated: '2026-01-29',
    updateFrequency: 'Weekly (Wednesday)',
    source: {
      name: 'FRED - Federal Reserve Economic Data',
      url: 'https://fred.stlouisfed.org/series/WALCL',
      seriesId: 'WALCL',
    },
    description:
      'Total assets held by the Federal Reserve. This is the base layer of US dollar liquidity. When the Fed expands its balance sheet (QE), it injects liquidity. When it contracts (QT), it drains liquidity.',
    howToUse: `1. Track weekly changes - rising = liquidity injection, falling = liquidity drain
2. Compare to the $9T peak (April 2022) and pre-COVID levels (~$4T)
3. Watch for QT pace changes - current runoff is ~$95B/month
4. Fed balance sheet changes lead risk assets by ~13 weeks
5. Key levels: Above $7T = supportive, Below $6.5T = restrictive`,
    interpretation:
      'Currently at $6.81T, down from $9T peak. QT continues but pace has slowed. This represents ongoing liquidity drain, though the rate of decline is decelerating. Watch for any pause or pivot signals from Fed communications.',
  },
  {
    id: 'tga',
    name: 'Treasury General Account (TGA)',
    shortName: 'TGA Balance',
    category: 'treasury',
    currentValue: 722e9, // $722 billion
    previousValue: 680e9,
    unit: 'USD',
    signal: 'bearish',
    signalStrength: 55,
    lastUpdated: '2026-01-29',
    updateFrequency: 'Daily',
    source: {
      name: 'Treasury Fiscal Data',
      url: 'https://fiscaldata.treasury.gov/datasets/daily-treasury-statement/operating-cash-balance',
      seriesId: 'Operating Cash Balance',
    },
    description:
      "The Treasury's checking account at the Fed. When TGA rises, Treasury is hoarding cash (draining liquidity from markets). When TGA falls, Treasury is spending (injecting liquidity).",
    howToUse: `1. TGA rising = liquidity drain (bearish for risk assets)
2. TGA falling = liquidity injection (bullish for risk assets)
3. Watch around debt ceiling events - TGA drawdowns can inject massive liquidity
4. Target range is typically $500B-$800B
5. Major TGA swings ($100B+) have significant market impact
6. Combine with Fed balance sheet for full liquidity picture`,
    interpretation:
      'TGA at $722B is within normal operating range. Treasury rebuilding cash reserves after recent debt ceiling resolution. This represents mild liquidity drain. Watch for spending acceleration which would reverse the drain.',
  },
  {
    id: 'rrp',
    name: 'Reverse Repo Facility (RRP)',
    shortName: 'Reverse Repo',
    category: 'fed',
    currentValue: 98e9, // $98 billion
    previousValue: 125e9,
    unit: 'USD',
    signal: 'neutral',
    signalStrength: 45,
    lastUpdated: '2026-01-29',
    updateFrequency: 'Daily',
    source: {
      name: 'NY Fed - Reverse Repo Operations',
      url: 'https://www.newyorkfed.org/markets/desk-operations/reverse-repo',
      seriesId: 'ON RRP',
    },
    description:
      'Money parked overnight at the Fed by money market funds. High RRP = excess liquidity sitting idle. Falling RRP = liquidity returning to markets (often into T-bills).',
    howToUse: `1. RRP declining = liquidity moving into markets (mildly bullish)
2. RRP near zero = liquidity cushion exhausted (watch for stress)
3. High RRP (>$1T) indicates abundant idle liquidity
4. Track the pace of decline - rapid drops can signal funding stress
5. RRP funds flowing into T-bills supports Treasury issuance
6. Near-zero RRP removes a buffer against liquidity shocks`,
    interpretation:
      'RRP has declined dramatically from $2.5T peak to just $98B. The liquidity cushion is nearly exhausted. This is neutral to slightly bearish - the buffer that supported markets is gone, but the transition is complete.',
  },
  {
    id: 'dxy',
    name: 'US Dollar Index (DXY)',
    shortName: 'Dollar Index',
    category: 'market',
    currentValue: 99.2,
    previousValue: 100.8,
    unit: 'Index',
    signal: 'neutral',
    signalStrength: 50,
    lastUpdated: '2026-01-29',
    updateFrequency: 'Real-time',
    source: {
      name: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/quote/DX-Y.NYB',
      seriesId: 'DX-Y.NYB',
    },
    description:
      'Measures USD strength against a basket of currencies (EUR, JPY, GBP, CAD, SEK, CHF). Strong dollar = global liquidity tightening. Weak dollar = global liquidity easing.',
    howToUse: `1. DXY > 105 = headwind for risk assets and global liquidity
2. DXY < 100 = tailwind for risk assets
3. Dollar strength restricts global liquidity (dollar-denominated debt burden rises)
4. Track 13-week rate of change for momentum
5. Dollar weakness often coincides with crypto rallies
6. Watch for divergences with Fed policy expectations`,
    interpretation:
      'DXY at 99.2 is near the 100 threshold, a neutral zone for global liquidity. Dollar has weakened from recent highs, easing global financial conditions. Watch for sustained break below 98 for bullish risk asset signal.',
  },
  {
    id: 'move',
    name: 'MOVE Index (Bond Volatility)',
    shortName: 'MOVE Index',
    category: 'market',
    currentValue: 95,
    previousValue: 102,
    unit: 'Index',
    signal: 'neutral',
    signalStrength: 50,
    lastUpdated: '2026-01-29',
    updateFrequency: 'Real-time',
    source: {
      name: 'Yahoo Finance',
      url: 'https://finance.yahoo.com/quote/%5EMOVE',
      seriesId: '^MOVE',
    },
    description:
      "The VIX for bonds. Measures Treasury market volatility. High MOVE = collateral stress, reduced repo capacity, tighter liquidity. Howell emphasizes this as a key indicator of 'plumbing' stress.",
    howToUse: `1. MOVE > 120 = elevated stress, collateral markets under pressure
2. MOVE > 150 = crisis levels (2023 banking crisis hit 180)
3. MOVE < 100 = calm conditions, favorable for leverage
4. High MOVE reduces dealer balance sheet capacity
5. Track alongside bank reserves for full picture
6. Spikes often precede Fed intervention`,
    interpretation:
      'MOVE at 95 indicates relatively calm Treasury market conditions. This supports dealer intermediation and repo market functioning. No immediate collateral stress signals. Neutral environment for liquidity.',
  },
  {
    id: 'cycle',
    name: '65-Month Liquidity Cycle Position',
    shortName: 'Cycle Position',
    category: 'cycle',
    currentValue: 48, // Month 48 of 65
    previousValue: 47,
    unit: 'Month',
    signal: 'bullish',
    signalStrength: 70,
    lastUpdated: '2026-01-01',
    updateFrequency: 'Monthly',
    source: {
      name: 'Capital Wars / CrossBorder Capital',
      url: 'https://www.crossbordercapital.com',
    },
    description:
      "Howell's research identifies a ~65-month (5.4 year) global liquidity cycle. The cycle has four stages: Recovery, Expansion, Slowdown, and Contraction. Current position in cycle provides structural context.",
    howToUse: `1. Months 1-16: Recovery - Early cycle, liquidity troughing, accumulate
2. Months 17-32: Expansion - Mid cycle, liquidity rising, stay invested
3. Months 33-48: Slowdown - Late cycle, liquidity peaking, reduce risk
4. Months 49-65: Contraction - End cycle, liquidity falling, defensive
5. Current cycle began ~Q1 2022 after COVID liquidity peak
6. Use cycle position to frame shorter-term signals`,
    interpretation:
      'At month 48, we are in late Slowdown phase transitioning toward Contraction. Historically, this suggests liquidity conditions will deteriorate over the next 12-18 months. However, the cycle provides structural backdrop - tactical signals from Fed/Treasury can override.',
  },
  {
    id: 'pboc',
    name: 'PBoC Liquidity (China)',
    shortName: 'China Liquidity',
    category: 'global',
    currentValue: 12.5, // YoY growth %
    previousValue: 11.8,
    unit: '%',
    signal: 'bullish',
    signalStrength: 75,
    lastUpdated: '2026-01-15',
    updateFrequency: 'Monthly',
    source: {
      name: 'CrossBorder Capital / PBoC',
      url: 'https://www.crossbordercapital.com',
    },
    description:
      "China's central bank liquidity injections. PBoC policy often leads global risk appetite. China liquidity expansion typically precedes commodity and EM rallies by 3-6 months.",
    howToUse: `1. PBoC easing (rising liquidity) = bullish for global risk
2. China liquidity leads global cycle by 3-6 months
3. Watch Total Social Financing (TSF) and M2 growth
4. PBoC cuts to RRR or MLF rates signal easing intent
5. Yuan weakness can amplify global liquidity (via capital outflows)
6. China stimulus often arrives Q4-Q1 (before Lunar New Year)`,
    interpretation:
      'China liquidity growth at 12.5% YoY indicates PBoC is in easing mode. This is bullish for global risk assets with a 3-6 month lead. China stimulus typically supports commodity and crypto markets.',
  },
  {
    id: 'ecb',
    name: 'ECB Balance Sheet',
    shortName: 'ECB Balance',
    category: 'global',
    currentValue: 6.45e12, // EUR
    previousValue: 6.52e12,
    unit: 'EUR',
    signal: 'bearish',
    signalStrength: 55,
    lastUpdated: '2026-01-19',
    updateFrequency: 'Weekly',
    source: {
      name: 'ECB Statistical Data Warehouse',
      url: 'https://sdw.ecb.europa.eu/',
    },
    description:
      "European Central Bank's balance sheet. ECB policy affects global euro liquidity. QT in Europe tightens global conditions, especially for European banks and dollar funding.",
    howToUse: `1. ECB balance sheet shrinking = Euro area liquidity tightening
2. Watch TLTRO repayments - major liquidity events
3. ECB policy often lags Fed by 3-6 months
4. Euro weakness can offset some tightening effect
5. European bank stress amplified by ECB QT
6. Track alongside Italian BTPs for stress signals`,
    interpretation:
      'ECB continues gradual QT with balance sheet at EUR 6.45T. European liquidity conditions tightening but at measured pace. Mildly bearish for global liquidity but secondary to Fed/PBoC.',
  },
]

// Calculate Net Liquidity: Fed Balance Sheet - TGA - RRP
export function calculateNetLiquidity(
  fedBalance: number,
  tga: number,
  rrp: number
): number {
  return fedBalance - tga - rrp
}

// Bitcoin price data from 2015-01 to 2026-01 (monthly) for overlay
// Extended history to show full liquidity-BTC correlation over multiple cycles
const btcPriceHistory: Record<string, number> = {
  // 2015
  '2015-01': 315, '2015-02': 254, '2015-03': 244, '2015-04': 236, '2015-05': 237, '2015-06': 263,
  '2015-07': 285, '2015-08': 230, '2015-09': 237, '2015-10': 315, '2015-11': 378, '2015-12': 430,
  // 2016
  '2016-01': 378, '2016-02': 436, '2016-03': 416, '2016-04': 454, '2016-05': 537, '2016-06': 674,
  '2016-07': 624, '2016-08': 573, '2016-09': 608, '2016-10': 702, '2016-11': 742, '2016-12': 963,
  // 2017 - Bull run
  '2017-01': 970, '2017-02': 1190, '2017-03': 1080, '2017-04': 1348, '2017-05': 2300, '2017-06': 2450,
  '2017-07': 2875, '2017-08': 4700, '2017-09': 4338, '2017-10': 6468, '2017-11': 10400, '2017-12': 14156,
  // 2018 - Bear market
  '2018-01': 10221, '2018-02': 10900, '2018-03': 6928, '2018-04': 9240, '2018-05': 7495, '2018-06': 6166,
  '2018-07': 8220, '2018-08': 7010, '2018-09': 6588, '2018-10': 6371, '2018-11': 4017, '2018-12': 3742,
  // 2019 - Recovery
  '2019-01': 3457, '2019-02': 3854, '2019-03': 4105, '2019-04': 5350, '2019-05': 8574, '2019-06': 10817,
  '2019-07': 9590, '2019-08': 9630, '2019-09': 8293, '2019-10': 9199, '2019-11': 7569, '2019-12': 7193,
  // 2020 - COVID crash and recovery
  '2020-01': 9350, '2020-02': 8599, '2020-03': 6424, '2020-04': 8624, '2020-05': 9455, '2020-06': 9137,
  '2020-07': 11351, '2020-08': 11655, '2020-09': 10778, '2020-10': 13803, '2020-11': 19698, '2020-12': 29001,
  // 2021 - Bull market peak
  '2021-01': 33114, '2021-02': 45137, '2021-03': 58918, '2021-04': 57750, '2021-05': 37332, '2021-06': 35040,
  '2021-07': 41461, '2021-08': 47166, '2021-09': 43790, '2021-10': 61318, '2021-11': 56905, '2021-12': 46306,
  // 2022 - Bear market (QT begins)
  '2022-01': 38483, '2022-02': 43193, '2022-03': 45538, '2022-04': 37644, '2022-05': 31792, '2022-06': 19985,
  '2022-07': 23307, '2022-08': 20050, '2022-09': 19432, '2022-10': 20495, '2022-11': 17168, '2022-12': 16547,
  // 2023 - Recovery
  '2023-01': 23125, '2023-02': 23475, '2023-03': 28478, '2023-04': 29252, '2023-05': 27220, '2023-06': 30477,
  '2023-07': 29236, '2023-08': 26044, '2023-09': 26968, '2023-10': 34502, '2023-11': 37715, '2023-12': 42265,
  // 2024 - ETF approval rally
  '2024-01': 42584, '2024-02': 51811, '2024-03': 71289, '2024-04': 64115, '2024-05': 67472, '2024-06': 62678,
  '2024-07': 64623, '2024-08': 59017, '2024-09': 63329, '2024-10': 69538, '2024-11': 91052, '2024-12': 97185,
  // 2025-2026
  '2025-01': 102405, '2025-02': 96200, '2025-03': 82500, '2025-04': 76000, '2025-05': 111000, '2025-06': 108500,
  '2025-07': 123000, '2025-08': 124000, '2025-09': 115800, '2025-10': 126210, '2025-11': 98500, '2025-12': 88445,
  '2026-01': 87800,
}

// Helper function to get liquidity values for a given date
function getLiquidityForDate(date: Date): { fedBalance: number; tga: number; rrp: number } {
  const year = date.getFullYear()
  const monthOfYear = date.getMonth()
  const startDate = new Date('2015-01-01')
  const monthIndex = (year - 2015) * 12 + monthOfYear

  // Simulate Fed balance sheet based on actual historical periods
  let fedBalance: number
  if (year < 2018) {
    fedBalance = 4.5e12 + Math.sin(monthIndex * 0.1) * 0.1e12
  } else if (year === 2018) {
    fedBalance = 4.5e12 - (monthIndex - 36) * 0.015e12
  } else if (year === 2019) {
    if (monthOfYear < 9) {
      fedBalance = 4.0e12 - (monthOfYear) * 0.01e12
    } else {
      fedBalance = 3.9e12 + (monthOfYear - 9) * 0.1e12
    }
  } else if (year === 2020) {
    if (monthOfYear < 3) {
      fedBalance = 4.2e12
    } else {
      fedBalance = 4.2e12 + (monthOfYear - 2) * 0.5e12
    }
  } else if (year === 2021) {
    fedBalance = 7.5e12 + (monthOfYear) * 0.12e12
  } else if (year === 2022) {
    if (monthOfYear < 4) {
      fedBalance = 8.9e12 + monthOfYear * 0.025e12
    } else {
      fedBalance = 9.0e12 - (monthOfYear - 4) * 0.08e12
    }
  } else if (year === 2023) {
    fedBalance = 8.4e12 - (monthOfYear) * 0.05e12
  } else if (year === 2024) {
    fedBalance = 7.8e12 - (monthOfYear) * 0.04e12
  } else {
    fedBalance = 7.3e12 - (monthOfYear) * 0.03e12
  }

  // Simulate TGA
  let tga: number
  if (year < 2019) {
    tga = 200e9 + Math.sin(monthIndex * 0.4) * 100e9
  } else if (year === 2019) {
    tga = 150e9 + Math.abs(Math.sin(monthIndex * 0.3)) * 200e9
  } else if (year === 2020) {
    if (monthOfYear < 6) {
      tga = 400e9 + monthOfYear * 100e9
    } else {
      tga = 1600e9 - (monthOfYear - 6) * 150e9
    }
  } else if (year === 2021) {
    if (monthOfYear < 6) {
      tga = 900e9 - monthOfYear * 120e9
    } else {
      tga = 200e9 + (monthOfYear - 6) * 80e9
    }
  } else {
    const tgaBase = 500e9
    const tgaVariation = Math.sin(monthIndex * 0.3) * 200e9
    tga = Math.max(100e9, tgaBase + tgaVariation)
  }
  tga = Math.max(50e9, tga)

  // Simulate RRP
  let rrp: number
  if (year < 2021) {
    rrp = Math.max(0, 25e9) // Use deterministic value instead of random
  } else if (year === 2021) {
    rrp = Math.min(1.5e12, monthOfYear * 120e9)
  } else if (year === 2022) {
    if (monthOfYear < 6) {
      rrp = 1.5e12 + monthOfYear * 150e9
    } else {
      rrp = 2.4e12 + Math.sin(monthOfYear * 0.5) * 0.1e12
    }
  } else if (year === 2023) {
    rrp = 2.3e12 - monthOfYear * 100e9
  } else if (year === 2024) {
    rrp = 1.1e12 - monthOfYear * 80e9
  } else {
    rrp = Math.max(50e9, 200e9 - monthOfYear * 20e9)
  }
  rrp = Math.max(0, rrp)

  return { fedBalance, tga, rrp }
}

// Generate historical net liquidity data anchored on BTC dates
// BTC remains fixed on its actual dates; liquidity is shifted to show what predicted each BTC price
export function generateNetLiquidityHistory(): NetLiquidityData[] {
  const data: NetLiquidityData[] = []
  const startDate = new Date('2015-04-01') // Start 3 months later since we need 3mo lookback
  const endDate = new Date('2026-01-01')

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear()
    const monthOfYear = currentDate.getMonth()

    // This is the BTC date (anchor point)
    const btcDateKey = `${year}-${String(monthOfYear + 1).padStart(2, '0')}`
    const btcPrice = btcPriceHistory[btcDateKey]

    // Look BACK 3 months for liquidity data (what predicted this BTC price)
    const liquidityDate = new Date(currentDate)
    liquidityDate.setMonth(liquidityDate.getMonth() - 3)
    const { fedBalance, tga, rrp } = getLiquidityForDate(liquidityDate)

    data.push({
      date: currentDate.toISOString().split('T')[0], // BTC date is the anchor
      fedBalance, // From 3 months ago
      tga, // From 3 months ago
      rrp, // From 3 months ago
      netLiquidity: calculateNetLiquidity(fedBalance, tga, rrp), // From 3 months ago
      btcPrice, // Actual BTC price for this date
      btcPriceLagged: btcPrice, // Same as btcPrice now (for backwards compatibility)
    })

    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return data
}

// Decision matrix for current conditions
export function generateDecisionMatrix(): DecisionMatrixRow[] {
  const indicators = howellIndicators

  return indicators.map((ind) => {
    const signalMap = {
      bullish: 'Bullish' as const,
      bearish: 'Bearish' as const,
      neutral: 'Neutral' as const,
    }

    const weightMap: Record<string, number> = {
      walcl: 25,
      tga: 15,
      rrp: 10,
      dxy: 15,
      move: 10,
      cycle: 10,
      pboc: 10,
      ecb: 5,
    }

    const weight = weightMap[ind.id] || 10
    const signalScore =
      ind.signal === 'bullish' ? 1 : ind.signal === 'bearish' ? -1 : 0
    const contribution = (signalScore * weight * ind.signalStrength) / 100

    return {
      indicator: ind.shortName,
      currentSignal: signalMap[ind.signal],
      weight,
      contribution: Math.round(contribution * 10) / 10,
      notes: ind.interpretation,
    }
  })
}

// Get aggregate signal
export function getAggregateSignal(): {
  signal: 'Bullish' | 'Bearish' | 'Neutral'
  score: number
  description: string
} {
  const matrix = generateDecisionMatrix()
  const totalContribution = matrix.reduce((sum, row) => sum + row.contribution, 0)

  let signal: 'Bullish' | 'Bearish' | 'Neutral'
  let description: string

  if (totalContribution > 10) {
    signal = 'Bullish'
    description = 'Net liquidity conditions favor risk assets'
  } else if (totalContribution < -10) {
    signal = 'Bearish'
    description = 'Net liquidity conditions are restrictive'
  } else {
    signal = 'Neutral'
    description = 'Mixed signals - wait for clarity'
  }

  return { signal, score: Math.round(totalContribution), description }
}

// Framework educational content
export const frameworkContent = {
  coreThesis: {
    title: "Howell's Core Thesis",
    content: `Michael Howell's research demonstrates that global liquidity is the primary driver of asset prices. His key insights:

1. **Liquidity Drives Everything**: ~90% of asset price movements can be explained by liquidity conditions
2. **13-Week Lead Time**: Changes in net liquidity lead risk asset prices by approximately 13 weeks (3 months)
3. **Net Liquidity Formula**: Fed Balance Sheet - TGA - RRP = Available Liquidity
4. **Global Coordination**: Major central banks (Fed, ECB, PBoC, BoJ) create synchronized liquidity waves
5. **Collateral Matters**: Treasury market functioning (MOVE index) affects liquidity transmission`,
  },
  cycleStages: {
    title: 'The 65-Month Cycle',
    stages: [
      {
        name: 'Recovery',
        months: '1-16',
        description:
          'Liquidity troughing, central banks shifting to easing. Best time to accumulate risk assets. Sentiment is poor but conditions improving.',
        action: 'Accumulate',
      },
      {
        name: 'Expansion',
        months: '17-32',
        description:
          'Liquidity rising steadily, risk assets performing well. Stay invested and ride the trend. Fundamentals catch up to liquidity.',
        action: 'Hold/Add',
      },
      {
        name: 'Slowdown',
        months: '33-48',
        description:
          'Liquidity growth peaking and starting to decelerate. Reduce position sizes. Late-cycle euphoria often present.',
        action: 'Reduce Risk',
      },
      {
        name: 'Contraction',
        months: '49-65',
        description:
          'Liquidity declining, risk assets under pressure. Defensive positioning. Wait for cycle to trough before re-entering.',
        action: 'Defensive',
      },
    ],
  },
  goldVsBitcoin: {
    title: 'Gold vs Bitcoin Divergence',
    content: `Howell's framework explains the relationship between gold and Bitcoin:

**Gold (Old Liquidity Hedge)**:
- Responds to real interest rates and dollar weakness
- Central bank buying provides structural bid
- Lower beta to liquidity than Bitcoin
- Performs in stagflationary environments

**Bitcoin (New Liquidity Proxy)**:
- High beta to global liquidity conditions
- 85%+ correlation with net liquidity (13-week lag)
- Amplifies liquidity moves (both up and down)
- Institutional adoption increasing correlation

**Divergence Explanation**:
When gold rises but Bitcoin lags, it often signals:
- Flight to safety (geopolitical risk)
- Central bank accumulation
- Liquidity conditions not yet supportive

When Bitcoin outperforms gold:
- Risk-on liquidity expansion
- Retail and institutional speculation
- Dollar weakness amplifying effect`,
  },
  dataSources: {
    title: 'Free Data Sources',
    sources: [
      {
        name: 'FRED (Federal Reserve Economic Data)',
        url: 'https://fred.stlouisfed.org',
        series: ['WALCL', 'RRPONTSYD', 'WTREGEN'],
        description: 'Fed balance sheet, reverse repo, Treasury data',
      },
      {
        name: 'Treasury Fiscal Data',
        url: 'https://fiscaldata.treasury.gov',
        series: ['Daily Treasury Statement', 'TGA Balance'],
        description: 'Real-time Treasury cash balance',
      },
      {
        name: 'NY Fed Markets',
        url: 'https://www.newyorkfed.org/markets',
        series: ['Reverse Repo Operations', 'SOMA Holdings'],
        description: 'Daily Fed operations data',
      },
      {
        name: 'Yahoo Finance',
        url: 'https://finance.yahoo.com',
        series: ['DX-Y.NYB', '^MOVE', '^VIX'],
        description: 'Market indices and volatility',
      },
      {
        name: 'CrossBorder Capital',
        url: 'https://www.crossbordercapital.com',
        series: ['Global Liquidity Index', 'Cycle Position'],
        description: "Howell's proprietary data (subscription)",
      },
    ],
  },
}
