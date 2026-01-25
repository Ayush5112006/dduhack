import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// GET: Get all users for moderation
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const role = searchParams.get("role")

    const where: any = {}
    if (status) where.status = status
    if (role) where.role = role

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { registrations: true, submissions: true, teamLeads: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// PUT: Update user status
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, status, role } = body

    if (!userId || !status) {
      return NextResponse.json({ error: "User ID and status required" }, { status: 400 })
    }

    const update: any = { status }
    if (role) update.role = role

    const updated = await prisma.user.update({
      where: { id: userId },
      data: update,
    })

    return NextResponse.json({ success: true, user: updated }, { status: 200 })
  } catch (error) {
    console.error("Failed to update user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
