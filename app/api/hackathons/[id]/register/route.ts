import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import {
  findHackathonById,
  isRegistrationOpen,
  lockTeamIfDeadlinePassed,
  registrations,
  teams,
  Team,
} from "@/lib/data"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hackathon = findHackathonById(id)

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    if (!isRegistrationOpen(hackathon)) {
      return NextResponse.json({ error: "Registration is closed" }, { status: 400 })
    }

    const body = await request.json()
    const mode = body.mode === "team" ? "team" : "individual"
    const consent = !!body.consent
    const teamName = body.teamName as string | undefined
    const memberEmails: string[] = Array.isArray(body.memberEmails) ? body.memberEmails : []

    if (!consent) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 })
    }

    let teamId: string | undefined
    let createdTeam: Team | undefined

    if (mode === "team") {
      if (!teamName) {
        return NextResponse.json({ error: "Team name is required for team registrations" }, { status: 400 })
      }

      const team: Team = {
        id: `team_${Date.now()}`,
        hackathonId: hackathon.id,
        name: teamName,
        leaderId: session.userId,
        leaderEmail: session.userEmail,
        members: [
          { userId: session.userId, email: session.userEmail, status: "leader" },
          ...memberEmails.map((email) => ({ userId: `invite_${Date.now()}_${email}`, email, status: "invited" as const })),
        ],
        locked: false,
        createdAt: Date.now(),
      }

      lockTeamIfDeadlinePassed(team, hackathon)
      teams.push(team)
      teamId = team.id
      createdTeam = team
    }

    const registrationId = `reg_${Date.now()}`

    registrations.push({
      id: registrationId,
      hackathonId: hackathon.id,
      userId: session.userId,
      userEmail: session.userEmail,
      mode,
      teamId,
      status: "pending",
      consent,
      formData: body.formData || {},
      createdAt: Date.now(),
    })

    return NextResponse.json({
      success: true,
      registrationId,
      teamId,
      teamName: createdTeam?.name,
      invites: createdTeam?.members.filter((m) => m.status === "invited").map((m) => m.email) || [],
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
}
