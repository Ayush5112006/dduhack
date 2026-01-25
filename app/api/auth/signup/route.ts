import { NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import { generateOTP, getOTPExpirationTime, sendOTPEmail } from "@/lib/otp"
import bcrypt from "bcrypt"

// Ensure Node.js runtime to avoid Edge HTML error responses
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[signup] request body", { email: body?.email, hasPassword: !!body?.password, role: body?.role || body?.userRole })
    const { email, password, phone, userName, userRole, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Get database for the selected role
    const selectedRole = (role || userRole || "participant") as "participant" | "organizer" | "admin"
    const db = getPrismaClient(selectedRole)
    console.log("[signup] using role DB:", selectedRole)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("[signup] password hashed")

    // Generate OTP
    const otp = generateOTP()
    const otpExpiresAt = getOTPExpirationTime()

    // Create user in database (unverified)
    const user = await db.user.create({
      data: {
        email,
        name: userName || email.split("@")[0],
        password: hashedPassword,
        phone: phone || null,
        role: userRole || "participant",
        status: "active",
        isVerified: false, // Not verified until OTP is confirmed
        otp, // Store OTP
        otpExpiresAt, // Store expiration time
      }
    })
    console.log("[signup] user created", { id: user.id })

    // Send OTP email
    let emailSendSkippedReason: string | undefined
    try {
      const result = await sendOTPEmail(email, user.name, otp)
      if (result.sent) {
        console.log("[signup] OTP email sent")
      } else {
        emailSendSkippedReason = result.skippedReason
        console.warn("[signup] OTP email skipped", { reason: emailSendSkippedReason })
      }
    } catch (emailError) {
      console.error("[signup] Failed to send OTP email:", emailError)
      // Still return success - user can request new OTP
    }

    return NextResponse.json({
      success: true,
      message: "Account created. Please verify your email with the OTP sent to your inbox.",
      userId: user.id,
      email: user.email,
      requiresOTPVerification: true,
      ...(emailSendSkippedReason && process.env.NODE_ENV !== "production" ? { otp, emailSendSkippedReason } : {}),
    })
  } catch (error: any) {
    console.error("[signup] error:", error)
    const message = typeof error?.message === "string" ? error.message : "Failed to sign up"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
