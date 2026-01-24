import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with all related data
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        registrations: {
          include: {
            hackathon: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        submissions: {
          include: {
            hackathon: true,
            scores: true,
          },
          orderBy: { createdAt: 'desc' }
        },
        certificates: {
          include: {
            hackathon: true,
          },
          orderBy: { issuedAt: 'desc' }
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate statistics
    const stats = {
      activeHackathons: user.registrations.filter(r => 
        r.hackathon.status === 'live' || r.hackathon.status === 'upcoming'
      ).length,
      totalSubmissions: user.submissions.length,
      wins: user.certificates.filter(c => c.type === 'winner').length,
      unreadNotifications: user.notifications.filter(n => !n.read).length,
    }

    // Get active hackathons with submission status
    const myHackathons = user.registrations.map(reg => {
      const submission = user.submissions.find(s => s.hackathonId === reg.hackathonId)
      return {
        id: reg.hackathonId,
        name: reg.hackathon.title,
        status: reg.hackathon.status,
        deadline: reg.hackathon.registrationDeadline,
        mode: reg.mode,
        registrationStatus: reg.status,
        submission: submission ? {
          id: submission.id,
          status: submission.status,
          title: submission.title,
          createdAt: submission.createdAt,
        } : null
      }
    })

    // Format notifications
    const recentNotifications = user.notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.read,
      type: n.type,
      createdAt: n.createdAt,
    }))

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      stats,
      myHackathons,
      notifications: recentNotifications,
      certificates: user.certificates.map(c => ({
        id: c.id,
        type: c.type,
        hackathonTitle: c.hackathonTitle,
        verificationCode: c.verificationCode,
        issuedAt: c.issuedAt,
      })),
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
