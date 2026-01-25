"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  RefreshCw,
  Trophy,
} from "lucide-react"

interface Activity {
  type: "registration" | "submission" | "team_action"
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
  action: string
  details?: string
  timestamp: string
  hackathonId?: string
}

const TYPE_ICONS: Record<string, any> = {
  registration: BookOpen,
  submission: TrendingUp,
  team_action: Users,
}

const TYPE_COLORS: Record<string, string> = {
  registration: "bg-green-50 border-green-200",
  submission: "bg-purple-50 border-purple-200",
  team_action: "bg-pink-50 border-pink-200",
}

const BADGE_COLORS: Record<string, string> = {
  registration: "bg-green-100 text-green-800",
  submission: "bg-purple-100 text-purple-800",
  team_action: "bg-pink-100 text-pink-800",
}

export default function OrganizerActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hackathonCount, setHackathonCount] = useState(0)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`/api/organizer/activities`)

      if (!response.ok) {
        throw new Error("Failed to fetch activities")
      }

      const data = await response.json()
      setActivities(data.activities || [])
      setHackathonCount(data.hackathons || 0)
    } catch (err) {
      setError("Failed to load activities")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

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

    return date.toLocaleDateString()
  }

  const registrationCount = activities.filter((a) => a.type === "registration").length
  const submissionCount = activities.filter((a) => a.type === "submission").length
  const teamActionCount = activities.filter((a) => a.type === "team_action").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hackathon Activities</h1>
          <p className="text-muted-foreground mt-1">Monitor registrations, submissions, and team formations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Hackathons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hackathonCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Organizer events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Participant signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Project submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamActionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Team formations</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>All activities from your hackathons</CardDescription>
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
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Showing {activities.length} activities from all your hackathons</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading activities...</div>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <div className="text-muted-foreground">No activities yet</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Activities will appear here once participants register or submit
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, idx) => {
                const IconComponent = TYPE_ICONS[activity.type] || BookOpen
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
                              <span className="font-medium text-sm">{activity.user.name}</span>
                              <span className="text-xs text-muted-foreground">({activity.user.email})</span>
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Activity Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {registrationCount > submissionCount && registrationCount > teamActionCount
                ? "Registrations"
                : submissionCount > teamActionCount
                  ? "Submissions"
                  : "Team Formations"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg per Activity Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.length > 0 ? Math.round(activities.length / 3) : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all hackathons</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
