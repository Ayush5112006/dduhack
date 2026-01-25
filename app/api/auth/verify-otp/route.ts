import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import { isOTPValid } from "@/lib/otp"
import { createSession } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, role } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      )
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      return NextResponse.json(
        { error: "Invalid OTP format" },
        { status: 400 }
      )
    }

    // Get database for the selected role
    const selectedRole = role || "participant"
    const db = getPrismaClient(selectedRole)

    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      )
    }

    // Verify OTP
    if (!isOTPValid(user.otp, user.otpExpiresAt, otp)) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    // Mark user as verified and clear OTP
    const updatedUser = await db.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      }
    })

    // Create session for verified user
    const session = await createSession({
      userId: updatedUser.id,
      userEmail: updatedUser.email,
      userName: updatedUser.name,
      userRole: updatedUser.role,
    })

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        userId: session.userId,
        userEmail: session.userEmail,
        userName: session.userName,
        userRole: session.userRole,
      },
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    )
  }
}
