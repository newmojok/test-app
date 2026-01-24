import { query } from '../db/index.js'
import type { DebtMaturity, QuarterlyMaturity } from '../types/index.js'

interface DebtMaturityRow {
  id: number
  issuer: string
  amount: string
  maturity_date: Date
  coupon: string | null
  rating: string | null
  geography: string | null
  sector: string
}

/**
 * Gets debt maturities with optional filters
 */
export async function getDebtMaturities(filters?: {
  geography?: string
  sector?: string
  rating?: string
  startDate?: Date
  endDate?: Date
}): Promise<DebtMaturity[]> {
  let sql = `
    SELECT id, issuer, amount, maturity_date, coupon, rating, geography, sector
    FROM debt_maturities
    WHERE 1=1
  `
  const params: (string | Date)[] = []

  if (filters?.geography) {
    params.push(filters.geography)
    sql += ` AND geography = $${params.length}`
  }

  if (filters?.sector) {
    params.push(filters.sector)
    sql += ` AND sector = $${params.length}`
  }

  if (filters?.rating) {
    params.push(filters.rating)
    sql += ` AND rating = $${params.length}`
  }

  if (filters?.startDate) {
    params.push(filters.startDate)
    sql += ` AND maturity_date >= $${params.length}`
  }

  if (filters?.endDate) {
    params.push(filters.endDate)
    sql += ` AND maturity_date <= $${params.length}`
  }

  sql += ' ORDER BY maturity_date ASC'

  const result = await query<DebtMaturityRow>(sql, params)

  return result.rows.map((row) => ({
    id: row.id,
    issuer: row.issuer,
    amount: parseFloat(row.amount),
    maturityDate: row.maturity_date,
    coupon: row.coupon ? parseFloat(row.coupon) : 0,
    rating: row.rating || '',
    geography: row.geography || '',
    sector: row.sector as DebtMaturity['sector'],
  }))
}

/**
 * Gets quarterly aggregated maturities
 */
export async function getQuarterlyMaturities(): Promise<QuarterlyMaturity[]> {
  const result = await query<{
    quarter: string
    sovereign: string
    ig_corp: string
    hy_corp: string
    total: string
  }>(`
    SELECT
      TO_CHAR(DATE_TRUNC('quarter', maturity_date), 'Q YYYY') as quarter,
      COALESCE(SUM(CASE WHEN sector = 'Sovereign' THEN amount ELSE 0 END), 0) as sovereign,
      COALESCE(SUM(CASE WHEN sector = 'IG_Corp' THEN amount ELSE 0 END), 0) as ig_corp,
      COALESCE(SUM(CASE WHEN sector = 'HY_Corp' THEN amount ELSE 0 END), 0) as hy_corp,
      COALESCE(SUM(amount), 0) as total
    FROM debt_maturities
    WHERE maturity_date >= CURRENT_DATE
    GROUP BY DATE_TRUNC('quarter', maturity_date)
    ORDER BY DATE_TRUNC('quarter', maturity_date)
  `)

  return result.rows.map((row) => ({
    quarter: `Q${row.quarter}`,
    sovereign: parseFloat(row.sovereign),
    igCorp: parseFloat(row.ig_corp),
    hyCorp: parseFloat(row.hy_corp),
    total: parseFloat(row.total),
  }))
}

/**
 * Gets total maturities for the next 12 months
 */
export async function getNext12MonthMaturities(): Promise<number> {
  const result = await query<{ total: string }>(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM debt_maturities
    WHERE maturity_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '12 months'
  `)

  return parseFloat(result.rows[0]?.total || '0')
}

/**
 * Inserts a new debt maturity
 */
export async function insertDebtMaturity(maturity: Omit<DebtMaturity, 'id'>): Promise<number> {
  const result = await query<{ id: number }>(
    `INSERT INTO debt_maturities (issuer, amount, maturity_date, coupon, rating, geography, sector)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      maturity.issuer,
      maturity.amount,
      maturity.maturityDate,
      maturity.coupon,
      maturity.rating,
      maturity.geography,
      maturity.sector,
    ]
  )

  return result.rows[0].id
}
