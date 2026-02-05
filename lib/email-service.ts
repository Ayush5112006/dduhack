/**
 * Email Service
 * Handles sending OTP emails using Nodemailer
 */

import nodemailer from 'nodemailer'
import { formatOTPForDisplay } from './otp-generator'

// Validate required environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS']
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} environment variable is not set`)
  }
})

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

/**
 * Verify transporter connection
 * Call this once during app initialization to catch email config issues early
 */
export async function verifyEmailService(): Promise<void> {
  try {
    await transporter.verify()
    console.log('✅ Email service verified and ready')
  } catch (error) {
    console.error('❌ Email service verification failed:', error)
    throw new Error('Email service is not configured properly')
  }
}

/**
 * HTML template for OTP email
 */
function getOTPEmailTemplate(email: string, otp: string, expiryMinutes: number = 10): string {
  const formattedOTP = formatOTPForDisplay(otp)

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #00d4aa;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #00d4aa;
          margin: 0;
          font-size: 28px;
        }
        .content {
          margin: 30px 0;
          text-align: center;
        }
        .content p {
          margin: 15px 0;
          font-size: 16px;
        }
        .email-display {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          font-size: 14px;
          margin: 20px 0;
          color: #666;
        }
        .otp-box {
          background: linear-gradient(135deg, #00d4aa 0%, #00a88f 100%);
          color: white;
          padding: 30px;
          border-radius: 8px;
          margin: 30px 0;
          text-align: center;
        }
        .otp-box .label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 10px;
        }
        .otp-code {
          font-size: 48px;
          font-weight: bold;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
          margin: 20px 0;
        }
        .expiry-notice {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
          color: #856404;
        }
        .security-notice {
          background: #e8f4f8;
          border-left: 4px solid #17a2b8;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 14px;
          color: #0c5460;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #999;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #00d4aa;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 HackHub</h1>
          <p>Email Verification</p>
        </div>

        <div class="content">
          <p>Hello,</p>
          <p>Thank you for registering with <strong>HackHub</strong>. We're excited to have you join our community!</p>

          <div class="email-display">
            <strong>Email:</strong> ${email}
          </div>

          <p>To complete your registration and secure your account, please verify your email using the code below:</p>

          <div class="otp-box">
            <div class="label">Your Verification Code</div>
            <div class="otp-code">${formattedOTP}</div>
            <div class="label">(Do not share this code with anyone)</div>
          </div>

          <div class="expiry-notice">
            ⏰ <strong>This code expires in ${expiryMinutes} minutes</strong>
          </div>

          <div class="security-notice">
            🔒 <strong>Security Notice:</strong> Never share this code with anyone. Our support team will never ask you for this code.
          </div>

          <p style="margin-top: 30px;">If you didn't register for this account, please ignore this email.</p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} HackHub. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Send OTP email to user
 * @param email - User's email address
 * @param otp - 6-digit OTP code
 * @param expiryMinutes - Minutes until OTP expires (default: 10)
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  expiryMinutes: number = 10
): Promise<void> {
  try {
    const mailOptions = {
      from: `HackHub <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verify Your Email - HackHub',
      html: getOTPEmailTemplate(email, otp, expiryMinutes),
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ OTP email sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error)
    throw new Error('Failed to send verification email')
  }
}

/**
 * Send welcome email after successful verification
 * @param email - User's email address
 * @param name - User's name
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #00d4aa; padding-bottom: 20px; }
          .header h1 { color: #00d4aa; margin: 0; }
          .success-badge { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0; font-weight: bold; }
          .button { display: inline-block; padding: 12px 24px; background: #00d4aa; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 HackHub</h1>
            <p>Welcome!</p>
          </div>
          <p>Hi ${name},</p>
          <p>Your email has been successfully verified! 🎉</p>
          <div class="success-badge">✓ Account Activated</div>
          <p>You can now:</p>
          <ul>
            <li>Register for hackathons</li>
            <li>Create and manage teams</li>
            <li>Submit projects and solutions</li>
            <li>Track your achievements</li>
          </ul>
          <p>Get started and explore amazing hackathons in your area!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
          <div class="footer">
            <p>© ${new Date().getFullYear()} HackHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: `HackHub <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✓ Welcome to HackHub!',
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Welcome email sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${email}:`, error)
    // Don't throw error for welcome email - it's non-critical
  }
}

/**
 * Send mentor invitation email with login credentials
 * @param email - Mentor's email address
 * @param name - Mentor's name
 * @param password - Generated password (only for new users)
 * @param hackathonTitle - Name of the hackathon
 * @param isNewUser - Whether this is a new user account
 */
