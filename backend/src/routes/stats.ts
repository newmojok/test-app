import { Router, Request, Response } from 'express'
import { getLatestM2Data } from '../models/m2.js'
import { getLatestCreditImpulse } from '../models/creditImpulse.js'
import { getNext12MonthMaturities } from '../models/maturities.js'
import { getAlerts } from '../services/alerts.js'
import { getCached, setCached, cacheKeys } from '../services/cache.js'
import type { DashboardStats } from '../types/index.js'

const router = Router()

// GDP-based weights for global M2 RoC calculation
const COUNTRY_WEIGHTS: Record<string, number> = {
  US: 0.31,
  CN: 0.28,
  EU: 0.22,
  JP: 0.12,
  UK: 0.07,
}

/**
 * GET /api/stats
 * Get dashboard stats
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const cacheKey = cacheKeys.stats()

    // Try cache first
    const cached = await getCached<DashboardStats>(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    // Get latest M2 data and calculate weighted RoC
    const latestM2 = await getLatestM2Data()
    let globalM2Roc = 0
    let totalWeight = 0

    for (const data of latestM2) {
      const weight = COUNTRY_WEIGHTS[data.country] || 0
      if (data.roc6m !== null) {
        globalM2Roc += data.roc6m * weight
        totalWeight += weight
      }
    }

    if (totalWeight > 0) {
      globalM2Roc /= totalWeight
    }

    // Get latest credit impulse (China weighted more heavily)
    const latestCredit = await getLatestCreditImpulse()
    let creditImpulse = 0
    const chinaCredit = latestCredit.find((c) => c.country === 'CN')
    const usCredit = latestCredit.find((c) => c.country === 'US')

    if (chinaCredit && usCredit) {
      // China weighted 60%, US 40%
      creditImpulse = chinaCredit.impulse * 0.6 + usCredit.impulse * 0.4
    } else if (chinaCredit) {
      creditImpulse = chinaCredit.impulse
    } else if (usCredit) {
      creditImpulse = usCredit.impulse
    }

    // Get maturities
    const next12MonthMaturities = await getNext12MonthMaturities()

    // Get unread alerts count
    const alerts = await getAlerts(100, true)
    const activeAlerts = alerts.length

    const stats: DashboardStats = {
      globalM2Roc,
      creditImpulse: creditImpulse * 100, // Convert to percentage
      next12MonthMaturities: next12MonthMaturities * 1e9, // Convert billions to actual value
      activeAlerts,
    }

    await setCached(cacheKey, stats, 300) // Cache for 5 minutes
    res.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

export default router
