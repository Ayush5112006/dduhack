import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { users } from "@/lib/data"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.userRole !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const user = users.find((u) => u.id === id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await request.json()
  if (!body.status) return NextResponse.json({ error: "Status required" }, { status: 400 })

  user.status = body.status
  return NextResponse.json({ success: true, user })
}
