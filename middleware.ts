import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

const protectedRoutes = [
  "/dashboard",
  "/organizer/dashboard",
  "/admin/dashboard",
]

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const session = await getSession()

    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Check role-based access
    if (pathname.startsWith("/admin/dashboard") && session.userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (
      pathname.startsWith("/organizer/dashboard") &&
      session.userRole !== "organizer"
    ) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icon|apple-icon|favicon).*)",
  ],
}
