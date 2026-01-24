import { NextRequest, NextResponse } from "next/server"
import { teams } from "@/lib/data"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const team = teams.find((t) => t.id === id)

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const body = await request.json()
    const email = (body.email as string | undefined)?.toLowerCase()
    const accept = !!body.accept

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const member = team.members.find((m) => m.email.toLowerCase() === email)
    if (!member) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 })
    }

    member.status = accept ? "joined" : "declined"

    return NextResponse.json({ success: true, status: member.status })
  } catch (error) {
    console.error("Team respond error:", error)
    return NextResponse.json({ error: "Failed to update invite" }, { status: 500 })
  }
}
