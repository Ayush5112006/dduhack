"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar-new"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, Trophy, FileText, DollarSign, Search, Bell, MoreVertical } from "lucide-react"
import { useToast } from "@/components/toast-provider"
import Link from "next/link"

type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  registrations: number
  submissions: number
}

type AdminHackathon = {
  id: string
  title: string
  organizer: string
  organizerId: string
  status: string
  category: string
  startDate: string
  endDate: string
  prizeAmount: number
  registrations: number
  submissions: number
  createdAt: string
}

type AnalyticsData = {
  totalUsers: number
  totalHackathons: number
  totalSubmissions: number
  totalPrizePool: number
  userGrowth: number
  hackathonGrowth: number
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [hackathons, setHackathons] = useState<AdminHackathon[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingHackathons, setLoadingHackathons] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { addToast } = useToast()

  useEffect(() => {
    fetchUsers()
    fetchHackathons()
    fetchAnalytics()
  }, [])

  async function fetchUsers() {
    setLoadingUsers(true)
    try {
      const res = await fetch("/api/admin/users/all")
      const data = await res.json()

      if (!res.ok) {
        addToast("error", data.error || "Failed to load users")
        return
      }

      setUsers(data.users || [])
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to load users")
    } finally {
      setLoadingUsers(false)
    }
  }

  async function fetchHackathons() {
    setLoadingHackathons(true)
    try {
      const res = await fetch("/api/admin/hackathons/all")
      const data = await res.json()

      if (!res.ok) {
        addToast("error", data.error || "Failed to load hackathons")
        return
      }

      setHackathons(data.hackathons || [])
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to load hackathons")
    } finally {
      setLoadingHackathons(false)
    }
  }

  async function fetchAnalytics() {
    try {
      const res = await fetch("/api/admin/analytics")
      const data = await res.json()
      if (res.ok) {
        setAnalytics(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function toggleUserStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "suspended" : "active"
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        addToast("error", data.error || "Failed to update status")
        return
      }

      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      addToast("success", `User ${newStatus === "active" ? "activated" : "suspended"}`)
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to update user status")
    }
  }

  async function updateHackathonStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/hackathons/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json()
        addToast("error", data.error || "Failed to update status")
        return
      }

      setHackathons(hackathons.map(h => h.id === id ? { ...h, status } : h))
      addToast("success", `Hackathon status updated to ${status}`)
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to update hackathon status")
    }
  }

  async function deleteHackathon(id: string) {
    if (!confirm("Delete this hackathon? This action cannot be undone.")) return

    try {
      const res = await fetch(`/api/admin/hackathons/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        addToast("error", data.error || "Failed to delete")
        return
      }

      setHackathons(hackathons.filter((h) => h.id !== id))
      addToast("success", "Hackathon deleted")
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to delete hackathon")
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || u.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.organizer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || h.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalSubmissions = users.reduce((sum, u) => sum + (u.submissions || 0), 0)
  const totalPrizePool = hackathons.reduce((sum, h) => sum + (h.prizeAmount || 0), 0)

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      trend: analytics?.userGrowth || 0,
      description: "Platform users"
    },
    {
      title: "Active Hackathons",
      value: hackathons.filter((h) => h.status === "live").length,
      icon: Trophy,
      trend: analytics?.hackathonGrowth || 0,
      description: "Currently running"
    },
    {
      title: "Total Submissions",
      value: totalSubmissions,
      icon: FileText,
      trend: 0,
      description: "All time"
    },
    {
      title: "Prize Pool",
      value: `$${(totalPrizePool / 1000).toFixed(1)}K`,
      icon: DollarSign,
      trend: 0,
      description: "Total prizes"
    },
  ]

  const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminSidebar />
      <main className="lg:ml-64 p-6 lg:p-8 space-y-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-400">Manage users, hackathons, and platform settings</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2 backdrop-blur-xl">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent text-sm text-white placeholder-slate-500 outline-none" />
            </div>
            <button className="p-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const colors = [
              { gradient: "from-cyan-500 to-blue-500", bg: "from-cyan-500/10 to-blue-500/10" },
              { gradient: "from-green-500 to-emerald-500", bg: "from-green-500/10 to-emerald-500/10" },
              { gradient: "from-purple-500 to-pink-500", bg: "from-purple-500/10 to-pink-500/10" },
              { gradient: "from-orange-500 to-red-500", bg: "from-orange-500/10 to-red-500/10" },
            ]
            const color = colors[stats.indexOf(stat)]
            return (
              <div key={stat.title} className={`relative group overflow-hidden rounded-xl bg-gradient-to-br ${color.bg} border border-slate-700/50 backdrop-blur-xl p-6 hover:border-slate-600/80 transition-all duration-300`}>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:via-cyan-500/5 group-hover:to-purple-500/5 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${color.gradient} shadow-lg shadow-current/20`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    {stat.trend !== 0 && (
                      <Badge variant="outline" className="gap-1 bg-slate-900/50 border-slate-700/50 text-cyan-400">
                        <span className="inline-block h-3 w-3 rounded-full bg-cyan-500/40" />
                        {stat.trend > 0 ? '+' : ''}{stat.trend}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{typeof stat.value === 'number' ? stat.value : stat.value}</p>
                  <p className="text-xs text-slate-500 mt-2">{stat.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Platform Management */}
        <Card className="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-700/50">
            <CardTitle className="text-white">Platform Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="bg-slate-900/50 border-b border-slate-700/50 rounded-none w-full justify-start">
                <TabsTrigger value="users" className="text-slate-400 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">Users</TabsTrigger>
                <TabsTrigger value="hackathons" className="text-slate-400 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500 rounded-none">Hackathons</TabsTrigger>
              </TabsList>

              <div className="mt-6 flex gap-3 px-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="rounded-md border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 hover:border-slate-600/80 transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="live">Live</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>

              <TabsContent value="users" className="mt-6 px-0">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                    <p className="text-slate-400">Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700/50 hover:bg-transparent">
                          <TableHead className="text-slate-400">Name</TableHead>
                          <TableHead className="text-slate-400">Email</TableHead>
                          <TableHead className="text-slate-400">Role</TableHead>
                          <TableHead className="text-slate-400">Status</TableHead>
                          <TableHead className="text-slate-400">Joined</TableHead>
                          <TableHead className="text-slate-400">Activity</TableHead>
                          <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                            <TableCell className="font-medium text-white">{user.name}</TableCell>
                            <TableCell className="text-slate-300">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize bg-slate-900/50 border-slate-700/50 text-slate-300">
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={user.status === "active" ? "default" : "secondary"}
                                className={user.status === "active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">{formatDate(user.createdAt)}</TableCell>
                            <TableCell className="text-slate-300">
                              {user.registrations} regs • {user.submissions} subs
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-slate-800/50 text-slate-400">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700/50">
                                  <DropdownMenuItem
                                    onClick={() => toggleUserStatus(user.id, user.status)}
                                    className="gap-2"
                                  >
                                    {user.status === "active" ? (
                                      <>
                                        <span className="h-4 w-4">⛔</span>
                                        Suspend User
                                      </>
                                    ) : (
                                      <>
                                        <span className="h-4 w-4">✔️</span>
                                        Activate User
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hackathons" className="mt-6 px-0">
                {loadingHackathons ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                    <p className="text-slate-400">Loading hackathons...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700/50 hover:bg-transparent">
                          <TableHead className="text-slate-400">Title</TableHead>
                          <TableHead className="text-slate-400">Organizer</TableHead>
                          <TableHead className="text-slate-400">Status</TableHead>
                          <TableHead className="text-slate-400">Category</TableHead>
                          <TableHead className="text-slate-400">Prize</TableHead>
                          <TableHead className="text-slate-400">Participants</TableHead>
                          <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHackathons.map((hackathon) => (
                          <TableRow key={hackathon.id} className="border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                            <TableCell className="font-medium text-white">{hackathon.title}</TableCell>
                            <TableCell className="text-slate-300">{hackathon.organizer}</TableCell>
                            <TableCell>
                              <Badge
                                variant={hackathon.status === "live" ? "default" : "secondary"}
                                className={hackathon.status === "live" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-900/50 border-slate-700/50 text-slate-300"}
                              >
                                {hackathon.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-slate-900/50 border-slate-700/50 text-slate-300">{hackathon.category}</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-white">${hackathon.prizeAmount.toLocaleString('en-US')}</TableCell>
                            <TableCell className="text-slate-300">
                              {hackathon.registrations} regs • {hackathon.submissions} subs
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-slate-800/50 text-slate-400">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700/50">
                                  <DropdownMenuItem asChild className="gap-2">
                                    <Link href={`/hackathons/${hackathon.id}`}>
                                      👁️ View
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateHackathonStatus(hackathon.id, "live")}
                                    className="gap-2"
                                    disabled={hackathon.status === "live"}
                                  >
                                    <span className="h-4 w-4">✔️</span>
                                    Mark as Live
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateHackathonStatus(hackathon.id, "past")}
                                    className="gap-2"
                                    disabled={hackathon.status === "past"}
                                  >
                                    <span className="h-4 w-4">📅</span>
                                    Mark as Past
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteHackathon(hackathon.id)}
                                    className="gap-2 text-destructive"
                                  >
                                    <span className="h-4 w-4">🗑️</span>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
