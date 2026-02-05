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
      <main className="px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:ml-64 lg:px-8 lg:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">Notifications</h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-muted-foreground">
              Keep up with all important updates
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-500 whitespace-nowrap">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-orange-500" />
                <span className="text-orange-500 whitespace-nowrap">Offline</span>
              </>
            )}
          </div>
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleDeleteAll} size="sm" className="h-10 text-xs sm:text-sm w-full sm:w-auto">
              Clear All
            </Button>
          )}
        </div>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg md:text-xl">Notification Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                size="sm"
                className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
              >
                All
              </Button>
              <Button
                variant={filterType === "unread" ? "default" : "outline"}
                onClick={() => setFilterType("unread")}
                size="sm"
                className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
              >
                Unread
              </Button>
              <Button
                variant={filterType === "read" ? "default" : "outline"}
                onClick={() => setFilterType("read")}
                size="sm"
                className="text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
              >
                Read
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredNotifications.length === 0 ? (
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardContent className="p-8 sm:p-10 md:p-12 text-center">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-4 sm:mb-6">
                <Bell className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                {notifications.length === 0
                  ? "No notifications yet"
                  : "No notifications match your filter"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border border-border/50 backdrop-blur-sm transition-all hover:shadow-md ${notification.read ? "bg-card/30" : "bg-primary/10 border-primary/20"
                  }`}
              >
                <CardContent className="p-3 sm:p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground break-words">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge variant="outline" className="text-xs w-fit">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 break-words">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString('en-US')}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-destructive hover:text-destructive"
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
