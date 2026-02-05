import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * Demo OAuth Login API
 * This allows testing OAuth login without setting up Google/GitHub OAuth apps
 * In production, users should use real OAuth with proper credentials
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { provider, user, role } = body

        if (!provider || !user) {
            return NextResponse.json({ error: "Missing provider or user data" }, { status: 400 })
        }

        // Create demo user session
        const session = {
            userId: `${provider}_demo_${Date.now()}`,
            userEmail: user.email,
            userName: user.name,
            userRole: role || "participant",
            provider: provider,
            isDemo: true, // Flag to indicate this is a demo session
            ...(user.github && { github: user.github }),
            ...(user.picture && { picture: user.picture }),
        }

        // Set session cookie
        const cookieStore = await cookies()
        cookieStore.set("session", JSON.stringify(session), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        })

        console.log(`✅ Demo ${provider} login successful:`, {
            email: user.email,
            name: user.name,
            role: role || "participant"
        })

        return NextResponse.json({
            success: true,
            message: `Demo ${provider} login successful`,
            user: {
                email: user.email,
                name: user.name,
                role: role || "participant",
                provider: provider
            }
        })
    } catch (error) {
        console.error("Demo OAuth error:", error)
        return NextResponse.json({ error: "Demo login failed" }, { status: 500 })
    }
}
