export const dynamic = "force-dynamic";
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

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Total counts
    const totalUsers = await prisma.user.count()
    const totalHackathons = await prisma.hackathon.count()
    
    // Counts from last 30 days
    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })
    
    const recentHackathons = await prisma.hackathon.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })

    // Previous 30 days counts (for growth calculation)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    
    const previousUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    })

    const previousHackathons = await prisma.hackathon.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    })

    // Calculate growth percentages
    const userGrowth = previousUsers > 0 
      ? Math.round(((recentUsers - previousUsers) / previousUsers) * 100)
      : 0
      
    const hackathonGrowth = previousHackathons > 0
      ? Math.round(((recentHackathons - previousHackathons) / previousHackathons) * 100)
      : 0

    // Aggregate submissions and prize pool
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    })

    const totalSubmissions = users.reduce((sum, u) => sum + u._count.submissions, 0)

    const hackathons = await prisma.hackathon.findMany({
      select: { prizeAmount: true },
    })

    const totalPrizePool = hackathons.reduce((sum, h) => sum + (h.prizeAmount || 0), 0)

    return NextResponse.json({
      totalUsers,
      totalHackathons,
      totalSubmissions,
      totalPrizePool,
      userGrowth,
      hackathonGrowth,
    })
  } catch (error) {
    console.error("Admin analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
