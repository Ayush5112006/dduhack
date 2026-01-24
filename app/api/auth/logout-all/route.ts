import { NextRequest, NextResponse } from "next/server"
import { getSession, destroySession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const db = getPrismaClient(session.userRole)

  try {
    // Delete all sessions for this user from the database
    await db.session.deleteMany({
      where: { userId: session.userId },
    })

    // Destroy the current session cookie
    await destroySession()

    return NextResponse.json({
      success: true,
      message: "Logged out from all devices",
    })
  } catch (error) {
    console.error("Logout all error:", error)
    return NextResponse.json(
      { error: "Failed to logout from all devices" },
      { status: 500 }
    )
  }
}
