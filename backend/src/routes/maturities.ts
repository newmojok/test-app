import { Router, Request, Response } from 'express'
import { getDebtMaturities, getQuarterlyMaturities, getNext12MonthMaturities } from '../models/maturities.js'
import { getCached, setCached, cacheKeys } from '../services/cache.js'

const router = Router()

/**
 * GET /api/maturities
 * Get debt maturities with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { geography, sector, rating, startDate, endDate } = req.query

    const filters = {
      geography: geography as string | undefined,
      sector: sector as string | undefined,
      rating: rating as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    }

    const cacheKey = cacheKeys.maturities(JSON.stringify(filters))

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    const data = await getDebtMaturities(filters)

    await setCached(cacheKey, data)
    res.json(data)
  } catch (error) {
    console.error('Error fetching maturities:', error)
    res.status(500).json({ error: 'Failed to fetch maturities' })
  }
})

/**
 * GET /api/maturities/quarterly
 * Get quarterly aggregated maturities
 */
router.get('/quarterly', async (_req: Request, res: Response) => {
  try {
    const cacheKey = cacheKeys.quarterlyMaturities()

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    const data = await getQuarterlyMaturities()

    await setCached(cacheKey, data)
    res.json(data)
  } catch (error) {
    console.error('Error fetching quarterly maturities:', error)
    res.status(500).json({ error: 'Failed to fetch quarterly maturities' })
  }
})

/**
 * GET /api/maturities/next-12m
 * Get total maturities for the next 12 months
 */
router.get('/next-12m', async (_req: Request, res: Response) => {
  try {
    const total = await getNext12MonthMaturities()
    res.json({ total })
  } catch (error) {
    console.error('Error fetching next 12 month maturities:', error)
    res.status(500).json({ error: 'Failed to fetch next 12 month maturities' })
  }
})

export default router
