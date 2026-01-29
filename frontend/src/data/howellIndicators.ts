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
  date: string
  fedBalance: number
  tga: number
  rrp: number
  netLiquidity: number
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
    lastUpdated: '2026-01-22',
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
    lastUpdated: '2026-01-22',
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
    lastUpdated: '2026-01-22',
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
    currentValue: 108.2,
    previousValue: 107.5,
    unit: 'Index',
    signal: 'bearish',
    signalStrength: 60,
    lastUpdated: '2026-01-22',
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
      'DXY at 108.2 represents significant dollar strength, creating headwinds for global liquidity. Strong dollar tightens financial conditions globally. This is a bearish signal for risk assets until DXY retreats below 105.',
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
    lastUpdated: '2026-01-22',
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

// Generate historical net liquidity data (mock)
export function generateNetLiquidityHistory(): NetLiquidityData[] {
  const data: NetLiquidityData[] = []
  const startDate = new Date('2020-01-01')
  const months = 73 // Jan 2020 to Jan 2026

  for (let i = 0; i < months; i++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + i)

    // Simulate Fed balance sheet (peaked at ~$9T in Apr 2022)
    let fedBalance: number
    if (i < 3) {
      fedBalance = 4.2e12 + i * 0.1e12 // Pre-COVID
    } else if (i < 28) {
      fedBalance = 4.5e12 + (i - 3) * 0.18e12 // COVID expansion to peak
    } else {
      fedBalance = 9e12 - (i - 28) * 0.05e12 // QT phase
    }

    // Simulate TGA (volatile around debt ceiling events)
    const tgaBase = 500e9
    const tgaVariation = Math.sin(i * 0.3) * 200e9
    const tga = Math.max(100e9, tgaBase + tgaVariation)

    // Simulate RRP (peaked at ~$2.5T, now near zero)
    let rrp: number
    if (i < 18) {
      rrp = Math.max(0, i * 50e9) // Building up
    } else if (i < 48) {
      rrp = Math.min(2.5e12, 900e9 + (i - 18) * 53e9) // Peak period
    } else {
      rrp = Math.max(100e9, 2.5e12 - (i - 48) * 96e9) // Declining
    }

    data.push({
      date: date.toISOString().split('T')[0],
      fedBalance,
      tga,
      rrp,
      netLiquidity: calculateNetLiquidity(fedBalance, tga, rrp),
    })
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
      notes: ind.interpretation.slice(0, 80) + '...',
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
