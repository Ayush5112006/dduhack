import Redis from "ioredis"

/**
 * Thin cache helper with Redis first and in-memory fallback.
 * Avoids throwing when Redis is unavailable.
 */
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL

let redis: Redis | null = null
if (redisUrl) {
  redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
  })
  // Best-effort connect; avoid unhandled rejection
  redis.connect().catch(() => {})
}

const memoryStore = new Map<string, { value: unknown; expiresAt: number }>()

export async function getCache<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const data = await redis.get(key)
      return data ? (JSON.parse(data) as T) : null
    } catch {
      // fall through to memory
    }
  }

  const entry = memoryStore.get(key)
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    memoryStore.delete(key)
    return null
  }
  return entry.value as T
}

export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds)
      return
    } catch {
      // fall through to memory
    }
  }
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}
