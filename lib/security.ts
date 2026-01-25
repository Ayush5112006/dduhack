import { randomBytes, createHash, scryptSync, timingSafeEqual } from "crypto"
import { createCipheriv, createDecipheriv } from "crypto"

// Rate limiting storage (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const loginAttempts = new Map<string, { count: number; lockUntil: number }>()
const csrfTokenStore = new Map<string, { token: string; expiresAt: number }>()

// Constants for security
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours
const ENCRYPTION_ALGORITHM = "aes-256-gcm"
const ENCRYPTION_KEY_LENGTH = 32 // 256 bits for AES-256
const ENCRYPTION_IV_LENGTH = 16 // 128 bits for GCM
const ENCRYPTION_TAG_LENGTH = 16 // 128 bits for GCM tag

/**
 * Rate limiting middleware
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || record.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (record.count >= maxRequests) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((record.resetAt - now) / 1000) 
    }
  }

  record.count++
  return { allowed: true }
}

/**
 * Login attempt tracking (brute force protection)
 */
export function checkLoginAttempts(email: string): { 
  allowed: boolean
  lockUntil?: number
  remainingAttempts?: number
} {
  const MAX_ATTEMPTS = 5
  const LOCK_TIME = 15 * 60 * 1000 // 15 minutes
  const now = Date.now()
  
  const record = loginAttempts.get(email)

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 }
  }

  if (record.lockUntil && record.lockUntil > now) {
    return { 
      allowed: false, 
      lockUntil: record.lockUntil 
    }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const lockUntil = now + LOCK_TIME
    loginAttempts.set(email, { count: record.count, lockUntil })
    return { allowed: false, lockUntil }
  }

  return { 
    allowed: true, 
    remainingAttempts: MAX_ATTEMPTS - record.count 
  }
}

/**
 * Record failed login attempt
 */
export function recordFailedLogin(email: string): void {
  const record = loginAttempts.get(email)
  if (!record) {
    loginAttempts.set(email, { count: 1, lockUntil: 0 })
  } else {
    record.count++
  }
}

/**
 * Clear login attempts on successful login
 */
export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email)
}

/**
 * Generate CSRF token with expiration
 */
export function generateCSRFToken(sessionId: string): string {
  const token = randomBytes(32).toString("hex")
  csrfTokenStore.set(sessionId, {
    token: hashData(token),
    expiresAt: Date.now() + CSRF_TOKEN_EXPIRY,
  })
  return token
}

/**
 * Validate CSRF token with timing-safe comparison
 */
export function validateCSRFToken(sessionId: string, providedToken: string): boolean {
  const stored = csrfTokenStore.get(sessionId)

  if (!stored || !providedToken) {
    return false
  }

  // Check expiration
  if (stored.expiresAt < Date.now()) {
    csrfTokenStore.delete(sessionId)
    return false
  }

  // Timing-safe comparison to prevent timing attacks
  try {
    const providedHash = hashData(providedToken)
    return timingSafeEqual(
      Buffer.from(stored.token),
      Buffer.from(providedHash)
    )
  } catch {
    return false
  }
}

/**
 * Hash sensitive data (for comparison)
 */
export function hashData(data: string): string {
  return createHash("sha256").update(data).digest("hex")
}

/**
 * Sanitize input to prevent XSS and injection attacks
 * More comprehensive than previous implementation
 */
export function sanitizeInput(input: string): string {
  if (!input) return ""

  return input
    .replace(/[<>"`]/g, "") // Remove HTML-dangerous characters
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data: URIs
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .replace(/&\s*#/g, "") // Remove numeric entities that could be dangerous
    .trim()
    .substring(0, 1000) // Limit length
}

/**
 * Sanitize HTML content (for rich text, more permissive but still safe)
 */
export function sanitizeHTML(html: string): string {
  const dangerous = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
  return html.replace(dangerous, "")
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeURL(url: string): string {
  if (!url) return ""

  try {
    const parsed = new URL(url)
    // Only allow http and https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return ""
    }
    return parsed.toString()
  } catch {
    return ""
  }
}

/**
 * Escape HTML special characters (for rendering user content safely)
 */
export function escapeHTML(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validate email format with enhanced checks
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 simplified but effective
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return false
  }

  // Additional checks
  if (email.length > 254) {
    return false
  }

  const [localPart, domain] = email.split("@")
  
  // Local part max 64 chars
  if (localPart.length > 64) {
    return false
  }

  // Prevent suspicious patterns
  if (localPart.includes("..") || domain.includes("..")) {
    return false
  }

  // Domain should have valid TLD
  if (!/\.[a-z]{2,}$/.test(domain.toLowerCase())) {
    return false
  }

  return true
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Generate secure session token
 */
export function generateSecureToken(): string {
  return randomBytes(64).toString("hex")
}

/**
 * Check if IP is suspicious (simple check, enhance with real IP intelligence)
 */
export function isSuspiciousIP(ip: string): boolean {
  // Add your IP blacklist or use a service like IPQuality
  const blacklist = ["0.0.0.0", "127.0.0.1"] // Example
  return blacklist.includes(ip)
}

/**
 * Log security event
 */
export function logSecurityEvent(event: {
  type: "login_success" | "login_failed" | "rate_limit" | "suspicious_activity"
  email?: string
  ip?: string
  userAgent?: string
  details?: string
}): void {
  // In production, send to logging service (e.g., Sentry, LogRocket)
  console.log(`[SECURITY] ${event.type}:`, {
    timestamp: new Date().toISOString(),
    ...event,
  })
}

/**
 * Cleanup old rate limit records (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
  for (const [key, record] of loginAttempts.entries()) {
    if (record.lockUntil && record.lockUntil < now - 3600000) {
      loginAttempts.delete(key)
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
