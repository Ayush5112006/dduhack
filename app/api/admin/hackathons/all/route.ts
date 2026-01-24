import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const hackathons = await prisma.hackathon.findMany({
      select: {
        id: true,
        title: true,
        organizer: true,
        status: true,
        category: true,
        startDate: true,
        endDate: true,
        prizeAmount: true,
        ownerId: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formatted = hackathons.map((h) => ({
      id: h.id,
      title: h.title,
      organizer: h.organizer,
      status: h.status,
      category: h.category,
      startDate: h.startDate.toISOString(),
      endDate: h.endDate.toISOString(),
      prizeAmount: h.prizeAmount,
      ownerId: h.ownerId,
      createdAt: h.createdAt.toISOString(),
      registrations: h._count.registrations,
      submissions: h._count.submissions,
    }))

    return NextResponse.json({ hackathons: formatted })
  } catch (error) {
    console.error("Failed to fetch hackathons", error)
    return NextResponse.json({ error: "Failed to fetch hackathons" }, { status: 500 })
  }
}
