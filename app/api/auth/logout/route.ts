import { NextRequest, NextResponse } from "next/server"
import { destroySecureSession } from "@/lib/secure-session"

export async function POST(request: NextRequest) {
  try {
    await destroySecureSession()
    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
