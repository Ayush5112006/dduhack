import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { notifications, ensureUser } from "@/lib/data"
import { broadcast } from "@/app/api/realtime/events/route"

// GET: Get notifications for current user
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  ensureUser(session)

  const userNotifications = notifications
    .filter((n) => n.userId === session.userId)
    .sort((a, b) => b.createdAt - a.createdAt)

  const unreadCount = userNotifications.filter((n) => !n.read).length

  return NextResponse.json({ notifications: userNotifications, unreadCount })
}

// POST: Mark notification as read
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { notificationId } = body

  const notification = notifications.find((n) => n.id === notificationId && n.userId === session.userId)
  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  }

  notification.read = true

  return NextResponse.json({ notification })
}
