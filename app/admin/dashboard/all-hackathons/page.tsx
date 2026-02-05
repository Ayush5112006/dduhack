"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminSidebar } from "@/components/admin/admin-sidebar-new"
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
  ArrowRight,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminSidebar />

      {/* Main Content */}
      <div className="lg:ml-64">
        <main className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              All Hackathons
            </h1>
            <p className="text-slate-400">Manage and monitor all organized hackathons across the platform</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Total Hackathons", value: stats.total, icon: Trophy, color: "from-cyan-500 to-blue-500", bg: "from-cyan-500/10 to-blue-500/10" },
                { title: "Live", value: stats.active, icon: CheckCircle, color: "from-green-500 to-emerald-500", bg: "from-green-500/10 to-emerald-500/10" },
                { title: "Upcoming", value: stats.upcoming, icon: Clock, color: "from-purple-500 to-pink-500", bg: "from-purple-500/10 to-pink-500/10" },
                { title: "Total Registrations", value: stats.totalRegistrations, icon: Users, color: "from-orange-500 to-red-500", bg: "from-orange-500/10 to-red-500/10" },
              ].map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <div key={idx} className={`relative group overflow-hidden rounded-xl bg-gradient-to-br ${stat.bg} border border-slate-700/50 backdrop-blur-xl p-6 hover:border-slate-600/80 transition-all duration-300`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:via-cyan-500/5 group-hover:to-purple-500/5 transition-all" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg shadow-current/20`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                )
              })}
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

          {/* Hackathons Table */}
          <Card className="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Platform Hackathons</CardTitle>
                  <CardDescription className="text-slate-400">Manage all hackathons</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchHackathons}
                  disabled={loading}
                  className="gap-2 bg-slate-900/50 border-cyan-500/30 text-cyan-400 hover:bg-slate-800/50 hover:border-cyan-500/50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Status Filters */}
              <div className="border-b border-slate-700/50 px-6 py-4">
                <div className="flex gap-2 flex-wrap">
                  {["all", "upcoming", "live", "past", "closed"].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      onClick={() => setStatusFilter(status)}
                      className={`capitalize transition-all ${statusFilter === status
                          ? "bg-gradient-to-r from-cyan-500 to-purple-600 border-transparent text-white"
                          : "bg-slate-900/50 border-slate-700/50 text-slate-300 hover:border-cyan-500/30 hover:text-cyan-400"
                        }`}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 px-6 py-3">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-slate-400">Loading hackathons...</div>
                </div>
              ) : hackathons.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 text-slate-500 mx-auto mb-2 opacity-50" />
                    <div className="text-slate-400">No hackathons found</div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700/50 hover:bg-transparent">
                        <TableHead className="text-slate-400">Title</TableHead>
                        <TableHead className="text-slate-400">Organizer</TableHead>
                        <TableHead className="text-slate-400">Prize</TableHead>
                        <TableHead className="text-slate-400">Registrations</TableHead>
                        <TableHead className="text-slate-400">Submissions</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hackathons.map((hackathon) => {
                        const statusColor = STATUS_COLORS[hackathon.status]
                        return (
                          <TableRow key={hackathon.id} className="border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                            <TableCell className="font-medium text-white">
                              <div>
                                <p className="font-semibold">{hackathon.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{hackathon.category}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">{hackathon.organizer}</TableCell>
                            <TableCell className="text-slate-300">${hackathon.prizeAmount.toLocaleString('en-US')}</TableCell>
                            <TableCell className="text-slate-300">{hackathon.registrations ?? 0}</TableCell>
                            <TableCell className="text-slate-300">{hackathon.submissions ?? 0}</TableCell>
                            <TableCell>
                              <Badge className={statusColor}>{hackathon.status}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  )
}
