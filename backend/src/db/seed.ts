import { pool, query } from './index.js'

// Generate sample M2 data
function generateM2Data() {
  const countries = [
    { code: 'US', baseValue: 15.4e12 },
    { code: 'CN', baseValue: 28e12 },
    { code: 'EU', baseValue: 12.8e12 },
    { code: 'JP', baseValue: 8.8e12 },
    { code: 'UK', baseValue: 2.9e12 },
  ]

  const data: Array<{
    country: string
    date: Date
    value: number
    roc6m: number | null
    yoyChange: number | null
    zscore: number | null
  }> = []

  const startDate = new Date('2020-01-01')
  const months = 60 // 5 years of data

  for (const country of countries) {
    let value = country.baseValue

    for (let i = 0; i < months; i++) {
      const date = new Date(startDate)
      date.setMonth(date.getMonth() + i)

      // Add realistic variation
      const growth = 0.002 + Math.sin(i * 0.2) * 0.005 + Math.random() * 0.003
      value *= 1 + growth

      // Calculate metrics (simplified for seed data)
      const roc6m = i >= 6 ? ((value - data[data.length - 6]?.value || value * 0.97) / (data[data.length - 6]?.value || value * 0.97)) * 100 : null
      const yoyChange = i >= 12 ? ((value - data[data.length - 12]?.value || value * 0.92) / (data[data.length - 12]?.value || value * 0.92)) * 100 : null
      const zscore = roc6m !== null ? (roc6m - 3.5) / 2.5 : null

      data.push({
        country: country.code,
        date,
        value,
        roc6m,
        yoyChange,
        zscore,
      })
    }
  }

  return data
}

// Sample debt maturities
const sampleMaturities = [
  { issuer: 'US Treasury', amount: 85, maturityDate: '2025-03-15', coupon: 2.5, rating: 'AAA', geography: 'US', sector: 'Sovereign' },
  { issuer: 'Apple Inc', amount: 12, maturityDate: '2025-05-01', coupon: 3.2, rating: 'AA', geography: 'US', sector: 'IG_Corp' },
  { issuer: 'Microsoft Corp', amount: 8, maturityDate: '2025-06-15', coupon: 2.8, rating: 'AAA', geography: 'US', sector: 'IG_Corp' },
  { issuer: 'Germany Bund', amount: 45, maturityDate: '2025-07-01', coupon: 1.5, rating: 'AAA', geography: 'EU', sector: 'Sovereign' },
  { issuer: 'China Govt', amount: 120, maturityDate: '2025-08-15', coupon: 3.0, rating: 'A', geography: 'China', sector: 'Sovereign' },
  { issuer: 'UK Gilt', amount: 35, maturityDate: '2025-09-01', coupon: 2.2, rating: 'AA', geography: 'EU', sector: 'Sovereign' },
  { issuer: 'Amazon.com', amount: 10, maturityDate: '2025-10-15', coupon: 3.5, rating: 'AA', geography: 'US', sector: 'IG_Corp' },
  { issuer: 'Toyota Motor', amount: 6, maturityDate: '2025-11-01', coupon: 2.1, rating: 'A', geography: 'EM', sector: 'IG_Corp' },
  { issuer: 'Tesla Inc', amount: 4, maturityDate: '2025-12-15', coupon: 5.5, rating: 'BB+', geography: 'US', sector: 'HY_Corp' },
  { issuer: 'France OAT', amount: 55, maturityDate: '2026-01-01', coupon: 1.8, rating: 'AA', geography: 'EU', sector: 'Sovereign' },
  { issuer: 'Japan JGB', amount: 95, maturityDate: '2026-02-15', coupon: 0.5, rating: 'A', geography: 'EM', sector: 'Sovereign' },
  { issuer: 'Netflix Inc', amount: 3, maturityDate: '2026-03-01', coupon: 5.8, rating: 'BB', geography: 'US', sector: 'HY_Corp' },
  { issuer: 'Goldman Sachs', amount: 15, maturityDate: '2026-04-15', coupon: 3.8, rating: 'A', geography: 'US', sector: 'IG_Corp' },
  { issuer: 'Italy BTP', amount: 65, maturityDate: '2026-05-01', coupon: 2.5, rating: 'BBB', geography: 'EU', sector: 'Sovereign' },
  { issuer: 'Ford Motor', amount: 5, maturityDate: '2026-06-15', coupon: 6.2, rating: 'BB+', geography: 'US', sector: 'HY_Corp' },
  { issuer: 'US Treasury', amount: 150, maturityDate: '2026-09-15', coupon: 3.0, rating: 'AAA', geography: 'US', sector: 'Sovereign' },
  { issuer: 'China Govt', amount: 200, maturityDate: '2027-01-15', coupon: 3.2, rating: 'A', geography: 'China', sector: 'Sovereign' },
  { issuer: 'Germany Bund', amount: 80, maturityDate: '2027-03-01', coupon: 2.0, rating: 'AAA', geography: 'EU', sector: 'Sovereign' },
]

