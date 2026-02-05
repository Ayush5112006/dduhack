import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import { getCache, setCache } from "@/lib/cache"
import { checkRateLimit } from "@/lib/security"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ============================================
    // HANDLE OAUTH DEMO SESSIONS
    // ============================================
    // Check if this is an OAuth demo session (no database record)
    if (session.userId && session.userId.includes('demo')) {
      console.log('📊 Serving demo dashboard data for OAuth session')

      const demoData = {
        success: true,
        user: {
          id: session.userId,
          name: session.userName || "Demo User",
          email: session.userEmail,
          role: session.userRole,
          profile: null,
        },
        stats: {
          activeHackathons: 0,
          totalSubmissions: 0,
          wins: 0,
          unreadNotifications: 1,
        },
        myHackathons: [],
        notifications: [
          {
            id: "demo_notif_1",
            title: "Welcome to HackHub! 🎉",
            message: "You're logged in with OAuth demo mode. Explore hackathons and start building!",
            link: "/hackathons",
            read: false,
            type: "announcement",
            createdAt: new Date(),
          }
        ],
        certificates: [],
      }

      return NextResponse.json(demoData, {
        headers: {
          "Cache-Control": "private, no-cache",
        },
      })
    }

    // ============================================
    // REGULAR DATABASE-BACKED SESSIONS
    // ============================================
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const rate = checkRateLimit(`dashboard:${ip}:${session.userId}`, 30, 60_000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter ?? 60) } }
      )
    }

    const cacheKey = `dashboard:${session.userRole}:${session.userId}:v1`
    const cached = await getCache(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "private, s-maxage=30, stale-while-revalidate=120",
        },
      })
    }

    // Get database client for user's role
    const db = getPrismaClient(session.userRole)

    const [user, registrations, submissions, certificates, notifications] = await Promise.all([
      db.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile: true,
        },
      }),
      db.registration.findMany({
        where: { userId: session.userId },
        include: { hackathon: true },
        orderBy: { createdAt: "desc" },
      }),
      db.submission.findMany({
        where: { userId: session.userId },
        include: { hackathon: true, scores: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.certificate.findMany({
        where: { userId: session.userId },
        include: { hackathon: true },
        orderBy: { issuedAt: "desc" },
        take: 50,
      }),
      db.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate statistics
    const stats = {
      activeHackathons: registrations.filter(r =>
        r.hackathon.status === 'live' || r.hackathon.status === 'upcoming'
      ).length,
      totalSubmissions: submissions.length,
      wins: certificates.filter(c => c.type === 'winner').length,
      unreadNotifications: notifications.filter(n => !n.read).length,
    }

    // Get active hackathons with submission status
    const myHackathons = registrations.map(reg => {
      const submission = submissions.find(s => s.hackathonId === reg.hackathonId)
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
    const recentNotifications = notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.read,
      type: n.type,
      createdAt: n.createdAt,
    }))

    const payload = {
      success: true,
      user,
      stats,
      myHackathons,
      notifications: recentNotifications,
      certificates: certificates.map(c => ({
        id: c.id,
        type: c.type,
        hackathonTitle: c.hackathonTitle,
        verificationCode: c.verificationCode,
        issuedAt: c.issuedAt,
      })),
    }

    await setCache(cacheKey, payload, 30)

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, s-maxage=30, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
