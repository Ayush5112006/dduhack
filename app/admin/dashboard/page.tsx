"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Trophy,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  TrendingUp,
  Activity,
  Ban,
  Eye,
} from "lucide-react"
import type { User, Hackathon } from "@/lib/data"

function LoadingComponent() {
  return <div>Loading...</div>
}

const stats = [
  { title: "Total Users", value: "12,847", icon: Users, change: "+542 this week" },
  { title: "Active Hackathons", value: "156", icon: Trophy, change: "23 pending approval" },
  { title: "Pending Approvals", value: "47", icon: FileText, change: "12 urgent" },
  { title: "Reports", value: "8", icon: AlertTriangle, change: "3 unresolved" },
]

const pendingApprovals = [
  {
    id: "1",
    type: "Hackathon",
    name: "Blockchain Innovation Summit 2026",
    submittedBy: "CryptoLabs Inc.",
    submittedAt: "Jan 20, 2026",
    status: "Pending",
  },
  {
    id: "2",
    type: "Organizer",
    name: "TechStart Foundation",
    submittedBy: "contact@techstart.org",
    submittedAt: "Jan 19, 2026",
    status: "Pending",
  },
  {
    id: "3",
    type: "Hackathon",
    name: "EduTech Challenge",
    submittedBy: "LearnCode Academy",
    submittedAt: "Jan 18, 2026",
    status: "Under Review",
  },
  {
    id: "4",
    type: "Organizer",
    name: "DataScience Hub",
    submittedBy: "admin@dshub.com",
    submittedAt: "Jan 17, 2026",
    status: "Pending",
  },
]

const users: Array<{
  id: string
  name: string
  email: string
  role: string
  status: string
}> = []

const reports: Array<{
  id: string
  type: string
  reporter: string
  description: string
  date: string
  status: string
}> = []

