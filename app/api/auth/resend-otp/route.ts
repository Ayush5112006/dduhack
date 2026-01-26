/**
 * POST /api/auth/resend-otp
 * Resends OTP to user's email
 * 
 * Request body:
 * {
 *   email: string
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOTP, getOTPExpirationTime } from "@/lib/otp-generator"
import { sendOTPEmail } from "@/lib/email-service"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return NextResponse.json(
        {
          success: true,
          message:
            "If this email is registered, an OTP will be sent shortly.",
        },
        { status: 200 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified. You can now login." },
        { status: 400 }
      )
    }

    // Check existing OTP
    const existingOTP = await prisma.emailOTP.findUnique({
      where: { email },
    })

    // Rate limiting: Check if user has requested OTP multiple times recently
    if (existingOTP && existingOTP.createdAt) {
      const timeSinceCreation =
        new Date().getTime() - new Date(existingOTP.createdAt).getTime()

      // If last OTP was created less than 5 minutes ago, don't allow resend
      if (timeSinceCreation < 5 * 60 * 1000) {
        const remainingSeconds = Math.ceil(
          (5 * 60 * 1000 - timeSinceCreation) / 1000
        )
        return NextResponse.json(
          {
            error: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
            retryAfter: remainingSeconds,
          },
          { status: 429 }
        )
      }
    }

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = getOTPExpirationTime(10) // 10 minutes

    // Delete old OTP and create new one
    await prisma.emailOTP.deleteMany({
      where: { email },
    })

    await prisma.emailOTP.create({
      data: {
        email,
        otp,
        expiresAt,
        attempts: 0,
      },
    })

    // Send OTP email
    await sendOTPEmail(email, otp, 10)

    console.log(`✅ OTP resent to: ${email}`)

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent to your email. Please check your inbox and spam folder.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend OTP error:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to resend OTP. Please try again." },
      { status: 500 }
    )
  }
}
