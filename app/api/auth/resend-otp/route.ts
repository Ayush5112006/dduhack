import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import { generateOTP, getOTPExpirationTime, sendOTPEmail } from "@/lib/otp"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      )
    }

    // Generate new OTP
    const newOTP = generateOTP()
    const otpExpiresAt = getOTPExpirationTime()

    // Update user with new OTP
    await db.user.update({
      where: { email },
      data: {
        otp: newOTP,
        otpExpiresAt,
      }
    })

    // Send new OTP email
    try {
      const result = await sendOTPEmail(email, user.name, newOTP)
      if (!result.sent) {
        const message = process.env.NODE_ENV !== "production"
          ? `OTP email skipped (${result.skippedReason}). Here is your OTP: ${newOTP}`
          : "Failed to send OTP email. Please try again."
        return NextResponse.json(
          { error: message, ...(process.env.NODE_ENV !== "production" ? { otp: newOTP } : {}) },
          { status: 500 }
        )
      }
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError)
      return NextResponse.json(
        { error: "Failed to send OTP email. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email",
      ...(process.env.NODE_ENV !== "production" ? { otp: newOTP } : {}),
    })
  } catch (error) {
    console.error("Resend OTP error:", error)
    return NextResponse.json(
      { error: "Failed to resend OTP" },
      { status: 500 }
    )
  }
}
