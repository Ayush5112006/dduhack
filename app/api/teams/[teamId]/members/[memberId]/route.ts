import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { canUserManageTeam } from "@/lib/team-utils"

/**
 * GET /api/teams/[teamId]/members/[memberId]
 * Get member details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const { teamId, memberId } = await params

    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
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

    if (!member || member.teamId !== teamId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Get member error:", error)
    return NextResponse.json(
      { error: "Failed to get member details" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/teams/[teamId]/members/[memberId]/promote
 * Promote member to co-leader
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId, memberId } = await params
    const body = await request.json()
    const { action } = body // 'promote', 'demote', 'remove'

    // Only leader can change roles
    const isLeader = await canUserManageTeam(session.userId, teamId)
    if (!isLeader) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: { userId: true, teamId: true, role: true },
    })

    if (!member || member.teamId !== teamId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case "promote":
        if (member.role === "member") {
          updateData.role = "leader"
        }
        break
      case "demote":
        if (member.role === "leader") {
          updateData.role = "member"
        }
        break
      case "remove":
        if (member.role === "leader") {
          return NextResponse.json(
            { error: "Cannot remove team leader. Demote first." },
            { status: 400 }
          )
        }
        // Delete the member
        await prisma.teamMember.delete({
          where: { id: memberId },
        })
        return NextResponse.json({ success: true })
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: updateData,
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update member role error:", error)
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    )
  }
}
