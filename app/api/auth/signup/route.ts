import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userName, userRole, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Get database for the selected role
    const selectedRole = role || userRole || "participant"
    const db = getPrismaClient(selectedRole)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in database
    const user = await db.user.create({
      data: {
        email,
        name: userName || email.split("@")[0],
        password: hashedPassword,
        role: userRole || "participant",
        status: "active",
      }
    })

    // Create session
    const session = await createSession({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
    })

    return NextResponse.json({
      success: true,
      user: {
        userId: session.userId,
        userEmail: session.userEmail,
        userName: session.userName,
        userRole: session.userRole,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 })
  }
}
