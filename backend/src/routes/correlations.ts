import { Router, Request, Response } from 'express'
import { calculateCorrelationMatrix } from '../services/calculations.js'
import { getCached, setCached, cacheKeys } from '../services/cache.js'

const router = Router()

// Sample data for correlations (in production, this would come from database)
const sampleCorrelationData: Record<string, number[]> = {
  'Global M2 RoC': Array.from({ length: 90 }, () => Math.random() * 10 - 2),
  'Credit Impulse': Array.from({ length: 90 }, () => Math.random() * 0.1 - 0.05),
  'BTC': Array.from({ length: 90 }, () => 30000 + Math.random() * 20000),
  'S&P 500': Array.from({ length: 90 }, () => 4000 + Math.random() * 1000),
  'Gold': Array.from({ length: 90 }, () => 1800 + Math.random() * 400),
  'DXY': Array.from({ length: 90 }, () => 100 + Math.random() * 10),
}

/**
 * GET /api/correlations
 * Get correlation matrix
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assets, lag } = req.query
    const lagValue = lag ? parseInt(lag as string, 10) : 0

    const cacheKey = cacheKeys.correlations(assets as string, lagValue)

    // Try cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    // Filter assets if specified
    let dataToUse = sampleCorrelationData
    if (assets) {
      const assetList = (assets as string).split(',')
      dataToUse = {}
      for (const asset of assetList) {
        if (sampleCorrelationData[asset]) {
          dataToUse[asset] = sampleCorrelationData[asset]
        }
      }
    }

    const matrix = calculateCorrelationMatrix(dataToUse, lagValue)

    const result = {
      ...matrix,
      period: '90-day rolling',
    }

    await setCached(cacheKey, result)
    res.json(result)
  } catch (error) {
    console.error('Error calculating correlations:', error)
    res.status(500).json({ error: 'Failed to calculate correlations' })
  }
})

/**
 * GET /api/correlations/pair
 * Get correlation for a specific pair of assets
 */
router.get('/pair', async (req: Request, res: Response) => {
  try {
    const { asset1, asset2, lag } = req.query

    if (!asset1 || !asset2) {
      return res.status(400).json({ error: 'asset1 and asset2 are required' })
    }

    const lagValue = lag ? parseInt(lag as string, 10) : 0

    const data1 = sampleCorrelationData[asset1 as string]
    const data2 = sampleCorrelationData[asset2 as string]

    if (!data1 || !data2) {
      return res.status(404).json({ error: 'One or both assets not found' })
    }

    const matrix = calculateCorrelationMatrix(
      { [asset1 as string]: data1, [asset2 as string]: data2 },
      lagValue
    )

    res.json({
      asset1,
      asset2,
      correlation: matrix.matrix[0][1],
      lag: lagValue,
      period: '90-day rolling',
    })
  } catch (error) {
    console.error('Error calculating correlation:', error)
    res.status(500).json({ error: 'Failed to calculate correlation' })
  }
})

export default router
