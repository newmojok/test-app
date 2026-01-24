import nodemailer from 'nodemailer'
import axios from 'axios'
import { config } from '../config/index.js'
import { query } from '../db/index.js'
import type { Alert, AlertThresholds, AlertType, AlertSeverity } from '../types/index.js'

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
})

/**
 * Creates a new alert in the database
 */
export async function createAlert(
  type: AlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  relatedChart?: string,
  userId?: string
): Promise<Alert> {
  const result = await query<Alert>(
    `INSERT INTO alerts (type, severity, title, message, related_chart, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, type, severity, title, message, timestamp, related_chart as "relatedChart", is_read as "isRead", user_id as "userId"`,
    [type, severity, title, message, relatedChart || null, userId || null]
  )

  return result.rows[0]
}

/**
 * Gets recent alerts from the database
 */
export async function getAlerts(
  limit: number = 50,
  unreadOnly: boolean = false,
  userId?: string
): Promise<Alert[]> {
  let whereClause = 'WHERE 1=1'
  const params: (string | number | boolean)[] = []

  if (unreadOnly) {
    params.push(false)
    whereClause += ` AND is_read = $${params.length}`
  }

  if (userId) {
    params.push(userId)
    whereClause += ` AND (user_id = $${params.length} OR user_id IS NULL)`
  }

  params.push(limit)
  const limitParam = `$${params.length}`

  const result = await query<Alert>(
    `SELECT id, type, severity, title, message, timestamp,
            related_chart as "relatedChart", is_read as "isRead", user_id as "userId"
     FROM alerts
     ${whereClause}
     ORDER BY timestamp DESC
     LIMIT ${limitParam}`,
    params
  )

  return result.rows
}

/**
 * Marks an alert as read
 */
export async function markAlertRead(alertId: number): Promise<void> {
  await query('UPDATE alerts SET is_read = true WHERE id = $1', [alertId])
}

/**
 * Gets alert thresholds for a user
 */
export async function getAlertThresholds(userId: string = 'default'): Promise<AlertThresholds> {
  const result = await query<{
    m2_roc_upper: number
    m2_roc_lower: number
    maturity_spike: number
  }>(
    `SELECT m2_roc_upper, m2_roc_lower, maturity_spike
     FROM alert_thresholds
     WHERE user_id = $1`,
    [userId]
  )

  if (result.rows.length === 0) {
    return config.defaultThresholds
  }

  return {
    m2RocUpper: result.rows[0].m2_roc_upper,
    m2RocLower: result.rows[0].m2_roc_lower,
    maturitySpike: result.rows[0].maturity_spike,
  }
}

/**
 * Updates alert thresholds
 */
export async function updateAlertThresholds(
  thresholds: AlertThresholds,
  userId: string = 'default'
): Promise<void> {
  await query(
    `INSERT INTO alert_thresholds (user_id, m2_roc_upper, m2_roc_lower, maturity_spike, updated_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO UPDATE SET
       m2_roc_upper = EXCLUDED.m2_roc_upper,
       m2_roc_lower = EXCLUDED.m2_roc_lower,
       maturity_spike = EXCLUDED.maturity_spike,
       updated_at = CURRENT_TIMESTAMP`,
    [userId, thresholds.m2RocUpper, thresholds.m2RocLower, thresholds.maturitySpike]
  )
}

/**
 * Checks M2 data for threshold crossings and creates alerts
 */
export async function checkM2Alerts(
  currentRoc: number,
  previousRoc: number | null,
  thresholds: AlertThresholds
): Promise<Alert | null> {
  // Check for upward threshold crossing
  if (previousRoc !== null && previousRoc <= thresholds.m2RocUpper && currentRoc > thresholds.m2RocUpper) {
    return createAlert(
      'M2_INFLECTION',
      'critical',
      `M2 RoC Crossed +${thresholds.m2RocUpper}% Threshold`,
      `Global M2 6-month rate of change has crossed above +${thresholds.m2RocUpper}%, signaling potential risk-on conditions ahead. Current RoC: ${currentRoc.toFixed(2)}%`,
      'liquidity'
    )
  }

  // Check for downward threshold crossing
  if (previousRoc !== null && previousRoc >= thresholds.m2RocLower && currentRoc < thresholds.m2RocLower) {
    return createAlert(
      'M2_INFLECTION',
      'critical',
      `M2 RoC Crossed ${thresholds.m2RocLower}% Threshold`,
      `Global M2 6-month rate of change has crossed below ${thresholds.m2RocLower}%, signaling potential risk-off conditions ahead. Current RoC: ${currentRoc.toFixed(2)}%`,
      'liquidity'
    )
  }

  return null
}

