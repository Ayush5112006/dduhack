import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// GET: Get all hackathons for moderation
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const featured = searchParams.get("featured")

    const where: any = {}
    if (status) where.status = status
    if (featured === "true") where.featured = true
    if (featured === "false") where.featured = false

    const hackathons = await prisma.hackathon.findMany({
      where,
      include: {
        owner: { select: { name: true, email: true } },
        _count: {
          select: { registrations: true, submissions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ hackathons }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch hackathons:", error)
    return NextResponse.json({ error: "Failed to fetch hackathons" }, { status: 500 })
  }
}

// PUT: Update hackathon status or featured flag
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { hackathonId, featured, approved } = body

    if (!hackathonId) {
      return NextResponse.json({ error: "Hackathon ID required" }, { status: 400 })
    }

    const update: any = {}
    if (featured !== undefined) update.featured = featured
    if (approved !== undefined) update.status = approved ? "approved" : "draft"

    const updated = await prisma.hackathon.update({
      where: { id: hackathonId },
      data: update,
    })

    return NextResponse.json({ success: true, hackathon: updated }, { status: 200 })
  } catch (error) {
    console.error("Failed to update hackathon:", error)
    return NextResponse.json({ error: "Failed to update hackathon" }, { status: 500 })
  }
}
