import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

// Validation schema for creating notifications
const notificationCreateSchema = z.object({
  userId: z.string().min(1, "User ID required"),
  type: z.enum(["registration", "deadline", "announcement", "scoring", "winner"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  actionUrl: z.string().url("Invalid action URL").optional(),
  hackathonId: z.string().optional(),
  sendEmail: z.boolean().default(true),
})

// GET: Get user notifications with pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
    const skip = Number(searchParams.get("skip")) || 0
    const type = searchParams.get("type")

    const whereClause: any = { userId: session.userId }
    if (type) {
      whereClause.type = type
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.notification.count({ where: whereClause }),
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

// POST: Create notification (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.userRole !== "admin" && session.userRole !== "organizer")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validation = notificationCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { userId, type, title, message, actionUrl, hackathonId, sendEmail: shouldSendEmail } = validation.data

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link: actionUrl,
        read: false,
      },
    })

    // Send email if requested
    if (shouldSendEmail && user.email) {
      try {
        await sendEmail({
          to: user.email,
          type: "hackathon-announcement",
          subject: title,
          data: {
            hackathonName: "Hackathon Platform",
            title,
            message,
            actionUrl: actionUrl || "",
            actionText: "View More",
          },
        })
        console.log(`[Notification] Email sent to ${user.email} for notification ${notification.id}`)
      } catch (emailError) {
        console.error(`[Notification] Failed to send email for notification ${notification.id}:`, emailError)
        // Continue even if email fails - notification is still created
      }
    }

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error("Failed to create notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

// PUT: Update notification read status or delete
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, notificationIds } = body

    if (!action || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ error: "Invalid action or notification IDs" }, { status: 400 })
    }

    if (action === "mark-read") {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.userId,
        },
        data: { read: true },
      })
      return NextResponse.json({ success: true, message: "Marked as read" }, { status: 200 })
    } else if (action === "mark-unread") {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.userId,
        },
        data: { read: false },
      })
      return NextResponse.json({ success: true, message: "Marked as unread" }, { status: 200 })
    } else if (action === "delete") {
      await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds },
          userId: session.userId,
        },
      })
      return NextResponse.json({ success: true, message: "Deleted" }, { status: 200 })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Failed to update notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
