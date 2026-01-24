import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hackathons = await prisma.hackathon.findMany({
      where: { ownerId: session.userId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        mode: true,
        category: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        participants: true,
        difficulty: true,
        prizeAmount: true,
        location: true,
        banner: true,
        featured: true,
        _count: {
          select: {
            registrations: true,
            submissions: true,
            teams: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    })

    return NextResponse.json({ hackathons })
  } catch (error) {
    console.error("Error fetching hackathons:", error)
    return NextResponse.json(
      { error: "Failed to fetch hackathons" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      mode,
      category,
      difficulty,
      startDate,
      endDate,
      registrationDeadline,
      location,
      prizeAmount,
      eligibility,
      isFree,
    } = body

    if (!title || !mode || !category || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const hackathon = await prisma.hackathon.create({
      data: {
        title,
        description,
        mode,
        category,
        difficulty: difficulty || "Intermediate",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        registrationDeadline: new Date(registrationDeadline),
        location,
        prizeAmount: prizeAmount || 0,
        eligibility,
        isFree: isFree !== false,
        ownerId: session.userId,
        organizer: session.email || "Unknown",
      },
    })

    return NextResponse.json({ hackathon }, { status: 201 })
  } catch (error) {
    console.error("Error creating hackathon:", error)
    return NextResponse.json(
      { error: "Failed to create hackathon" },
      { status: 500 }
    )
  }
}
