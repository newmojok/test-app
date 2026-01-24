import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/liquidity_tracker',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  fred: {
    apiKey: process.env.FRED_API_KEY || '',
    baseUrl: 'https://api.stlouisfed.org/fred',
    // M2 series IDs for each country
    series: {
      US: 'M2SL',           // US M2 Money Stock
      CN: 'MYAGM2CNM189N',  // China M2 (reported in CNY)
      EU: 'MABMM301EZM189S', // Eurozone M3
      JP: 'MABMM301JPM189S', // Japan M2
      UK: 'MABMM301GBM189S', // UK M4
    } as Record<string, string>,
  },

  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
    baseUrl: 'https://www.alphavantage.co/query',
  },

  email: {
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.ALERT_FROM_EMAIL || 'alerts@liquiditytracker.com',
    to: process.env.ALERT_TO_EMAIL || '',
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },

  // Alert thresholds (can be overridden per user)
  defaultThresholds: {
    m2RocUpper: 5,      // Alert when RoC > 5%
    m2RocLower: -2,     // Alert when RoC < -2%
    maturitySpike: 500, // Alert when quarterly maturities > $500B
  },

  // Data refresh settings
  dataRefresh: {
    cronSchedule: '0 0 * * *', // Daily at midnight UTC
    cacheExpiry: 60 * 60,      // 1 hour in seconds
  },
}
