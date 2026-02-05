import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(
    request: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { teamId } = params
        const body = await request.json()
        const { userId } = body

        // Check if team exists
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                members: true,
                hackathon: {
                    select: {
                        maxTeamSize: true,
                    },
                },
            },
        })

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 })
        }

        // Check if team is full
        const maxSize = team.hackathon?.maxTeamSize || 4
        if (team.members.length >= maxSize) {
            return NextResponse.json({ error: "Team is full" }, { status: 400 })
        }

        // Check if user is already a member
        const existingMember = team.members.find((m) => m.userId === userId)
        if (existingMember) {
            return NextResponse.json(
                { error: "User is already a team member" },
                { status: 400 }
            )
        }

        // Add user to team
        const member = await prisma.teamMember.create({
            data: {
                teamId,
                userId,
                role: "member",
                status: "accepted",
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

        return NextResponse.json({ member }, { status: 201 })
    } catch (error) {
        console.error("Join team error:", error)
        return NextResponse.json({ error: "Failed to join team" }, { status: 500 })
    }
}
