
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isOTPExpired } from "@/lib/otp-generator"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, otp, password } = body

        if (!email || !otp || !password) {
            return NextResponse.json(
                { error: "Email, OTP, and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            )
        }

        // Verify OTP
        const emailOTP = await prisma.emailOTP.findUnique({
            where: { email },
        })

        if (!emailOTP) {
            return NextResponse.json(
                { error: "Invalid or expired OTP. Please request a new one." },
                { status: 400 }
            )
        }

        if (emailOTP.otp !== otp) {
            // Increment attempts (optional, but good practice)
            return NextResponse.json(
                { error: "Invalid verification code" },
                { status: 400 }
            )
        }

        if (isOTPExpired(emailOTP.expiresAt)) {
            await prisma.emailOTP.delete({ where: { email } })
            return NextResponse.json(
                { error: "OTP expired" },
                { status: 400 }
            )
        }

        // Find User
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Update User & Delete OTP
        await prisma.$transaction([
            prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            }),
            prisma.emailOTP.delete({ where: { email } })
        ])

        return NextResponse.json(
            { success: true, message: "Password updated successfully" },
            { status: 200 }
        )

    } catch (error) {
        console.error("Reset Password API Error:", error)
        return NextResponse.json(
            { error: "Failed to reset password" },
            { status: 500 }
        )
    }
}
