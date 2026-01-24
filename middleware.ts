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

  if (!isProtected) {
    return NextResponse.next()
  }

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
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icon|apple-icon|favicon).*)",
  ],
}
