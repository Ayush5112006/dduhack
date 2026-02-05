import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * Google OAuth Callback Handler
 * Exchanges authorization code for access token and fetches user data from Google API
 * 
 * Google APIs used:
 * - OAuth 2.0 Token API: https://oauth2.googleapis.com/token
 * - UserInfo API: https://www.googleapis.com/oauth2/v2/userinfo
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get("code")
        const error = searchParams.get("error")

        // Handle OAuth errors from Google
        if (error) {
            console.error("❌ Google OAuth error:", error)
            return NextResponse.redirect(new URL(`/auth/login?error=${error}`, request.url))
        }

        if (!code) {
            console.error("❌ No authorization code received")
            return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
        }

        console.log("🔐 Google OAuth callback received")
        console.log("📝 Authorization code:", code.substring(0, 20) + "...")

        // ============================================
        // STEP 1: Exchange authorization code for access token
        // ============================================
        console.log("🔄 Step 1: Exchanging code for access token...")

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback/google`

        if (!clientId || !clientSecret) {
            console.error("❌ Google OAuth credentials not configured")
            console.log("💡 Add NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local")
            return NextResponse.redirect(new URL("/auth/login?error=config_missing", request.url))
        }

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        })

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text()
            console.error("❌ Token exchange failed:", errorText)
            return NextResponse.redirect(new URL("/auth/login?error=token_exchange_failed", request.url))
        }

        const tokens = await tokenResponse.json()
        console.log("✅ Access token obtained")
        console.log("📊 Token type:", tokens.token_type)
        console.log("⏱️  Expires in:", tokens.expires_in, "seconds")

        // ============================================
        // STEP 2: Fetch user information from Google UserInfo API
        // ============================================
        console.log("🔄 Step 2: Fetching user info from Google API...")

        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        })

        if (!userInfoResponse.ok) {
            const errorText = await userInfoResponse.text()
            console.error("❌ Failed to fetch user info:", errorText)
            return NextResponse.redirect(new URL("/auth/login?error=user_info_failed", request.url))
        }

        const userInfo = await userInfoResponse.json()

        console.log("✅ User info retrieved from Google:")
        console.log("   📧 Email:", userInfo.email)
        console.log("   👤 Name:", userInfo.name)
        console.log("   🆔 Google ID:", userInfo.id)
        console.log("   ✔️  Verified:", userInfo.verified_email)
        console.log("   🖼️  Picture:", userInfo.picture ? "Yes" : "No")
        console.log("   🌍 Locale:", userInfo.locale)

        // ============================================
        // STEP 3: Create user object with Google data
        // ============================================
        const user = {
            id: `google_${userInfo.id}`,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            provider: "google",
            verified: userInfo.verified_email,
            locale: userInfo.locale,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
        }

        // ============================================
        // STEP 4: Create session
        // ============================================
        console.log("🔄 Step 3: Creating user session...")

        const session = {
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            userRole: "participant", // Default role - can be customized
            provider: "google",
            picture: user.picture,
            verified: user.verified,
            locale: user.locale,
            loginTime: Date.now(),
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

        console.log("✅ Session created successfully")
        console.log("🎉 Google OAuth login complete for:", user.email)

        // ============================================
        // STEP 5: Redirect to dashboard
        // ============================================
        console.log("🔄 Redirecting to dashboard...")
        return NextResponse.redirect(new URL("/dashboard", request.url))

    } catch (error) {
        console.error("❌ Google OAuth callback error:", error)
        console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
        return NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
    }
}
