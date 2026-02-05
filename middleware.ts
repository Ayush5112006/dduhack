import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "hackathon_session"
const OAUTH_SESSION_COOKIE_NAME = "session" // For OAuth demo mode
const PROTECTED_PREFIXES = ["/dashboard", "/organizer", "/admin", "/judge"]

function parseSession(request: NextRequest) {
  // Try both cookie names for backward compatibility
  let cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!cookie) {
    cookie = request.cookies.get(OAUTH_SESSION_COOKIE_NAME)?.value
  }

  if (!cookie) return null

  try {
    const session = JSON.parse(cookie)

    // OAuth demo session format (has userId, userEmail, userRole)
    if (session?.userId && session?.userEmail && session?.userRole) {
      return {
        token: session.userId,
        userRole: session.userRole,
        userId: session.userId,
        userEmail: session.userEmail,
        userName: session.userName,
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        ...session
      }
    }

    // Regular session format (has token and expiresAt)
    if (!session?.token || !session?.expiresAt) return null
    if (Date.now() > session.expiresAt) return null
    return session
  } catch (error) {
    // If cookie is legacy raw string token, we cannot determine role; deny access
    return null
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const session = parseSession(request)

  // 1. Redirect to login if accessing protected route without session
  const isProtectedRoute = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix) || pathname === prefix)

  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // 2. Redirect logged-in users away from auth pages
  const isAuthPage = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")

  if (isAuthPage && session) {
    const dashboardMap: Record<string, string> = {
      participant: "/dashboard",
      organizer: "/organizer/dashboard",
      admin: "/admin/dashboard",
      judge: "/judge/dashboard",
    }
    const target = dashboardMap[session.userRole] || "/"
    return NextResponse.redirect(new URL(target, request.url))
  }

  // 3. Role-based access control (RBAC)
  if (session) {
    // Organizer routes
    if (pathname.startsWith("/organizer") && session.userRole !== "organizer" && session.userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url)) // Redirect unauthorized to generic dashboard
    }

    // Admin routes
    if (pathname.startsWith("/admin") && session.userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Judge routes 
    if (pathname.startsWith("/judge") && session.userRole !== "judge" && session.userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Create response
  const response = NextResponse.next()

  // Add Security Headers
  const headers = response.headers

  // Performance headers
  headers.set("X-DNS-Prefetch-Control", "on")

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY")

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff")

  // XSS Protection
  headers.set("X-XSS-Protection", "1; mode=block")

  // Referrer Policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Content Security Policy
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://vercel.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://vercel.live wss://ws-us3.pusher.com https://sockjs-us3.pusher.com https://va.vercel-scripts.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  )

  // Permissions Policy
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  )

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icon|apple-icon|favicon).*)",
  ],
}
