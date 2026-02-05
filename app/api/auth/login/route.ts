import { NextRequest, NextResponse } from "next/server"
import { createSecureSession, getSessionFingerprint } from "@/lib/secure-session"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import bcrypt from "bcrypt"
import { 
  checkRateLimit, 
  checkLoginAttempts, 
  recordFailedLogin, 
  clearLoginAttempts,
  sanitizeInput,
  isValidEmail,
  logSecurityEvent
} from "@/lib/security"

// Force Node.js runtime (crypto used in security helpers)
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = sanitizeInput(body.email?.toLowerCase() || "")
    const password = body.password || ""
    const role = body.role || "participant"

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Rate limiting by IP
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const rateLimit = checkRateLimit(clientIP, 10, 60000) // 10 requests per minute
    
    if (!rateLimit.allowed) {
      logSecurityEvent({
        type: "rate_limit",
        email,
        ip: clientIP,
        details: `Rate limit exceeded`,
      })
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rateLimit.retryAfter} seconds` },
        { status: 429 }
      )
    }

    // Check login attempts (brute force protection)
    const loginCheck = checkLoginAttempts(email)
    
    if (!loginCheck.allowed) {
      const lockMinutes = Math.ceil((loginCheck.lockUntil! - Date.now()) / 60000)
      logSecurityEvent({
        type: "suspicious_activity",
        email,
        ip: clientIP,
        details: `Account locked due to too many failed attempts`,
      })
      return NextResponse.json(
        { error: `Account locked. Try again in ${lockMinutes} minutes` },
        { status: 429 }
      )
    }

    // Get the appropriate database client based on role
    const db = getPrismaClient(role)

    // Find user in role-specific database
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      recordFailedLogin(email)
      logSecurityEvent({
        type: "login_failed",
        email,
        ip: clientIP,
        details: "User not found",
      })
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      recordFailedLogin(email)
      logSecurityEvent({
        type: "login_failed",
        email,
        ip: clientIP,
        details: "Invalid password",
      })
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== "active") {
      logSecurityEvent({
        type: "login_failed",
        email,
        ip: clientIP,
        details: `Account status: ${user.status}`,
      })
      return NextResponse.json({ error: "Account is suspended or pending approval" }, { status: 403 })
    }

    // Clear login attempts on successful login
    clearLoginAttempts(email)

    // Create session fingerprint from user agent and accept language
    const userAgent = request.headers.get("user-agent") || ""
    const acceptLanguage = request.headers.get("accept-language") || ""
    const fingerprint = getSessionFingerprint(userAgent, acceptLanguage)

    // Create secure session with all security features
    const session = await createSecureSession({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role as "participant" | "organizer" | "admin",
    }, fingerprint)

    logSecurityEvent({
      type: "login_success",
      email,
      ip: clientIP,
      userAgent: userAgent || undefined,
    })

    return NextResponse.json({
      success: true,
      session: {
        token: session.token,
        userId: session.userId,
        userEmail: session.userEmail,
        userName: session.userName,
        userRole: session.userRole,
        expiresAt: session.expiresAt,
        absoluteExpiresAt: session.absoluteExpiresAt,
      },
      user: {
        userId: session.userId,
        userEmail: session.userEmail,
        userName: session.userName,
        userRole: session.userRole,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}