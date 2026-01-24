import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get the appropriate database client based on role
    const db = getPrismaClient(role || "participant")

    // Find user in role-specific database
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json({ error: "Account is suspended or pending approval" }, { status: 403 })
    }

    // Create session
    const session = await createSession({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role as "participant" | "organizer" | "admin",
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
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}

