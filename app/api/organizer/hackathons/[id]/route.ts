import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            registrations: true,
            submissions: true,
            teams: true,
          },
        },
      },
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: "Hackathon not found" },
        { status: 404 }
      )
    }

    // Check if user is the organizer
    if (hackathon.ownerId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ hackathon })
  } catch (error) {
    console.error("Error fetching hackathon:", error)
    return NextResponse.json(
      { error: "Failed to fetch hackathon" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: "Hackathon not found" },
        { status: 404 }
      )
    }

    if (hackathon.ownerId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const updated = await prisma.hackathon.update({
      where: { id: params.id },
      data: {
        title: body.title || hackathon.title,
        description: body.description || hackathon.description,
        mode: body.mode || hackathon.mode,
        category: body.category || hackathon.category,
        difficulty: body.difficulty || hackathon.difficulty,
        startDate: body.startDate ? new Date(body.startDate) : hackathon.startDate,
        endDate: body.endDate ? new Date(body.endDate) : hackathon.endDate,
        registrationDeadline: body.registrationDeadline
          ? new Date(body.registrationDeadline)
          : hackathon.registrationDeadline,
        location: body.location || hackathon.location,
        prizeAmount: body.prizeAmount !== undefined ? body.prizeAmount : hackathon.prizeAmount,
        eligibility: body.eligibility || hackathon.eligibility,
        status: body.status || hackathon.status,
        banner: body.banner || hackathon.banner,
        tags: body.tags || hackathon.tags,
      },
    })

    return NextResponse.json({ hackathon: updated })
  } catch (error) {
    console.error("Error updating hackathon:", error)
    return NextResponse.json(
      { error: "Failed to update hackathon" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
    })

    if (!hackathon) {
      return NextResponse.json(
        { error: "Hackathon not found" },
        { status: 404 }
      )
    }

    if (hackathon.ownerId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.hackathon.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting hackathon:", error)
    return NextResponse.json(
      { error: "Failed to delete hackathon" },
      { status: 500 }
    )
  }
}