export async function sendMentorInvitationEmail(params: {
  email: string
  name: string
  password: string
  hackathonTitle: string
  isNewUser: boolean
}): Promise<void> {
  const { email, name, password, hackathonTitle, isNewUser } = params

  try {
    const htmlContent = isNewUser ? `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
          .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
          .credentials-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .credentials-box h3 { margin-top: 0; color: #1f2937; }
          .credential-item { margin: 10px 0; }
          .credential-item strong { display: inline-block; width: 120px; }
          .password-code { background: #e5e7eb; padding: 8px 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; }
          .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; color: #92400e; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
          ul { padding-left: 20px; }
          ul li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome as a Mentor!</h1>
            <p>HackHub Platform</p>
          </div>

          <p>Hi <strong>${name}</strong>,</p>

          <p>You've been added as a mentor for <strong>${hackathonTitle}</strong>. We're excited to have you guide and support participants!</p>

          <div class="credentials-box">
            <h3>🔐 Your Login Credentials</h3>
            <div class="credential-item">
              <strong>Email/User ID:</strong> ${email}
            </div>
            <div class="credential-item">
              <strong>Password:</strong> <span class="password-code">${password}</span>
            </div>
          </div>

          <div class="warning-box">
            <strong>⚠️ Important Security Notice:</strong><br>
            Please change your password after your first login for security purposes.
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login" class="button">
              Login to Dashboard →
            </a>
          </div>

          <h3>As a Mentor, you can:</h3>
          <ul>
            <li>Guide and support participants throughout the hackathon</li>
            <li>Review project submissions and provide feedback</li>
            <li>Answer questions and help teams overcome challenges</li>
            <li>Share your expertise and industry insights</li>
            <li>Help participants develop their skills</li>
          </ul>

          <p>If you have any questions or need assistance, please don't hesitate to reach out to the organizing team.</p>

          <p>Best regards,<br>
          <strong>HackHub Team</strong></p>

          <div class="footer">
            <p>© ${new Date().getFullYear()} HackHub. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
          .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
          .info-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
          ul { padding-left: 20px; }
          ul li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 You're a Mentor!</h1>
            <p>HackHub Platform</p>
          </div>

          <p>Hi <strong>${name}</strong>,</p>

          <p>You've been added as a mentor for <strong>${hackathonTitle}</strong>.</p>

          <div class="info-box">
            <h3>Login Information</h3>
            <p>Please use your existing HackHub account credentials to login.</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login" class="button">
              Login to Dashboard →
            </a>
          </div>

          <h3>As a Mentor, you can:</h3>
          <ul>
            <li>Guide and support participants</li>
            <li>Review project submissions</li>
            <li>Provide feedback and mentorship</li>
            <li>Help teams succeed</li>
          </ul>

          <p>Best regards,<br>
          <strong>HackHub Team</strong></p>

          <div class="footer">
            <p>© ${new Date().getFullYear()} HackHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: `HackHub <${process.env.EMAIL_USER}>`,
      to: email,
      subject: isNewUser
        ? '🎓 Welcome as a Mentor - Your Account Details'
        : '🎓 You\'ve been added as a Mentor',
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Mentor invitation email sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send mentor invitation email to ${email}:`, error)
    throw new Error('Failed to send mentor invitation email')
  }
}

/**
 * Generic send email function for custom emails
 */
export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  try {
    const mailOptions = {
      from: `HackHub <${process.env.EMAIL_USER}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Email sent to ${params.to}`)
  } catch (error) {
    console.error(`❌ Failed to send email to ${params.to}:`, error)
    throw new Error('Failed to send email')
  }
}
