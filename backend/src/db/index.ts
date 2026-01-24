import pg from 'pg'
import { config } from '../config/index.js'

const { Pool } = pg

export const pool = new Pool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err)
  process.exit(-1)
})

export async function query<T>(text: string, params?: unknown[]): Promise<pg.QueryResult<T>> {
  const start = Date.now()
  const result = await pool.query<T>(text, params)
  const duration = Date.now() - start

  if (config.nodeEnv === 'development') {
    console.log('Executed query', { text, duration, rows: result.rowCount })
  }

  return result
}

export async function getClient() {
  const client = await pool.connect()
  const originalQuery = client.query.bind(client)
  const release = client.release.bind(client)

  // Override release to log duration
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
  }, 5000)

  client.release = () => {
    clearTimeout(timeout)
    return release()
  }

  return client
}

export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()')
    console.log('Database connected successfully')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}
