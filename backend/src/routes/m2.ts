import { Router, Request, Response } from 'express'
import { getM2Data, getM2DataByCountry, getLatestM2Data } from '../models/m2.js'
import { calculateGlobalM2Aggregate } from '../services/calculations.js'
import { getCached, setCached, cacheKeys } from '../services/cache.js'
import type { CountryCode } from '../types/index.js'

const router = Router()

/**
 * GET /api/m2
 * Get M2 data for all countries or a specific country
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { country, startDate } = req.query
    const cacheKey = cacheKeys.m2Data(country as string)

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    const data = await getM2DataByCountry(
      startDate ? new Date(startDate as string) : undefined
    )

    // Filter by country if specified
    const filtered = country
      ? data.filter((d) => d.country === country)
      : data

    await setCached(cacheKey, filtered)
    res.json(filtered)
  } catch (error) {
    console.error('Error fetching M2 data:', error)
    res.status(500).json({ error: 'Failed to fetch M2 data' })
  }
})

/**
 * GET /api/m2/latest
 * Get the latest M2 data point for each country
 */
router.get('/latest', async (_req: Request, res: Response) => {
  try {
    const data = await getLatestM2Data()
    res.json(data)
  } catch (error) {
    console.error('Error fetching latest M2 data:', error)
    res.status(500).json({ error: 'Failed to fetch latest M2 data' })
  }
})

/**
 * GET /api/m2/aggregate
 * Get the weighted global M2 aggregate
 */
router.get('/aggregate', async (req: Request, res: Response) => {
  try {
    const { startDate } = req.query
    const cacheKey = cacheKeys.m2Aggregate()

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    const data = await getM2DataByCountry(
      startDate ? new Date(startDate as string) : undefined
    )

    // Transform data for aggregate calculation
    const m2ByCountry: Record<string, { date: string; value: number; roc6m: number | null }[]> = {}
    for (const country of data) {
      m2ByCountry[country.country] = country.data.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        value: d.value,
        roc6m: d.roc6m,
      }))
    }

    const aggregate = calculateGlobalM2Aggregate(m2ByCountry)

    await setCached(cacheKey, aggregate)
    res.json(aggregate)
  } catch (error) {
    console.error('Error calculating M2 aggregate:', error)
    res.status(500).json({ error: 'Failed to calculate M2 aggregate' })
  }
})

/**
 * GET /api/m2/:country
 * Get M2 data for a specific country
 */
router.get('/:country', async (req: Request, res: Response) => {
  try {
    const { country } = req.params
    const { startDate } = req.query

    const validCountries: CountryCode[] = ['US', 'CN', 'EU', 'JP', 'UK']
    if (!validCountries.includes(country as CountryCode)) {
      return res.status(400).json({ error: 'Invalid country code' })
    }

    const data = await getM2Data(
      country as CountryCode,
      startDate ? new Date(startDate as string) : undefined
    )

    res.json(data)
  } catch (error) {
    console.error('Error fetching M2 data:', error)
    res.status(500).json({ error: 'Failed to fetch M2 data' })
  }
})

export default router
