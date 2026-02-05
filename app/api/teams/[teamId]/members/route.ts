import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { canUserManageTeam, canTeamAddMoreMembers } from "@/lib/team-utils"

/**
 * POST /api/teams/[teamId]/members
 * Add a member to a team (leader only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId } = await params
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user is team leader
    const isLeader = await canUserManageTeam(session.userId, teamId)
    if (!isLeader) {
      return NextResponse.json(
        { error: "Only team leader can add members" },
        { status: 403 }
      )
    }

    // Get team details
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { hackathonId: true },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Check if team can add more members
    const canAdd = await canTeamAddMoreMembers(teamId, team.hackathonId)
    if (!canAdd.canAdd) {
      return NextResponse.json({ error: canAdd.error }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is already in this team
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId: user.id },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 409 }
      )
    }

    // Check if user is in another team for same hackathon
    const otherTeam = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: { hackathonId: team.hackathonId },
        status: "joined",
      },
    })

    if (otherTeam) {
      return NextResponse.json(
        { error: "User is already in another team for this hackathon" },
        { status: 400 }
      )
    }

    // Add member to team (status: invited)
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId: user.id,
        email,
        status: "invited",
        role: "member",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(member, { status: 201 })

  } catch (error) {
    console.error("Add team member error:", error)
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    )
  }
}
