"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import {
  User as UserIcon,
  Clock,
  TrendingUp,
  BookOpen,
  Users,
  Zap,
  ArrowRight,
  RefreshCw,
} from "lucide-react"

interface Activity {
  id?: string
  type: "user" | "registration" | "submission" | "hackathon" | "team_action"
  user?: string
  action: string
  timestamp: string
  details?: string
}

const ROLE_FILTERS = ["all", "admin", "organizer", "participant", "judge"]

const TYPE_ICONS: Record<string, any> = {
  user: UserIcon,
  registration: BookOpen,
  submission: TrendingUp,
  hackathon: Zap,
  team_action: Users,
}

const TYPE_COLORS: Record<string, string> = {
  user: "bg-white/5 border-white/10",
  registration: "bg-emerald-500/10 border-emerald-500/20",
  submission: "bg-indigo-500/10 border-indigo-500/20",
  hackathon: "bg-amber-500/10 border-amber-500/20",
  team_action: "bg-pink-500/10 border-pink-500/20",
}

const BADGE_COLORS: Record<string, string> = {
  user: "bg-white/10 text-white",
  registration: "bg-emerald-500/20 text-emerald-100",
  submission: "bg-indigo-500/20 text-indigo-100",
  hackathon: "bg-amber-500/20 text-amber-100",
  team_action: "bg-pink-500/20 text-pink-100",
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState("all")
  const [error, setError] = useState("")

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`/api/admin/activities?role=${selectedRole}&limit=100`)

      if (!response.ok) {
        throw new Error("Failed to fetch activities")
      }

      const data = await response.json()
      setActivities(data.activities || [])
    } catch (err) {
      setError("Failed to load activities")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [selectedRole])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US')
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      organizer: "bg-blue-100 text-blue-800",
      participant: "bg-green-100 text-green-800",
      judge: "bg-purple-100 text-purple-800",
    }
    return colors[role] || "bg-white/10 text-white"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Role Activities</h1>
          <p className="text-muted-foreground mt-1">Monitor user activities across the platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter((a) => a.type === "registration").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hackathon signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter((a) => a.type === "submission").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Project submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter((a) => a.type === "team_action").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Team formations</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Filters</CardTitle>
              <CardDescription>Filter activities by user role</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActivities}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {ROLE_FILTERS.map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                onClick={() => setSelectedRole(role)}
                className="capitalize"
              >
                {role}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Showing {activities.length} activities</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-100 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading activities...</div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No activities found
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, idx) => {
                const IconComponent = TYPE_ICONS[activity.type] || UserIcon
                const typeColor = TYPE_COLORS[activity.type] || "bg-gray-50 border-gray-200"
                const badgeColor = BADGE_COLORS[activity.type] || "bg-gray-100 text-gray-800"

                return (
                  <div key={idx} className={`border rounded-lg p-4 ${typeColor} transition-colors hover:shadow-sm`}>
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="mt-1">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={badgeColor}>{activity.type.replace("_", " ")}</Badge>

                          {activity.user && (
                            <>
                              <span className="font-medium text-sm">{activity.user}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            </>
                          )}

                          <span className="text-sm text-muted-foreground">{activity.action}</span>
                        </div>

                        {activity.details && (
                          <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
