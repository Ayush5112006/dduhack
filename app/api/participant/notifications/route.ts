import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// GET: Get user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
    const skip = Number(searchParams.get("skip")) || 0

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.notification.count({ where: { userId: session.userId } }),
    ])

    const unreadCount = await prisma.notification.count({
      where: { userId: session.userId, read: false },
    })

    return NextResponse.json(
      {
        notifications,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
        },
        unreadCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// PUT: Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, action } = body

    if (!Array.isArray(notificationIds) || !["read", "unread", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (action === "delete") {
      await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds },
          userId: session.userId,
        },
      })

      return NextResponse.json({ success: true, message: "Notifications deleted" }, { status: 200 })
    }

    const isRead = action === "read"
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.userId,
      },
      data: { read: isRead },
    })

    return NextResponse.json(
      { success: true, message: `Notifications marked as ${action}` },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to update notifications:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}

// POST: Create notification (admin/system only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !["admin", "organizer"].includes(session.userRole)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, type, title, message, link } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: link || null,
        read: false,
      },
    })

    return NextResponse.json({ success: true, notification }, { status: 201 })
  } catch (error) {
    console.error("Failed to create notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