// Sample credit impulse data
function generateCreditImpulseData() {
  const data: Array<{
    country: string
    quarter: Date
    newCredit: number
    gdp: number
    impulse: number
  }> = []

  const startDate = new Date('2020-01-01')

  for (let i = 0; i < 20; i++) {
    const quarter = new Date(startDate)
    quarter.setMonth(quarter.getMonth() + i * 3)

    // China data
    data.push({
      country: 'CN',
      quarter,
      newCredit: 2500 + Math.random() * 1000,
      gdp: 17000 + i * 500,
      impulse: Math.sin(i * 0.5) * 0.04 + (Math.random() - 0.5) * 0.02,
    })

    // US data
    data.push({
      country: 'US',
      quarter,
      newCredit: 800 + Math.random() * 300,
      gdp: 25000 + i * 400,
      impulse: Math.sin(i * 0.4) * 0.02 + (Math.random() - 0.5) * 0.015,
    })
  }

  return data
}

async function seed() {
  console.log('Seeding database...')

  try {
    // Seed M2 data
    const m2Data = generateM2Data()
    for (const row of m2Data) {
      await query(
        `INSERT INTO m2_data (country, date, value, roc_6m, yoy_change, zscore)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (country, date) DO UPDATE SET
           value = EXCLUDED.value,
           roc_6m = EXCLUDED.roc_6m,
           yoy_change = EXCLUDED.yoy_change,
           zscore = EXCLUDED.zscore,
           updated_at = CURRENT_TIMESTAMP`,
        [row.country, row.date, row.value, row.roc6m, row.yoyChange, row.zscore]
      )
    }
    console.log(`Seeded ${m2Data.length} M2 data points`)

    // Seed debt maturities
    for (const maturity of sampleMaturities) {
      await query(
        `INSERT INTO debt_maturities (issuer, amount, maturity_date, coupon, rating, geography, sector)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [maturity.issuer, maturity.amount, maturity.maturityDate, maturity.coupon, maturity.rating, maturity.geography, maturity.sector]
      )
    }
    console.log(`Seeded ${sampleMaturities.length} debt maturities`)

    // Seed credit impulse data
    const creditData = generateCreditImpulseData()
    for (const row of creditData) {
      await query(
        `INSERT INTO credit_impulse (country, quarter, new_credit, gdp, impulse)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (country, quarter) DO UPDATE SET
           new_credit = EXCLUDED.new_credit,
           gdp = EXCLUDED.gdp,
           impulse = EXCLUDED.impulse`,
        [row.country, row.quarter, row.newCredit, row.gdp, row.impulse]
      )
    }
    console.log(`Seeded ${creditData.length} credit impulse data points`)

    // Seed default alert thresholds
    await query(
      `INSERT INTO alert_thresholds (user_id, m2_roc_upper, m2_roc_lower, maturity_spike)
       VALUES ('default', 5.00, -2.00, 500.00)
       ON CONFLICT (user_id) DO NOTHING`
    )
    console.log('Seeded default alert thresholds')

    console.log('Database seeding completed successfully')
  } catch (error) {
    console.error('Seeding failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

seed().catch(console.error)
