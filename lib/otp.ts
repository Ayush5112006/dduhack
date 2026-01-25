import { Resend } from 'resend'

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Calculate OTP expiration time (10 minutes from now)
 */
export function getOTPExpirationTime(): Date {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 10)
  return now
}

/**
 * Send OTP verification email to user
 */
type SendResult = { sent: true } | { sent: false; skippedReason: string }

export async function sendOTPEmail(email: string, name: string, otp: string): Promise<SendResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn("[otp] RESEND_API_KEY not set; skipping email send.")
      return { sent: false, skippedReason: "missing-api-key" }
    }
    const resend = new Resend(apiKey)
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; }
            .otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #667eea; }
            .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .warning { color: #ff6b6b; font-size: 14px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Welcome to HackHub! To complete your registration, please verify your email address using the code below:</p>
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your verification code:</p>
                <div class="otp-code">${otp}</div>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p><strong>Please do not share this code with anyone.</strong></p>
              <p class="warning">⚠️ If you didn't request this code, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2026 HackHub. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@hackathon.com',
      to: email,
      subject: 'Verify Your Email - HackHub',
      html: emailTemplate,
    })
    return { sent: true }
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    throw error
  }
}

/**
 * Verify if provided OTP matches the stored OTP and hasn't expired
 */
export function isOTPValid(storedOTP: string | null, otpExpiresAt: Date | null, providedOTP: string): boolean {
  if (!storedOTP || !otpExpiresAt) {
    return false
  }

  // Check if OTP matches
  if (storedOTP !== providedOTP) {
    return false
  }

  // Check if OTP has expired
  if (new Date() > otpExpiresAt) {
    return false
  }

  return true
}
