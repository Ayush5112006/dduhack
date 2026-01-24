import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { decrypt } from "@/lib/session"
import { users } from "@/lib/data"

export async function GET() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const session = await decrypt(sessionCookie.value)
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ users })
}
