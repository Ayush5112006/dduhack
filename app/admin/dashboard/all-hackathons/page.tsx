"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Trophy,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface Hackathon {
  id: string
  title: string
  description: string
  category: string
  status: "upcoming" | "live" | "past" | "closed"
  startDate: string
  endDate: string
  prizeAmount: number
  organizer: string
  ownerId: string
  registrations: number
  submissions: number
  createdAt: string
}

interface Stats {
  total: number
  active: number
  upcoming: number
  past: number
  totalRegistrations: number
  totalSubmissions: number
  averageRegistrationsPerHackathon: number
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  live: "bg-green-100 text-green-800",
  past: "bg-gray-100 text-gray-800",
  closed: "bg-gray-100 text-gray-800",
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  upcoming: "bg-blue-50 border-blue-200",
  live: "bg-green-50 border-green-200",
  past: "bg-gray-50 border-gray-200",
  closed: "bg-gray-50 border-gray-200",
}

const STATUS_ICONS: Record<string, any> = {
  upcoming: Clock,
  live: CheckCircle,
  past: AlertCircle,
  closed: AlertCircle,
}

const CATEGORY_COLORS: Record<string, string> = {
  "web": "bg-purple-100 text-purple-800",
  "mobile": "bg-blue-100 text-blue-800",
  "ai": "bg-orange-100 text-orange-800",
  "blockchain": "bg-yellow-100 text-yellow-800",
  "iot": "bg-green-100 text-green-800",
  "general": "bg-gray-100 text-gray-800",
}

export default function AdminHackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const computeStats = (list: Hackathon[]): Stats => {
    const total = list.length
    const active = list.filter((h) => h.status === "live").length
    const upcoming = list.filter((h) => h.status === "upcoming").length
    const past = list.filter((h) => h.status === "past" || h.status === "closed").length
    const totalRegistrations = list.reduce((sum, h) => sum + (h.registrations || 0), 0)
    const totalSubmissions = list.reduce((sum, h) => sum + (h.submissions || 0), 0)
    const averageRegistrationsPerHackathon = total > 0 ? Math.round(totalRegistrations / total) : 0

    return {
      total,
      active,
      upcoming,
      past,
      totalRegistrations,
      totalSubmissions,
      averageRegistrationsPerHackathon,
    }
  }

  const fetchHackathons = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await fetch(`/api/admin/hackathons/all`)

      if (!response.ok) {
        throw new Error("Failed to fetch hackathons")
      }

      const data = await response.json()
      const allHackathons: Hackathon[] = data.hackathons || []
      const filtered = statusFilter === "all" ? allHackathons : allHackathons.filter((h) => h.status === statusFilter)
      setHackathons(filtered)
      setStats(computeStats(filtered))
    } catch (err) {
      setError("Failed to load hackathons")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHackathons()
  }, [statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Hackathons</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all organized hackathons</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Hackathons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Live</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ~{stats.averageRegistrationsPerHackathon}/event
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hackathon Filters</CardTitle>
              <CardDescription>Filter hackathons by status</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHackathons}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {["all", "upcoming", "live", "past", "closed"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hackathons Grid */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Organized Hackathons</CardTitle>
            <CardDescription>Showing {hackathons.length} hackathons</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading hackathons...</div>
              </div>
            ) : hackathons.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <div className="text-muted-foreground">No hackathons found</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create or organize a hackathon to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {hackathons.map((hackathon) => {
                  const StatusIcon = STATUS_ICONS[hackathon.status]
                  const statusColor = STATUS_COLORS[hackathon.status]
                  const bgColor = STATUS_BADGE_COLORS[hackathon.status]
                  const categoryColor = CATEGORY_COLORS[hackathon.category.toLowerCase()] || CATEGORY_COLORS["general"]

                  return (
                    <div key={hackathon.id} className={`border rounded-lg p-5 ${bgColor} transition-colors hover:shadow-sm`}>
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{hackathon.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{hackathon.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-5 w-5 text-muted-foreground" />
                            <Badge className={statusColor}>{hackathon.status}</Badge>
                            <Badge className={categoryColor}>{hackathon.category}</Badge>
                          </div>
                        </div>

                        {/* Organizer Info */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Organizer:</span>
                          <span>{hackathon.organizer}</span>
                        </div>

                        {/* Dates & Prize */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                            </span>
                          </div>

                          {hackathon.prizeAmount > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Trophy className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">${hackathon.prizeAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Registrations</div>
                              <div className="font-semibold">{hackathon.registrations ?? 0}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs text-muted-foreground">Submissions</div>
                              <div className="font-semibold">{hackathon.submissions ?? 0}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-xs text-muted-foreground">Owner</div>
                              <div className="font-semibold">{hackathon.ownerId}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <div>
                              <div className="text-xs text-muted-foreground">Status</div>
                              <div className="font-semibold">{hackathon.status}</div>
                            </div>
                          </div>
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

      {/* Summary Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Avg Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRegistrationsPerHackathon}</div>
              <p className="text-xs text-muted-foreground mt-1">Per hackathon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRegistrations > 0
                  ? Math.round((stats.totalSubmissions / stats.totalRegistrations) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">Submission rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Approval Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground mt-1">Total submissions</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
