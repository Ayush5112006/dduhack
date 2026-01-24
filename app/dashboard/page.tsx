"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
import { Trophy, FileText, Award, Bell, Calendar, ArrowRight, ExternalLink, Trash2, Edit, Search } from "lucide-react"
import { useToast } from "@/components/toast-provider"

export default function ParticipantDashboard() {
  const [myHackathons, setMyHackathons] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { addToast } = useToast()

  // Fetch dashboard data from API
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/auth/login'
            return
          }
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        
        // Set user data
        setUserData(data.user)
        
        // Set stats
        setStats([
          { title: "Active Hackathons", value: String(data.stats.activeHackathons), change: "Currently registered", icon: Trophy },
          { title: "Submissions", value: String(data.stats.totalSubmissions), change: "Total submitted", icon: FileText },
          { title: "Wins", value: String(data.stats.wins), change: "Certificates earned", icon: Award },
          { title: "Notifications", value: String(data.notifications.length), change: `${data.stats.unreadNotifications} unread`, icon: Bell },
        ])
        
        setMyHackathons(data.myHackathons || [])
        setNotifications(data.notifications || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        addToast('error', 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [addToast])

  const filteredHackathons = myHackathons.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteHackathon = (id: string) => {
    if (confirm("Are you sure you want to delete this hackathon from your list?")) {
      setMyHackathons(myHackathons.filter(h => h.id !== id))
      addToast("success", "Hackathon removed successfully!")
    }
  }

  const handleEditHackathon = (id: string) => {
    const hackathon = myHackathons.find(h => h.id === id)
    if (!hackathon) return
    
    const newRole = prompt("Update your role:", hackathon.role)
    if (newRole) {
      setMyHackathons(myHackathons.map(h => 
        h.id === id ? { ...h, role: newRole } : h
      ))
      addToast("success", "Role updated successfully!")
    }
  }

  const handleSubmitProject = (id: string) => {
    const hackathon = myHackathons.find(h => h.id === id)
    if (!hackathon) return
    
    if (hackathon.submission === "Submitted") {
      addToast("info", "You have already submitted for this hackathon!")
      return
    }

    const projectUrl = prompt("Enter your project submission URL (GitHub link):")
    if (projectUrl) {
      if (!projectUrl.includes("github.com")) {
        addToast("error", "Please enter a valid GitHub URL!")
        return
      }
      setMyHackathons(myHackathons.map(h => 
        h.id === id ? { ...h, submission: "Submitted" } : h
      ))
      addToast("success", "Project submitted successfully!")
    }
  }

  const handleClearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
    addToast("info", "Notification removed")
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, unread: false } : n
    ))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="px-4 py-6 lg:ml-64 lg:p-8 max-w-6xl mx-auto">
        {/* User Profile Card */}
        {userData && (
          <Card className="mb-8 border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                  {userData.profile?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userData.profile.avatar} alt={userData.name || 'avatar'} className="h-full w-full object-cover" />
                  ) : (
                    (userData.name || userData.email).charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{userData.name || 'User'}</h2>
                  <p className="text-muted-foreground">{userData.email}</p>
                  {userData.profile && (
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {userData.profile.institution && <span>🎓 {userData.profile.institution}</span>}
                      {userData.profile.location && <span>📍 {userData.profile.location}</span>}
                    </div>
                  )}
                </div>
                <Badge variant={userData.status === 'active' ? 'default' : 'secondary'}>
                  {userData.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back{userData?.name ? `, ${userData.name}` : ''}!</h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s an overview of your hackathon activity
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

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Hackathons</CardTitle>
                <Link href="/dashboard/hackathons">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search hackathons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-secondary pl-9"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hackathon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Submission</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHackathons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                          No hackathons found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHackathons.map((hackathon) => (
                        <TableRow key={hackathon.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{hackathon.name}</p>
                              <p className="text-xs text-muted-foreground">{hackathon.mode || 'Individual'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                hackathon.status === "live"
                                  ? "default"
                                  : hackathon.status === "past"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {hackathon.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(hackathon.deadline).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                hackathon.submission
                                  ? "default"
                                  : "destructive"
                              }
                              className={hackathon.submission ? "bg-green-500/10 text-green-500" : ""}
                            >
                              {hackathon.submission ? hackathon.submission.status : "Not submitted"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Link href={`/hackathons/${hackathon.id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  title="View Details"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                              {!hackathon.submission && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleSubmitProject(hackathon.id)}
                                  title="Submit Project"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Notifications {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
                </CardTitle>
                <Link href="/dashboard/notifications">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-lg border border-border p-4 ${
                          !notification.read ? "bg-primary/5" : "bg-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-foreground">
                            {notification.title}
                          </h4>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                                title="Mark as read"
                              >
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleClearNotification(notification.id)}
                              title="Clear"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-border bg-card">
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myHackathons
                    .filter((h) => h.status !== "Completed")
                    .map((hackathon) => (
                      <div key={hackathon.id} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{hackathon.name}</p>
                          <p className="text-xs text-muted-foreground">{hackathon.deadline}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
