import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get("code")
        const error = searchParams.get("error")

        if (error) {
            return NextResponse.redirect(new URL(`/auth/login?error=${error}`, request.url))
        }

        if (!code) {
            return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
        }

        // Exchange code for access token
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID || "",
                client_secret: process.env.GITHUB_CLIENT_SECRET || "",
                code,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback/github`,
            }),
        })

        if (!tokenResponse.ok) {
            console.error("Token exchange failed:", await tokenResponse.text())
            return NextResponse.redirect(new URL("/auth/login?error=token_exchange_failed", request.url))
        }

        const tokens = await tokenResponse.json()

        if (tokens.error) {
            console.error("GitHub OAuth error:", tokens.error_description)
            return NextResponse.redirect(new URL(`/auth/login?error=${tokens.error}`, request.url))
        }

        // Get user info from GitHub
        const userInfoResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: "application/vnd.github.v3+json",
            },
        })

        if (!userInfoResponse.ok) {
            return NextResponse.redirect(new URL("/auth/login?error=user_info_failed", request.url))
        }

        const userInfo = await userInfoResponse.json()

        // Get user email (GitHub requires separate API call)
        const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: "application/vnd.github.v3+json",
            },
        })

        let email = userInfo.email
        if (!email && emailResponse.ok) {
            const emails = await emailResponse.json()
            const primaryEmail = emails.find((e: any) => e.primary)
            email = primaryEmail?.email || emails[0]?.email
        }

        // Create or update user in your database
        const user = {
            id: `github_${userInfo.id}`,
            email: email || `${userInfo.login}@github.user`,
            name: userInfo.name || userInfo.login,
            avatar: userInfo.avatar_url,
            github: userInfo.html_url,
            provider: "github",
        }

        // Create session
        const session = {
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            userRole: "participant", // Default role
            provider: "github",
            github: user.github,
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

        // Redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch (error) {
        console.error("GitHub OAuth callback error:", error)
        return NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
    }
}
