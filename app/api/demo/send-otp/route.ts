import { NextRequest, NextResponse } from "next/server"
import { generateOTP, sendOTPEmail } from "@/lib/otp"

export const runtime = "nodejs"

/**
 * DEMO ENDPOINT ONLY - Send OTP to any email for testing
 * POST /api/demo/send-otp
 * Body: { email: "test@example.com" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()

    // Send OTP email
    try {
      const result = await sendOTPEmail(email, "Demo User", otp)
      
      if (result.sent) {
        return NextResponse.json({
          success: true,
          message: `OTP sent to ${email}`,
          email,
          otp: process.env.NODE_ENV !== "production" ? otp : undefined,
          timestamp: new Date().toISOString(),
        })
      } else {
        return NextResponse.json({
          success: true,
          message: `OTP generation successful (email send skipped: ${result.skippedReason})`,
          email,
          otp, // Always return OTP for demo
          timestamp: new Date().toISOString(),
        })
      }
    } catch (emailError) {
      console.error("Email send error:", emailError)
      return NextResponse.json({
        success: true,
        message: "OTP generated (email send failed, but OTP is available)",
        email,
        otp,
        error: "Email service temporarily unavailable",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Demo OTP endpoint error:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
