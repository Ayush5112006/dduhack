import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const session = await Promise.race([
      getSession(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 5000)
      )
    ])

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        userId: (session as any).userId,
        userEmail: (session as any).userEmail,
        userName: (session as any).userName,
        userRole: (session as any).userRole,
      },
    })
  } catch (error) {
    console.error("Session error:", error)
    // Return 401 instead of 500 on errors to allow app to continue
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
