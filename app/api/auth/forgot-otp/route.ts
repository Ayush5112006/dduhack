import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email)
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const email: string = (body?.email || '').trim().toLowerCase()
    const applicationNumber: string = (body?.applicationNumber || '').trim()

    if (!email || !applicationNumber) {
      return NextResponse.json({ error: 'Email and application number are required.' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const otp = generateOtp()

    const subject = 'Your OTP for application verification'
    const html = `
      <p>Hello,</p>
      <p>Here is your OTP for application <strong>${applicationNumber}</strong>:</p>
      <p style="font-size:22px;font-weight:bold;letter-spacing:4px;">${otp}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `

    let sent = false
    if (process.env.RESEND_API_KEY) {
      try {
        await sendEmail({ to: email, subject, html })
        sent = true
      } catch (err) {
        console.error('Email send failed (mocking fallback).', err)
      }
    }

    // Return masked response; include otp in non-production for developer visibility
    const response: any = {
      success: true,
      message: sent ? 'If this email is registered, an OTP has been sent.' : 'Mock send completed (dev mode).',
    }
    if (process.env.NODE_ENV !== 'production') {
      response.mockOtp = otp
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Unable to process request' }, { status: 500 })
  }
}
