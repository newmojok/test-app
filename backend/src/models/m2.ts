import { query } from '../db/index.js'
import type { M2DataPoint, CountryCode } from '../types/index.js'

interface M2DataRow {
  id: number
  country: string
  date: Date
  value: string
  roc_6m: string | null
  yoy_change: string | null
  zscore: string | null
}

/**
 * Gets M2 data for a specific country or all countries
 */
export async function getM2Data(
  country?: CountryCode,
  startDate?: Date,
  limit?: number
): Promise<M2DataPoint[]> {
  let sql = `
    SELECT id, country, date, value, roc_6m, yoy_change, zscore
    FROM m2_data
    WHERE 1=1
  `
  const params: (string | number | Date)[] = []

  if (country) {
    params.push(country)
    sql += ` AND country = $${params.length}`
  }

  if (startDate) {
    params.push(startDate)
    sql += ` AND date >= $${params.length}`
  }

  sql += ' ORDER BY country, date ASC'

  if (limit) {
    params.push(limit)
    sql += ` LIMIT $${params.length}`
  }

  const result = await query<M2DataRow>(sql, params)

  return result.rows.map((row) => ({
    id: row.id,
    country: row.country as CountryCode,
    date: row.date,
    value: parseFloat(row.value),
    roc6m: row.roc_6m ? parseFloat(row.roc_6m) : null,
    yoyChange: row.yoy_change ? parseFloat(row.yoy_change) : null,
    zscore: row.zscore ? parseFloat(row.zscore) : null,
  }))
}

/**
 * Gets the latest M2 data point for each country
 */
export async function getLatestM2Data(): Promise<M2DataPoint[]> {
  const result = await query<M2DataRow>(`
    SELECT DISTINCT ON (country) id, country, date, value, roc_6m, yoy_change, zscore
    FROM m2_data
    ORDER BY country, date DESC
  `)

  return result.rows.map((row) => ({
    id: row.id,
    country: row.country as CountryCode,
    date: row.date,
    value: parseFloat(row.value),
    roc6m: row.roc_6m ? parseFloat(row.roc_6m) : null,
    yoyChange: row.yoy_change ? parseFloat(row.yoy_change) : null,
    zscore: row.zscore ? parseFloat(row.zscore) : null,
  }))
}

/**
 * Upserts M2 data
 */
export async function upsertM2Data(data: M2DataPoint): Promise<void> {
  await query(
    `INSERT INTO m2_data (country, date, value, roc_6m, yoy_change, zscore)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (country, date) DO UPDATE SET
       value = EXCLUDED.value,
       roc_6m = EXCLUDED.roc_6m,
       yoy_change = EXCLUDED.yoy_change,
       zscore = EXCLUDED.zscore,
       updated_at = CURRENT_TIMESTAMP`,
    [data.country, data.date, data.value, data.roc6m, data.yoyChange, data.zscore]
  )
}

/**
 * Bulk upserts M2 data
 */
export async function bulkUpsertM2Data(data: M2DataPoint[]): Promise<number> {
  let count = 0
  for (const point of data) {
    await upsertM2Data(point)
    count++
  }
  return count
}

/**
 * Gets M2 data grouped by country with metadata
 */
export async function getM2DataByCountry(startDate?: Date): Promise<
  {
    country: CountryCode
    name: string
    data: M2DataPoint[]
    latestValue: number
    latestRoc: number
    color: string
  }[]
> {
  const countryMeta: Record<string, { name: string; color: string }> = {
    US: { name: 'United States', color: '#3b82f6' },
    CN: { name: 'China', color: '#ef4444' },
    EU: { name: 'Eurozone', color: '#22c55e' },
    JP: { name: 'Japan', color: '#f97316' },
    UK: { name: 'United Kingdom', color: '#8b5cf6' },
  }

  const allData = await getM2Data(undefined, startDate)
  const latestData = await getLatestM2Data()

  const grouped = new Map<CountryCode, M2DataPoint[]>()
  for (const point of allData) {
    const existing = grouped.get(point.country) || []
    existing.push(point)
    grouped.set(point.country, existing)
  }

  return Array.from(grouped.entries()).map(([country, data]) => {
    const latest = latestData.find((d) => d.country === country)
    const meta = countryMeta[country] || { name: country, color: '#888888' }

    return {
      country,
      name: meta.name,
      data,
      latestValue: latest?.value || 0,
      latestRoc: latest?.roc6m || 0,
      color: meta.color,
    }
  })
}