const analyticsData: Array<{
  month: string
  users: number
  submissions: number
  hackathons: number
}> = []

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [approvals, setApprovals] = useState(pendingApprovals)
  const [usersList, setUsersList] = useState<User[]>([])
  const [reportsList, setReportsList] = useState<typeof reports>(reports)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, hackathonsRes] = await Promise.all([
          fetch("/api/admin/users", { credentials: "include" }),
          fetch("/api/hackathons", { credentials: "include" }),
        ])
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsersList(data.users || [])
        }
        if (hackathonsRes.ok) {
          const data = await hackathonsRes.json()
          setHackathons(data.hackathons || [])
        }
      } catch (error) {
        console.error("Failed to load admin data", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleApproveItem = async (id: string) => {
    const item = approvals.find(a => a.id === id)
    if (!item || !confirm("Approve this item?")) return
    
    try {
      if (item.type === "Organizer") {
        const user = usersList.find(u => u.email === item.submittedBy)
        if (!user) return alert("User not found")
        
        const response = await fetch(`/api/admin/organizers/${user.id}/approve`, {
          method: "POST",
          credentials: "include",
        })
        if (response.ok) {
          setApprovals(approvals.map(a => a.id === id ? { ...a, status: "Approved" } : a))
          setUsersList(usersList.map(u => u.id === user.id ? { ...u, role: "organizer", status: "active" } : u))
          alert("Organizer approved!")
        } else {
          alert("Failed to approve")
        }
      } else {
        setApprovals(approvals.map(a => a.id === id ? { ...a, status: "Approved" } : a))
        alert("Hackathon approved (API pending)")
      }
    } catch (error) {
      console.error("Approve error", error)
      alert("Failed to approve")
    }
  }

  const handleRejectItem = (id: string) => {
    if (confirm("Reject this item?")) {
      setApprovals(approvals.filter(item => item.id !== id))
      alert("Item rejected")
    }
  }

  const handleViewItem = (id: string) => {
    alert(`Viewing item ${id}`)
  }

  const handleSuspendUser = async (id: string) => {
    if (!confirm("Suspend this user?")) return
    try {
      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "suspended" }),
      })
      if (response.ok) {
        setUsersList(usersList.map(u => u.id === id ? { ...u, status: "suspended" } : u))
        alert("User suspended")
      } else {
        alert("Failed to suspend")
      }
    } catch (error) {
      console.error("Suspend error", error)
      alert("Failed to suspend user")
    }
  }

  const handleReactivateUser = async (id: string) => {
    if (!confirm("Reactivate this user?")) return
    try {
      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "active" }),
      })
      if (response.ok) {
        setUsersList(usersList.map(u => u.id === id ? { ...u, status: "active" } : u))
        alert("User reactivated")
      } else {
        alert("Failed to reactivate")
      }
    } catch (error) {
      console.error("Reactivate error", error)
      alert("Failed to reactivate user")
    }
  }

  const handleViewProfile = (id: string) => {
    alert(`Viewing profile for user ${id}`)
  }

  const handleViewActivity = (id: string) => {
    alert(`Viewing activity for user ${id}`)
  }

  const handleResolveReport = (id: string) => {
    if (confirm("Mark this report as resolved?")) {
      setReportsList(reportsList.map(report => 
        report.id === id ? { ...report, status: "Resolved" } : report
      ))
      alert("Report resolved")
    }
  }

  const handleDismissReport = (id: string) => {
    if (confirm("Dismiss this report?")) {
      setReportsList(reportsList.filter(report => report.id !== id))
      alert("Report dismissed")
    }
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="admin" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Platform overview and management
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                </div>
                <h3 className="mt-4 text-sm font-medium text-foreground">{stat.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Tabs defaultValue="approvals" className="w-full">
            <TabsList className="mb-6 bg-card">
              <TabsTrigger value="approvals">Approvals Queue</TabsTrigger>
              <TabsTrigger value="users">Users Management</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="approvals">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Pending Approvals</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Approve All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvals.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant="outline">{item.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.submittedBy}</TableCell>
                          <TableCell className="text-muted-foreground">{item.submittedAt}</TableCell>
                          <TableCell>
                            <Badge
                              variant={item.status === "Under Review" ? "secondary" : "outline"}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-green-500 hover:text-green-600" 
                                aria-label="Approve"
                                onClick={() => handleApproveItem(item.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive/80" 
                                aria-label="Reject"
                                onClick={() => handleRejectItem(item.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                aria-label="View details"
                                onClick={() => handleViewItem(item.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Users Management</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-secondary pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Hackathons</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersList.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : user.status === "suspended"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={user.status === "active" ? "bg-green-500/10 text-green-500" : ""}
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">-</TableCell>
                          <TableCell className="text-muted-foreground">-</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleViewProfile(user.id)}
                                >
                                  <Eye className="h-4 w-4" /> View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleViewActivity(user.id)}
                                >
                                  <Activity className="h-4 w-4" /> Activity Log
                                </DropdownMenuItem>
                                {user.status === "active" && (
                                  <DropdownMenuItem 
                                    className="gap-2 text-destructive"
                                    onClick={() => handleSuspendUser(user.id)}
                                  >
                                    <Ban className="h-4 w-4" /> Suspend User
                                  </DropdownMenuItem>
                                )}
                                {user.status === "suspended" && (
                                  <DropdownMenuItem 
                                    className="gap-2 text-green-500"
                                    onClick={() => handleReactivateUser(user.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" /> Reactivate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Reports & Moderation</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Reported By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <Badge
                              variant={
                                report.type === "Spam"
                                  ? "destructive"
                                  : report.type === "Plagiarism"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {report.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{report.description}</TableCell>
                          <TableCell className="text-muted-foreground">{report.reporter}</TableCell>
                          <TableCell className="text-muted-foreground">{report.date}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.status === "Open"
                                  ? "destructive"
                                  : report.status === "Resolved"
                                  ? "default"
                                  : "secondary"
                              }
                              className={report.status === "Resolved" ? "bg-green-500/10 text-green-500" : ""}
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" aria-label="View details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {report.status !== "Resolved" && (
                                <Button variant="ghost" size="icon" className="text-green-500" aria-label="Resolve">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Platform Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.map((data, index) => (
                        <div key={data.month} className="flex items-center gap-4">
                          <span className="w-10 text-sm text-muted-foreground">{data.month}</span>
                          <div className="flex-1">
                            <div className="mb-1 flex justify-between text-sm">
                              <span className="text-muted-foreground">Users</span>
                              <span className="font-medium text-foreground">{data.users.toLocaleString()}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${(data.users / 15000) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-border bg-secondary/50 p-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-muted-foreground">User Growth</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">+23%</p>
                        <p className="text-xs text-muted-foreground">vs last month</p>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/50 p-4">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-5 w-5 text-primary" />
                          <span className="text-sm text-muted-foreground">Active Hackathons</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">156</p>
                        <p className="text-xs text-muted-foreground">across 50+ countries</p>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/50 p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <span className="text-sm text-muted-foreground">Total Submissions</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">45,230</p>
                        <p className="text-xs text-muted-foreground">all time</p>
                      </div>
                      <div className="rounded-lg border border-border bg-secondary/50 p-4">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-orange-500" />
                          <span className="text-sm text-muted-foreground">Avg. Session</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">12m 34s</p>
                        <p className="text-xs text-muted-foreground">per user</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export function Loading() {
  return null
}
