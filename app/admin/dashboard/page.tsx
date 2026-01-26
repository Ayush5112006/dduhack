"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Users, Trophy, FileText, DollarSign } from "lucide-react"
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
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="admin" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage users, hackathons, and platform settings</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  {stat.trend !== 0 && (
                    <Badge variant="outline" className="gap-1">
                      <span className="inline-block h-3 w-3 rounded-full bg-muted-foreground/40" />
                      {stat.trend > 0 ? '+' : ''}{stat.trend}%
                    </Badge>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{typeof stat.value === 'number' ? stat.value : stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Platform Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
              </TabsList>

              <div className="mt-6 flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
                  <Input
                    placeholder="Search..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
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

              <TabsContent value="users" className="mt-6">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={user.status === "active" ? "default" : "secondary"}
                                className={user.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {user.registrations} regs • {user.submissions} subs
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <span className="h-4 w-4">⋯</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
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

              <TabsContent value="hackathons" className="mt-6">
                {loadingHackathons ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    <p className="text-muted-foreground">Loading hackathons...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Organizer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Prize</TableHead>
                          <TableHead>Participants</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHackathons.map((hackathon) => (
                          <TableRow key={hackathon.id}>
                            <TableCell className="font-medium text-foreground">{hackathon.title}</TableCell>
                            <TableCell className="text-muted-foreground">{hackathon.organizer}</TableCell>
                            <TableCell>
                              <Badge
                                variant={hackathon.status === "live" ? "default" : "secondary"}
                                className={hackathon.status === "live" ? "bg-emerald-500/10 text-emerald-600" : ""}
                              >
                                {hackathon.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{hackathon.category}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">${hackathon.prizeAmount.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {hackathon.registrations} regs • {hackathon.submissions} subs
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <span className="h-4 w-4">⋯</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild className="gap-2">
                                    <Link href={`/hackathons/${hackathon.id}`}>
                                      <span className="h-4 w-4">👁️</span>
                                      View
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
