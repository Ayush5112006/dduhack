"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Notification = {
  id: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: number
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/notifications", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error("Failed to load notifications", error)
      }
    }
    load()
    
    // Refresh every 30 seconds
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationId: id }),
      })
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark as read", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5 text-sm font-semibold">Notifications</div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-2 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 10).map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start gap-1 p-3"
                onClick={() => {
                  markAsRead(notif.id)
                  if (notif.link) {
                    window.location.href = notif.link
                  }
                }}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <p className="text-sm font-medium">{notif.title}</p>
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{notif.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notif.createdAt).toISOString().replace('T', ' ').split('.')[0]}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="border-t px-2 py-1.5">
            <Link href="/dashboard/notifications" className="text-xs text-primary hover:underline">
              View all notifications →
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
