/**
 * POST /api/auth/verify-otp
 * Verifies OTP and activates user account
 * 
 * Request body:
 * {
 *   email: string
 *   otp: string (6-digit)
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   user?: {
 *     id: string
 *     email: string
 *     name: string
 *   }
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isOTPExpired } from "@/lib/otp-generator"
import { sendWelcomeEmail } from "@/lib/email-service"

export const runtime = "nodejs"

const MAX_ATTEMPTS = 5

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      )
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      return NextResponse.json(
        { error: "OTP must be a 6-digit number" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 409 }
      )
    }

    // Fetch OTP record
    const emailOTP = await prisma.emailOTP.findUnique({
      where: { email },
    })

    if (!emailOTP) {
      return NextResponse.json(
        { error: "No OTP found. Please register again." },
        { status: 404 }
      )
    }

    // Check if OTP is expired
    if (isOTPExpired(emailOTP.expiresAt)) {
      // Delete expired OTP
      await prisma.emailOTP.delete({
        where: { email },
      })

      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 410 }
      )
    }

    // Check attempt limit
    if (emailOTP.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      )
    }

    // Verify OTP
    if (emailOTP.otp !== otp) {
      // Increment attempts
      await prisma.emailOTP.update({
        where: { email },
        data: { attempts: emailOTP.attempts + 1 },
      })

      const remainingAttempts = MAX_ATTEMPTS - emailOTP.attempts - 1

      return NextResponse.json(
        {
          error: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
          attemptsRemaining: Math.max(0, remainingAttempts),
        },
        { status: 401 }
      )
    }

    // OTP is valid - Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    })

    // Delete OTP record
    await prisma.emailOTP.delete({
      where: { email },
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, user.name).catch((error) => {
      console.error("Failed to send welcome email:", error)
    })

    console.log(`✅ Email verified for user: ${email}`)

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! Your account is now active.",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("OTP verification error:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    )
  }
}
