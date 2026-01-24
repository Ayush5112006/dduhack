import { NextRequest, NextResponse } from "next/server"
import { getSession, destroySession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Delete all sessions for this user from the database
    await prisma.session.deleteMany({
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
