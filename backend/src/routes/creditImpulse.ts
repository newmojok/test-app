import { Router, Request, Response } from 'express'
import { getCreditImpulseData, getLatestCreditImpulse } from '../models/creditImpulse.js'
import { getCached, setCached, cacheKeys } from '../services/cache.js'
import type { CountryCode } from '../types/index.js'

const router = Router()

/**
 * GET /api/credit-impulse
 * Get credit impulse data
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { country, startDate } = req.query
    const cacheKey = cacheKeys.creditImpulse(country as string)

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    const data = await getCreditImpulseData(
      country as CountryCode | undefined,
      startDate ? new Date(startDate as string) : undefined
    )

    await setCached(cacheKey, data)
    res.json(data)
  } catch (error) {
    console.error('Error fetching credit impulse data:', error)
    res.status(500).json({ error: 'Failed to fetch credit impulse data' })
  }
})

/**
 * GET /api/credit-impulse/latest
 * Get the latest credit impulse for each country
 */
router.get('/latest', async (_req: Request, res: Response) => {
  try {
    const data = await getLatestCreditImpulse()
    res.json(data)
  } catch (error) {
    console.error('Error fetching latest credit impulse:', error)
    res.status(500).json({ error: 'Failed to fetch latest credit impulse' })
  }
})

/**
 * GET /api/credit-impulse/:country
 * Get credit impulse data for a specific country
 */
router.get('/:country', async (req: Request, res: Response) => {
  try {
    const { country } = req.params
    const { startDate } = req.query

    const validCountries: CountryCode[] = ['US', 'CN']
    if (!validCountries.includes(country as CountryCode)) {
      return res.status(400).json({ error: 'Invalid country code. Use US or CN.' })
    }

    const data = await getCreditImpulseData(
      country as CountryCode,
      startDate ? new Date(startDate as string) : undefined
    )

    res.json(data)
  } catch (error) {
    console.error('Error fetching credit impulse data:', error)
    res.status(500).json({ error: 'Failed to fetch credit impulse data' })
  }
})

export default router
