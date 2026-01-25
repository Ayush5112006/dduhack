import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const inviteSchema = z.object({
  teamId: z.string().min(1),
  memberEmails: z.array(z.string().email()).min(1),
})

// POST: Send team invitations
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = inviteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const { teamId, memberEmails } = validation.data

    // Verify team exists and user is leader
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { leader: true },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    if (team.leaderId !== session.userId) {
      return NextResponse.json({ error: "Only team leader can invite members" }, { status: 403 })
    }

    if (team.locked) {
      return NextResponse.json({ error: "Team is locked, no new invitations allowed" }, { status: 400 })
    }

    const results = []

    for (const email of memberEmails) {
      // Skip self
      if (email === session.userEmail) continue

      // Check if already a member
      const existing = await prisma.teamMember.findFirst({
        where: { teamId, email },
      })

      if (existing) {
        results.push({ email, status: "already_invited" })
        continue
      }

      // Find or create user
      let user = await prisma.user.findUnique({ where: { email } })

      if (!user) {
        // Create pending user (will activate on first login)
        user = await prisma.user.create({
          data: {
            email,
            name: email.split("@")[0],
            password: "", // Will be set on first login
            role: "participant",
            status: "pending",
          },
        })
      }

      // Add team member invitation
      await prisma.teamMember.create({
        data: {
          teamId,
          userId: user.id,
          email,
          status: "invited",
        },
      })

      results.push({ email, status: "invited" })
    }

    return NextResponse.json({ success: true, results }, { status: 200 })
  } catch (error) {
    console.error("Invitation error:", error)
    return NextResponse.json({ error: "Failed to send invitations" }, { status: 500 })
  }
}

// PUT: Accept/reject team invitation
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { teamMemberId, action } = body

    if (!teamMemberId || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      include: { team: true },
    })

    if (!member || member.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    if (action === "accept") {
      // Check if hackathon registration exists
      const registration = await prisma.registration.findUnique({
        where: {
          hackathonId_userId: {
            hackathonId: member.team.hackathonId,
            userId: session.userId,
          },
        },
      })

      if (!registration) {
        // Auto-register for hackathon with team
        await prisma.registration.create({
          data: {
            userId: session.userId,
            hackathonId: member.team.hackathonId,
            userEmail: session.userEmail,
            mode: "team",
            teamId: member.teamId,
            status: "approved",
            consent: true,
            fullName: session.userName,
            userEmail: session.userEmail,
          },
        })
      }

      await prisma.teamMember.update({
        where: { id: teamMemberId },
        data: { status: "joined" },
      })

      return NextResponse.json({ success: true, message: "Invitation accepted" }, { status: 200 })
    } else {
      await prisma.teamMember.update({
        where: { id: teamMemberId },
        data: { status: "declined" },
      })

      return NextResponse.json({ success: true, message: "Invitation declined" }, { status: 200 })
    }
  } catch (error) {
    console.error("Invitation update error:", error)
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 })
  }
}
