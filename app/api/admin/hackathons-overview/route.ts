import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as string | null
    const sortBy = searchParams.get("sort") || "createdAt"
    const limit = parseInt(searchParams.get("limit") || "100")

    // Build query based on status filter
    const query: any = {}
    if (status && status !== "all") {
      query.status = status
    }

    // Get all hackathons with organizer and stats
    const hackathons = await prisma.hackathon.findMany({
      where: query,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        startDate: true,
        endDate: true,
        prizeAmount: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        registrations: {
          select: {
            id: true,
          },
        },
        submissions: {
          select: {
            id: true,
            status: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        [sortBy]: "desc",
      },
      take: limit,
    })

    // Format response with stats
    const formattedHackathons = hackathons.map((h) => {
      const now = new Date()
      let computedStatus = "upcoming"
      if (now > h.endDate) computedStatus = "past"
      else if (now > h.startDate) computedStatus = "live"

      return {
        id: h.id,
        title: h.title,
        description: h.description,
        category: h.category,
        status: computedStatus,
        startDate: h.startDate,
        endDate: h.endDate,
        prizeAmount: h.prizeAmount,
        organizer: h.owner,
        registrationCount: h.registrations.length,
        submissionCount: h.submissions.length,
        submissionStatus: {
          pending: h.submissions.filter((s) => s.status === "pending").length,
          approved: h.submissions.filter((s) => s.status === "approved").length,
          rejected: h.submissions.filter((s) => s.status === "rejected").length,
        },
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      }
    })

    // Calculate stats
    const totalHackathons = formattedHackathons.length
    const totalRegistrations = formattedHackathons.reduce((sum, h) => sum + h.registrationCount, 0)
    const totalSubmissions = formattedHackathons.reduce((sum, h) => sum + h.submissionCount, 0)
    const activeHackathons = formattedHackathons.filter((h) => h.status === "live").length
    const upcomingHackathons = formattedHackathons.filter((h) => h.status === "upcoming").length

    return NextResponse.json({
      success: true,
      hackathons: formattedHackathons,
      stats: {
        total: totalHackathons,
        active: activeHackathons,
        upcoming: upcomingHackathons,
        past: totalHackathons - activeHackathons - upcomingHackathons,
        totalRegistrations,
        totalSubmissions,
        averageRegistrationsPerHackathon:
          totalHackathons > 0 ? Math.round(totalRegistrations / totalHackathons) : 0,
      },
    })
  } catch (error) {
    console.error("Admin hackathons fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch hackathons" }, { status: 500 })
  }
}
