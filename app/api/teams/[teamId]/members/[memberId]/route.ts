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
 * PUT /api/teams/[teamId]/members/[memberId]
 * Update member status or role
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
    const { status, role, action } = body // Support both direct updates and actions

    // Get member
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: { userId: true, teamId: true, role: true },
    })

    if (!member || member.teamId !== teamId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Check permissions
    const isLeader = await canUserManageTeam(session.userId, teamId)
    const isOwnProfile = member.userId === session.userId

    if (!isLeader && !isOwnProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let updateData: any = {}

    // Handle legacy 'action' from the other PUT implementation
    if (action) {
      if (!isLeader) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      switch (action) {
        case "promote":
          if (member.role === "member") updateData.role = "leader"
          break
        case "demote":
          if (member.role === "leader") updateData.role = "member"
          break
        case "remove":
          if (member.role === "leader") {
            return NextResponse.json({ error: "Cannot remove team leader" }, { status: 400 })
          }
          await prisma.teamMember.delete({ where: { id: memberId } })
          return NextResponse.json({ success: true })
      }
    } else {
      // Direct updates
      if (status) {
        if (isOwnProfile || isLeader) {
          updateData.status = status
        } else {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
      if (role) {
        if (isLeader) {
          updateData.role = role
        } else {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
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
    console.error("Update team member error:", error)
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/teams/[teamId]/members/[memberId]
 * Remove member from team (leader only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { teamId, memberId } = await params

    // Get member
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      select: { userId: true, teamId: true, role: true },
    })

    if (!member || member.teamId !== teamId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Only leader can remove members
    const isLeader = await canUserManageTeam(session.userId, teamId)
    if (!isLeader) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Cannot remove team leader
    if (member.role === "leader") {
      return NextResponse.json(
        { error: "Cannot remove team leader. Transfer leadership first." },
        { status: 400 }
      )
    }

    // Remove member
    await prisma.teamMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove team member error:", error)
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    )
  }
}