/**
 * Checks credit impulse for sign reversal
 */
export async function checkCreditImpulseAlert(
  currentImpulse: number,
  previousImpulse: number | null
): Promise<Alert | null> {
  if (previousImpulse === null) return null

  // Check for positive reversal
  if (previousImpulse < 0 && currentImpulse >= 0) {
    return createAlert(
      'CREDIT_REVERSAL',
      'critical',
      'Credit Impulse Turned Positive',
      `Credit impulse has reversed from negative to positive territory, historically a bullish signal for risk assets. Current impulse: ${(currentImpulse * 100).toFixed(2)}%`,
      'credit'
    )
  }

  // Check for negative reversal
  if (previousImpulse >= 0 && currentImpulse < 0) {
    return createAlert(
      'CREDIT_REVERSAL',
      'warning',
      'Credit Impulse Turned Negative',
      `Credit impulse has reversed from positive to negative territory, historically a cautious signal for risk assets. Current impulse: ${(currentImpulse * 100).toFixed(2)}%`,
      'credit'
    )
  }

  return null
}

/**
 * Checks for maturity spikes
 */
export async function checkMaturityAlert(
  quarterlyTotal: number,
  quarter: string,
  thresholds: AlertThresholds
): Promise<Alert | null> {
  if (quarterlyTotal > thresholds.maturitySpike) {
    return createAlert(
      'MATURITY_SPIKE',
      'warning',
      `${quarter} Maturity Wall Alert`,
      `Quarterly debt maturities of $${quarterlyTotal.toFixed(0)}B exceed the $${thresholds.maturitySpike}B threshold. This concentration may create refinancing pressure.`,
      'maturities'
    )
  }

  return null
}

/**
 * Sends email notification for an alert
 */
export async function sendEmailAlert(alert: Alert): Promise<void> {
  if (!config.email.pass || !config.email.to) {
    console.log('Email not configured, skipping notification')
    return
  }

  const severityEmoji = {
    critical: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
  }

  const mailOptions = {
    from: config.email.from,
    to: config.email.to,
    subject: `${severityEmoji[alert.severity]} Liquidity Tracker: ${alert.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#eab308' : '#3b82f6'}">
          ${severityEmoji[alert.severity]} ${alert.title}
        </h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          ${alert.message}
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Timestamp: ${new Date(alert.timestamp).toLocaleString()}
        </p>
        <a href="https://yourapp.com/dashboard?tab=${alert.relatedChart}"
           style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">
          View Dashboard
        </a>
      </div>
    `,
  }

  try {
    await emailTransporter.sendMail(mailOptions)
    console.log(`Email alert sent: ${alert.title}`)
  } catch (error) {
    console.error('Failed to send email alert:', error)
  }
}

/**
 * Sends Telegram notification for an alert
 */
export async function sendTelegramAlert(alert: Alert): Promise<void> {
  if (!config.telegram.botToken || !config.telegram.chatId) {
    console.log('Telegram not configured, skipping notification')
    return
  }

  const severityEmoji = {
    critical: '🚨',
    warning: '⚠️',
    info: 'ℹ️',
  }

  const message = `
${severityEmoji[alert.severity]} *${alert.title}*

${alert.message}

_${new Date(alert.timestamp).toLocaleString()}_
  `.trim()

  try {
    await axios.post(`https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`, {
      chat_id: config.telegram.chatId,
      text: message,
      parse_mode: 'Markdown',
    })
    console.log(`Telegram alert sent: ${alert.title}`)
  } catch (error) {
    console.error('Failed to send Telegram alert:', error)
  }
}

/**
 * Sends notifications for an alert via all configured channels
 */
export async function notifyAlert(alert: Alert): Promise<void> {
  await Promise.allSettled([
    sendEmailAlert(alert),
    sendTelegramAlert(alert),
  ])
}
