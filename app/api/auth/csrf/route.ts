import { NextRequest, NextResponse } from "next/server"
import { getCSRFToken } from "@/lib/secure-session"

/**
 * Get CSRF token for form submissions
 * CSRF tokens are stored in httpOnly cookies and also returned
 * for use in form submissions
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getCSRFToken()

    if (!token) {
      return NextResponse.json(
        { error: "CSRF token not available" },
        { status: 401 }
      )
    }

    return NextResponse.json({ token })
  } catch (error) {
    console.error("CSRF token retrieval error:", error)
    return NextResponse.json(
      { error: "Failed to get CSRF token" },
      { status: 500 }
    )
  }
}
