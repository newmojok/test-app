import { pool, query } from './index.js'

const migrations = `
-- M2 Data Table
CREATE TABLE IF NOT EXISTS m2_data (
  id SERIAL PRIMARY KEY,
  country VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  value NUMERIC(20, 2) NOT NULL,
  roc_6m NUMERIC(10, 4),
  yoy_change NUMERIC(10, 4),
  zscore NUMERIC(10, 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(country, date)
);

CREATE INDEX IF NOT EXISTS idx_m2_country_date ON m2_data(country, date DESC);

-- Credit Impulse Table
CREATE TABLE IF NOT EXISTS credit_impulse (
  id SERIAL PRIMARY KEY,
  country VARCHAR(10) NOT NULL,
  quarter DATE NOT NULL,
  new_credit NUMERIC(20, 2) NOT NULL,
  gdp NUMERIC(20, 2) NOT NULL,
  impulse NUMERIC(10, 6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(country, quarter)
);

CREATE INDEX IF NOT EXISTS idx_credit_country_quarter ON credit_impulse(country, quarter DESC);

-- Debt Maturities Table
CREATE TABLE IF NOT EXISTS debt_maturities (
  id SERIAL PRIMARY KEY,
  issuer VARCHAR(200) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  maturity_date DATE NOT NULL,
  coupon NUMERIC(6, 3),
  rating VARCHAR(10),
  geography VARCHAR(20),
  sector VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maturities_date ON debt_maturities(maturity_date);
CREATE INDEX IF NOT EXISTS idx_maturities_sector ON debt_maturities(sector);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  related_chart VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  user_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(is_read, timestamp DESC);

-- Alert Thresholds Table
CREATE TABLE IF NOT EXISTS alert_thresholds (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100),
  m2_roc_upper NUMERIC(6, 2) DEFAULT 5.00,
  m2_roc_lower NUMERIC(6, 2) DEFAULT -2.00,
  maturity_spike NUMERIC(10, 2) DEFAULT 500.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Asset Prices Table (for correlation calculations)
CREATE TABLE IF NOT EXISTS asset_prices (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  price NUMERIC(20, 4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_asset_prices_symbol_date ON asset_prices(symbol, date DESC);

-- Data fetch log (to track API calls)
CREATE TABLE IF NOT EXISTS fetch_log (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  series_id VARCHAR(50),
  status VARCHAR(20) NOT NULL,
  records_fetched INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function runMigrations() {
  console.log('Running database migrations...')

  try {
    await query(migrations)
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

runMigrations().catch(console.error)
