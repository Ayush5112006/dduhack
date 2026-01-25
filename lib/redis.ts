import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL

// Create a singleton Redis client only when URL is provided
const globalForRedis = global as unknown as { redis?: Redis }

export const redis: Redis | null = (() => {
  if (!redisUrl) return null
  if (globalForRedis.redis) return globalForRedis.redis
  const client = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableAutoPipelining: true,
  })
  globalForRedis.redis = client
  return client
})()

type MemoryEntry = { value: unknown; expiresAt: number }
const memoryCache = new Map<string, MemoryEntry>()

function memoryGet<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.value as T
}

function memorySet(key: string, value: unknown, ttlSeconds: number) {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return memoryGet<T>(key)
  try {
    const raw = await redis.get(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn("Redis get failed, falling back to memory cache", error)
    return memoryGet<T>(key)
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!redis) {
    memorySet(key, value, ttlSeconds)
    return
  }
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds)
  } catch (error) {
    console.warn("Redis set failed, writing to memory cache", error)
    memorySet(key, value, ttlSeconds)
  }
}
