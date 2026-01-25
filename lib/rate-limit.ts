import { NextResponse } from "next/server"

// Simple in-memory rate limiter (fallback when Redis is unavailable)
// windowMs: time window in ms, limit: allowed requests per window
const memoryBuckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): { blocked: boolean; response?: NextResponse } {
  const now = Date.now()
  const bucket = memoryBuckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return { blocked: false }
  }

  bucket.count += 1
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    const response = NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.floor(bucket.resetAt / 1000)),
        },
      }
    )
    return { blocked: true, response }
  }

  return { blocked: false }
}
