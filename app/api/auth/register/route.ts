/**
 * POST /api/auth/register
 * Handles user registration
 * 
 * Request body:
 * {
 *   name: string
 *   email: string
 *   password: string
 *   role?: string (default: "participant") - one of: participant, organizer, judge
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   email?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcrypt'
import { generateOTP, getOTPExpirationTime } from '@/lib/otp-generator'
import { sendOTPEmail } from '@/lib/email-service'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role = "participant" } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['participant', 'organizer', 'judge']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: participant, organizer, judge' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user with emailVerified = false
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: false,
        role,
      },
    })

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = getOTPExpirationTime(10) // 10 minutes

    // Delete any existing OTP for this email
    await prisma.emailOTP.deleteMany({
      where: { email },
    })

    // Store OTP in database
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

    console.log(`✅ User registered: ${email}, OTP sent`)

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! OTP sent to your email.',
        email,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
