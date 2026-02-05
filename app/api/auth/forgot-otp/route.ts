import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOTP, getOTPExpirationTime } from "@/lib/otp-generator"
import { sendOTPEmail } from "@/lib/email-service"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Check if user exists (for password reset, we generally want to verify this quietly)
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Security: Don't reveal if user exists
      // But for a hackathon/demo, we might want to be explicit. 
      // Let's stick to standard practice: success but no op.
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists with this email, an OTP has been sent."
        },
        { status: 200 }
      )
    }

    // Check rate limits/existing OTP
    const existingOTP = await prisma.emailOTP.findUnique({
      where: { email },
    })

    if (existingOTP && existingOTP.createdAt) {
      const timeSinceCreation = new Date().getTime() - new Date(existingOTP.createdAt).getTime()
      // 1 minute cooldown
      if (timeSinceCreation < 60 * 1000) {
        return NextResponse.json(
          { error: "Please wait a minute before requesting another OTP." },
          { status: 429 }
        )
      }
    }

    const otp = generateOTP()
    const expiresAt = getOTPExpirationTime(10) // 10 mins

    // Save to DB
    await prisma.emailOTP.deleteMany({ where: { email } })
    await prisma.emailOTP.create({
      data: {
        email,
        otp,
        expiresAt,
        attempts: 0
      }
    })

    // Send Email
    await sendOTPEmail(email, otp, 10)

    // Return mock OTP in dev mode for testing
    const response: any = {
      success: true,
      message: "OTP sent successfully."
    }

    if (process.env.NODE_ENV !== 'production') {
      response.mockOtp = otp
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error("Forgot Password OTP error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
