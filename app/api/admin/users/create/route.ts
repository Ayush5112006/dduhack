import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { getSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import { sendEmail } from "@/lib/email"
import bcrypt from "bcrypt"

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%"
  let pwd = ""
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pwd
}

export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Validate input
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 })
    }

    if (!["participant", "organizer", "admin", "judge"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const finalPassword = password && password.length >= 8 ? password : generateTempPassword()
    if (finalPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const db = getPrismaClient(role)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(finalPassword, 10)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "active",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    // Best-effort email with credentials
    if (process.env.RESEND_API_KEY) {
      const subject = "Your account has been created"
      const html = `
        <p>Hello ${name},</p>
        <p>An administrator created an account for you.</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${finalPassword}</p>
        <p>Please sign in and change your password.</p>
      `
      try {
        await sendEmail({ to: email, subject, html })
      } catch (err) {
        console.error("Failed to send invite email", err)
      }
    }

    const response: any = {
      success: true,
      user,
    }
    if (process.env.NODE_ENV !== "production") {
      response.tempPassword = finalPassword
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Failed to create user", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
