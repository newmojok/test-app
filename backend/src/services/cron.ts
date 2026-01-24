import cron from 'node-cron'
import { config } from '../config/index.js'
import { fetchAllM2Data, fetchUSBankCredit, fetchUSGDP } from './fredApi.js'
import { processM2Data, calculateCreditImpulse } from './calculations.js'
import { bulkUpsertM2Data } from '../models/m2.js'
import { upsertCreditImpulse } from '../models/creditImpulse.js'
import { getLatestM2Data } from '../models/m2.js'
import { getLatestCreditImpulse } from '../models/creditImpulse.js'
import {
  checkM2Alerts,
  checkCreditImpulseAlert,
  getAlertThresholds,
  notifyAlert,
} from './alerts.js'
import { query } from '../db/index.js'
import { clearCache } from './cache.js'

/**
 * Logs a data fetch operation
 */
async function logFetch(
  source: string,
  seriesId: string | null,
  status: string,
  recordsFetched: number | null,
  errorMessage: string | null
): Promise<void> {
  await query(
    `INSERT INTO fetch_log (source, series_id, status, records_fetched, error_message)
     VALUES ($1, $2, $3, $4, $5)`,
    [source, seriesId, status, recordsFetched, errorMessage]
  )
}

/**
 * Refreshes M2 data from FRED API
 */
export async function refreshM2Data(): Promise<void> {
  console.log('Starting M2 data refresh...')

  try {
    // Get previous data for alert comparison
    const previousLatest = await getLatestM2Data()

    // Fetch new data
    const rawData = await fetchAllM2Data('2020-01-01')

    for (const [country, data] of Object.entries(rawData)) {
      if (data.length === 0) {
        await logFetch('FRED', config.fred.series[country], 'skipped', 0, 'No data returned')
        continue
      }

      // Process and store
      const processed = processM2Data(data, country)
      const count = await bulkUpsertM2Data(processed)

      await logFetch('FRED', config.fred.series[country], 'success', count, null)
      console.log(`Updated ${count} M2 records for ${country}`)
    }

    // Check for alerts
    const newLatest = await getLatestM2Data()
    const thresholds = await getAlertThresholds()

    // Calculate weighted global RoC
    const weights: Record<string, number> = { US: 0.31, CN: 0.28, EU: 0.22, JP: 0.12, UK: 0.07 }
    let currentRoc = 0
    let previousRoc = 0
    let totalWeight = 0

    for (const data of newLatest) {
      const weight = weights[data.country] || 0
      if (data.roc6m !== null) {
        currentRoc += data.roc6m * weight
        totalWeight += weight
      }
    }
    if (totalWeight > 0) currentRoc /= totalWeight

    for (const data of previousLatest) {
      const weight = weights[data.country] || 0
      if (data.roc6m !== null) {
        previousRoc += data.roc6m * weight
      }
    }
    if (totalWeight > 0) previousRoc /= totalWeight

    // Check alerts
    const alert = await checkM2Alerts(currentRoc, previousRoc, thresholds)
    if (alert) {
      await notifyAlert(alert)
    }

    // Clear cache
    await clearCache()
    console.log('M2 data refresh completed')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('M2 data refresh failed:', errorMessage)
    await logFetch('FRED', null, 'error', null, errorMessage)
  }
}

/**
 * Refreshes credit impulse data
 */
export async function refreshCreditImpulseData(): Promise<void> {
  console.log('Starting credit impulse data refresh...')

  try {
    // Get previous data for alert comparison
    const previousLatest = await getLatestCreditImpulse()

    // Fetch credit and GDP data
    const creditData = await fetchUSBankCredit('2020-01-01')
    const gdpData = await fetchUSGDP('2020-01-01')

    if (creditData.length === 0 || gdpData.length === 0) {
      await logFetch('FRED', 'TOTBKCR/GDP', 'skipped', 0, 'No data returned')
      return
    }

    // Calculate credit impulse
    const impulseData = calculateCreditImpulse(creditData, gdpData)

    // Store results
    for (const data of impulseData) {
      await upsertCreditImpulse(data)
    }

    await logFetch('FRED', 'TOTBKCR/GDP', 'success', impulseData.length, null)
    console.log(`Updated ${impulseData.length} credit impulse records`)

    // Check for alerts
    const newLatest = await getLatestCreditImpulse()
    const usNew = newLatest.find((c) => c.country === 'US')
    const usPrev = previousLatest.find((c) => c.country === 'US')

    if (usNew && usPrev) {
      const alert = await checkCreditImpulseAlert(usNew.impulse, usPrev.impulse)
      if (alert) {
        await notifyAlert(alert)
      }
    }

    // Clear cache
    await clearCache()
    console.log('Credit impulse data refresh completed')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Credit impulse data refresh failed:', errorMessage)
    await logFetch('FRED', 'credit_impulse', 'error', null, errorMessage)
  }
}

/**
 * Starts all cron jobs
 */
export function startCronJobs(): void {
  console.log(`Starting cron jobs with schedule: ${config.dataRefresh.cronSchedule}`)

  // Daily data refresh at midnight UTC
  cron.schedule(config.dataRefresh.cronSchedule, async () => {
    console.log('Running scheduled data refresh...')
    await refreshM2Data()
    await refreshCreditImpulseData()
  })

  console.log('Cron jobs started')
}

/**
 * Runs an immediate data refresh (for manual triggers)
 */
export async function runImmediateRefresh(): Promise<void> {
  await refreshM2Data()
  await refreshCreditImpulseData()
}
