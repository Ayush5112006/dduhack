import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = getPrismaClient("participant")

    // Fetch recent user registrations and activity
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { name: true, email: true, createdAt: true, role: true },
    })

    const recentHackathons = await prisma.hackathon.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { title: true, createdAt: true },
    })

    // Build activity log from recent data
    const activities = [
      ...recentUsers.map((user, idx) => ({
        id: `user-${idx}`,
        type: "user",
        user: user.name,
        action: `joined as ${user.role}`,
        timestamp: user.createdAt.toISOString(),
      })),
      ...recentHackathons.map((hack, idx) => ({
        id: `hack-${idx}`,
        type: "hackathon",
        user: "System",
        action: `created hackathon "${hack.title}"`,
        timestamp: hack.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Admin activities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
