import { query } from '../db/index.js'
import type { CreditImpulseData, CountryCode } from '../types/index.js'

interface CreditImpulseRow {
  id: number
  country: string
  quarter: Date
  new_credit: string
  gdp: string
  impulse: string
}

/**
 * Gets credit impulse data
 */
export async function getCreditImpulseData(
  country?: CountryCode,
  startDate?: Date
): Promise<CreditImpulseData[]> {
  let sql = `
    SELECT id, country, quarter, new_credit, gdp, impulse
    FROM credit_impulse
    WHERE 1=1
  `
  const params: (string | Date)[] = []

  if (country) {
    params.push(country)
    sql += ` AND country = $${params.length}`
  }

  if (startDate) {
    params.push(startDate)
    sql += ` AND quarter >= $${params.length}`
  }

  sql += ' ORDER BY country, quarter ASC'

  const result = await query<CreditImpulseRow>(sql, params)

  return result.rows.map((row) => ({
    id: row.id,
    country: row.country as CountryCode,
    quarter: row.quarter,
    newCredit: parseFloat(row.new_credit),
    gdp: parseFloat(row.gdp),
    impulse: parseFloat(row.impulse),
  }))
}

/**
 * Gets the latest credit impulse for each country
 */
export async function getLatestCreditImpulse(): Promise<CreditImpulseData[]> {
  const result = await query<CreditImpulseRow>(`
    SELECT DISTINCT ON (country) id, country, quarter, new_credit, gdp, impulse
    FROM credit_impulse
    ORDER BY country, quarter DESC
  `)

  return result.rows.map((row) => ({
    id: row.id,
    country: row.country as CountryCode,
    quarter: row.quarter,
    newCredit: parseFloat(row.new_credit),
    gdp: parseFloat(row.gdp),
    impulse: parseFloat(row.impulse),
  }))
}

/**
 * Upserts credit impulse data
 */
export async function upsertCreditImpulse(data: CreditImpulseData): Promise<void> {
  await query(
    `INSERT INTO credit_impulse (country, quarter, new_credit, gdp, impulse)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (country, quarter) DO UPDATE SET
       new_credit = EXCLUDED.new_credit,
       gdp = EXCLUDED.gdp,
       impulse = EXCLUDED.impulse`,
    [data.country, data.quarter, data.newCredit, data.gdp, data.impulse]
  )
}
