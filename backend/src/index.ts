import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import { testConnection } from './db/index.js'
import { startCronJobs, runImmediateRefresh } from './services/cron.js'
import { testFredConnection } from './services/fredApi.js'

// Import routes
import m2Routes from './routes/m2.js'
import creditImpulseRoutes from './routes/creditImpulse.js'
import maturitiesRoutes from './routes/maturities.js'
import alertsRoutes from './routes/alerts.js'
import correlationsRoutes from './routes/correlations.js'
import statsRoutes from './routes/stats.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Request logging
app.use((req, _res, next) => {
  if (config.nodeEnv === 'development') {
    console.log(`${req.method} ${req.path}`)
  }
  next()
})

// API Routes
app.use('/api/m2', m2Routes)
app.use('/api/credit-impulse', creditImpulseRoutes)
app.use('/api/maturities', maturitiesRoutes)
app.use('/api/alerts', alertsRoutes)
app.use('/api/correlations', correlationsRoutes)
app.use('/api/stats', statsRoutes)

// Health check
app.get('/api/health', async (_req, res) => {
  const dbConnected = await testConnection()
  const fredConnected = await testFredConnection()

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: dbConnected ? 'connected' : 'disconnected',
      fred: fredConnected ? 'connected' : 'disconnected',
    },
  })
})

// Manual data refresh endpoint (protected in production)
app.post('/api/refresh', async (req, res) => {
  if (config.nodeEnv === 'production') {
    const authHeader = req.headers.authorization
    if (!authHeader || authHeader !== `Bearer ${process.env.REFRESH_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  try {
    await runImmediateRefresh()
    res.json({ success: true, message: 'Data refresh triggered' })
  } catch (error) {
    console.error('Manual refresh failed:', error)
    res.status(500).json({ error: 'Refresh failed' })
  }
})

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Start server
async function start() {
  console.log('Starting Liquidity Tracker API...')

  // Test database connection
  const dbConnected = await testConnection()
  if (!dbConnected) {
    console.warn('Warning: Database connection failed. Some features may not work.')
  }

  // Test FRED API connection
  if (config.fred.apiKey) {
    const fredConnected = await testFredConnection()
    if (fredConnected) {
      console.log('FRED API connection successful')
    } else {
      console.warn('Warning: FRED API connection failed. Data refresh will not work.')
    }
  } else {
    console.warn('Warning: FRED API key not configured. Using seed data only.')
  }

  // Start cron jobs
  if (config.nodeEnv === 'production') {
    startCronJobs()
  }

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`)
    console.log(`Environment: ${config.nodeEnv}`)
    console.log(`API available at http://localhost:${config.port}/api`)
  })
}

start().catch(console.error)
