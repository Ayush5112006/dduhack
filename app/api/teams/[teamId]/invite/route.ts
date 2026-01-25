import { NextRequest, NextResponse } from "next/server"
import { teams } from "@/lib/data"

export async function POST(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    const team = teams.find((t) => t.id === teamId)

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const body = await request.json()
    const invites: string[] = Array.isArray(body.invites) ? body.invites : []

    if (!invites.length) {
      return NextResponse.json({ error: "No invite emails provided" }, { status: 400 })
    }

    invites.forEach((email) => {
      const trimmed = email.trim()
      if (!trimmed) return
      const existing = team.members.find((m) => m.email.toLowerCase() === trimmed.toLowerCase())
      if (!existing) {
        team.members.push({ userId: `invite_${Date.now()}_${trimmed}`, email: trimmed, status: "invited" })
      }
    })

    return NextResponse.json({ success: true, invites: invites.filter(Boolean) })
  } catch (error) {
    console.error("Team invite error:", error)
    return NextResponse.json({ error: "Failed to add invites" }, { status: 500 })
  }
}
