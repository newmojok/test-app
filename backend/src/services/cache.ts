import Redis from 'ioredis'
import { config } from '../config/index.js'

let redis: Redis | null = null

/**
 * Gets the Redis client (creates one if it doesn't exist)
 */
export function getRedisClient(): Redis | null {
  if (!config.redis.url) {
    return null
  }

  if (!redis) {
    try {
      redis = new Redis(config.redis.url)
      redis.on('error', (err) => {
        console.error('Redis connection error:', err)
      })
    } catch (error) {
      console.warn('Failed to connect to Redis, caching disabled:', error)
      return null
    }
  }

  return redis
}

/**
 * Gets a cached value
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    const value = await client.get(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

/**
 * Sets a cached value
 */
export async function setCached<T>(
  key: string,
  value: T,
  expireSeconds: number = config.dataRefresh.cacheExpiry
): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.setex(key, expireSeconds, JSON.stringify(value))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

/**
 * Deletes a cached value
 */
export async function deleteCached(key: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.del(key)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

/**
 * Clears all cached data
 */
export async function clearCache(): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.flushdb()
    console.log('Cache cleared')
  } catch (error) {
    console.error('Cache clear error:', error)
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  m2Data: (country?: string) => `m2:${country || 'all'}`,
  m2Aggregate: () => 'm2:aggregate',
  creditImpulse: (country?: string) => `credit:${country || 'all'}`,
  maturities: (filters?: string) => `maturities:${filters || 'all'}`,
  quarterlyMaturities: () => 'maturities:quarterly',
  correlations: (assets?: string, lag?: number) => `correlations:${assets || 'all'}:${lag || 0}`,
  stats: () => 'stats:dashboard',
}
