import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"

// Default credentials for testing
const DEFAULT_EMAIL = "demo@example.com"
const DEFAULT_PASSWORD = "demo123"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { email, password, userName, userRole } = body

    // Validate credentials
    if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
      const userId = `user_${Date.now()}`
      const session = await createSession({
        userId,
        userEmail: email,
        userName: userName || "Demo User",
        userRole: userRole || "participant",
      })

      return NextResponse.json({
        success: true,
        session,
        user: {
          userId: session.userId,
          userEmail: session.userEmail,
          userName: session.userName,
          userRole: session.userRole,
        },
      })
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}

