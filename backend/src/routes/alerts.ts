import { Router, Request, Response } from 'express'
import {
  getAlerts,
  markAlertRead,
  getAlertThresholds,
  updateAlertThresholds,
} from '../services/alerts.js'

const router = Router()

/**
 * GET /api/alerts
 * Get all alerts
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { unread, limit } = req.query

    const alerts = await getAlerts(
      limit ? parseInt(limit as string, 10) : 50,
      unread === 'true',
      undefined // userId could come from auth middleware
    )

    res.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
})

/**
 * PATCH /api/alerts/:id/read
 * Mark an alert as read
 */
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await markAlertRead(parseInt(id, 10))
    res.json({ success: true })
  } catch (error) {
    console.error('Error marking alert as read:', error)
    res.status(500).json({ error: 'Failed to mark alert as read' })
  }
})

/**
 * GET /api/alerts/thresholds
 * Get alert thresholds
 */
router.get('/thresholds', async (_req: Request, res: Response) => {
  try {
    const thresholds = await getAlertThresholds()
    res.json(thresholds)
  } catch (error) {
    console.error('Error fetching alert thresholds:', error)
    res.status(500).json({ error: 'Failed to fetch alert thresholds' })
  }
})

/**
 * PUT /api/alerts/thresholds
 * Update alert thresholds
 */
router.put('/thresholds', async (req: Request, res: Response) => {
  try {
    const { m2RocUpper, m2RocLower, maturitySpike } = req.body

    if (typeof m2RocUpper !== 'number' || typeof m2RocLower !== 'number' || typeof maturitySpike !== 'number') {
      return res.status(400).json({ error: 'Invalid threshold values' })
    }

    await updateAlertThresholds({
      m2RocUpper,
      m2RocLower,
      maturitySpike,
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating alert thresholds:', error)
    res.status(500).json({ error: 'Failed to update alert thresholds' })
  }
})

export default router
