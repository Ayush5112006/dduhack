import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE_NAME = "hackathon_session"
const PROTECTED_PREFIXES = ["/dashboard", "/organizer", "/admin"]

function parseSession(request: NextRequest) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!cookie) return null
  try {
    const session = JSON.parse(cookie)
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
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  // Create response
  const response = isProtected ? 
    ((): NextResponse => {
      const session = parseSession(request)

      if (!session) {
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      const role = session.userRole

      if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
      }

      if (pathname.startsWith("/organizer") && role !== "organizer") {
        return NextResponse.redirect(new URL("/", request.url))
      }

      return NextResponse.next()
    })()
    : NextResponse.next()

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
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://vercel.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://vercel.live wss://ws-us3.pusher.com https://sockjs-us3.pusher.com",
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
