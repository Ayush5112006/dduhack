import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !["organizer", "admin"].includes(session.userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const organizerId = session.userId
    const db = getPrismaClient(session.userRole as "organizer" | "admin")

    // Get organizer's hackathons
    const hackathons = await db.hackathon.findMany({
      where: {
        ownerId: organizerId,
      },
      select: {
        id: true,
        title: true,
      },
    })

    const hackathonIds = hackathons.map((h) => h.id)

    // Get recent registrations for organizer's hackathons
    const registrations = await db.registration.findMany({
      where: {
        hackathonId: { in: hackathonIds },
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        hackathonId: true,
        hackathon: {
          select: {
            id: true,
            title: true,
          },
        },
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    // Get recent submissions for organizer's hackathons
    const submissions = await db.submission.findMany({
      where: {
        hackathonId: { in: hackathonIds },
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        hackathonId: true,
        hackathon: {
          select: {
            id: true,
            title: true,
          },
        },
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    // Get team memberships for organizer's hackathons
    const teamMembers = await db.teamMember.findMany({
      where: {
        team: {
          hackathonId: { in: hackathonIds },
        },
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        teamId: true,
        team: {
          select: {
            id: true,
            name: true,
            hackathonId: true,
          },
        },
        status: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    })

    // Combine and sort all activities
    const activities = [
      ...registrations.map((r) => ({
        type: "registration",
        timestamp: r.createdAt,
        user: r.user,
        action: `Registered for ${r.hackathon.title}`,
        details: `Status: ${r.status}`,
        hackathonId: r.hackathonId,
      })),
      ...submissions.map((s) => ({
        type: "submission",
        timestamp: s.createdAt,
        user: s.user,
        action: `Submitted project for ${s.hackathon.title}`,
        details: `Status: ${s.status}`,
        hackathonId: s.hackathonId,
      })),
      ...teamMembers.map((tm) => ({
        type: "team_action",
        timestamp: tm.createdAt,
        user: tm.user,
        action: `Joined team ${tm.team.name}`,
        details: `Member status: ${tm.status} (${tm.role})`,
        hackathonId: tm.team.hackathonId,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const totalActivities = activities.length
    const paginatedActivities = activities.slice(0, 100)

    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      total: totalActivities,
      hackathons: hackathons.length,
    })
  } catch (error) {
    console.error("Organizer activities fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}
