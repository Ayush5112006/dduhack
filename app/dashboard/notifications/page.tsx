"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bell, Trash2, CheckCircle, AlertCircle, Info, X, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/components/toast-provider"
import { useRealtime } from "@/hooks/use-realtime"

type Notification = {
  id: string
  title: string
  message: string
  type: "registration" | "deadline" | "result" | "invitation" | "announcement"
  read: boolean
  createdAt: number
  link?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filterType, setFilterType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()
  const { isConnected, subscribe } = useRealtime()

  // Load notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error('Failed to load notifications', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadNotifications()
  }, [])

  // Subscribe to real-time notification updates
  useEffect(() => {
    return subscribe('notification:new', (data) => {
      setNotifications(prev => [data.notification, ...prev])
      addToast("info", `New notification: ${data.notification.title}`)
    })
  }, [subscribe, addToast])

  const filteredNotifications = notifications.filter(
    (n) => filterType === "all" || (!n.read && filterType === "unread") || (n.read && filterType === "read")
  )

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId: id }),
      })
      
      if (response.ok) {
        setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
        addToast("success", "Marked as read")
      }
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
    addToast("success", "Notification deleted")
  }

  const handleDeleteAll = () => {
    if (confirm("Delete all notifications?")) {
      setNotifications([])
      addToast("success", "All notifications deleted")
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              <p className="mt-2 text-muted-foreground">
                Keep up with all important updates
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-500">Offline</span>
                </>
              )}
            </div>
          </div>
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleDeleteAll} size="sm">
              Clear All
            </Button>
          )}
        </div>

        <Card className="border-border bg-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notification Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterType === "unread" ? "default" : "outline"}
                onClick={() => setFilterType("unread")}
                size="sm"
              >
                Unread
              </Button>
              <Button
                variant={filterType === "read" ? "default" : "outline"}
                onClick={() => setFilterType("read")}
                size="sm"
              >
                Read
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredNotifications.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-4">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                {notifications.length === 0
                  ? "No notifications yet"
                  : "No notifications match your filter"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-border ${
                  notification.read ? "bg-card" : "bg-primary/5"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge variant="outline" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
