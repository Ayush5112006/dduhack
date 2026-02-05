"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trophy, FileText, Award, Bell, Calendar, ArrowRight, ExternalLink, Trash2, Edit, Search, ChevronDown } from "lucide-react"
import { useToast } from "@/components/toast-provider"

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
)

export default function ParticipantDashboard() {
  const router = useRouter()
  const [myHackathons, setMyHackathons] = useState<any[]>([])
  const [allHackathons, setAllHackathons] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingHackathons, setLoadingHackathons] = useState(false)
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

  // Fetch all available hackathons
  const fetchAllHackathons = useCallback(async () => {
    if (allHackathons.length > 0) return // Don't refetch if already loaded

    setLoadingHackathons(true)
    try {
      const response = await fetch('/api/public/hackathons')
      if (!response.ok) throw new Error('Failed to fetch hackathons')

      const data = await response.json()
      setAllHackathons(data.hackathons || [])
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      addToast('error', 'Failed to load hackathons')
    } finally {
      setLoadingHackathons(false)
    }
  }, [allHackathons.length, addToast])

  // Handle hackathon selection
  const handleSelectHackathon = useCallback((hackathonId: string) => {
    router.push(`/hackathons/${hackathonId}`)
  }, [router])

  const filteredHackathons = useMemo(() =>
    myHackathons.filter((h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.role.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [myHackathons, searchQuery]
  )

  const handleDeleteHackathon = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this hackathon from your list?")) {
      setMyHackathons(myHackathons.filter(h => h.id !== id))
      addToast("success", "Hackathon removed successfully!")
    }
  }, [addToast, myHackathons])

  const handleEditHackathon = useCallback((id: string) => {
    const hackathon = myHackathons.find(h => h.id === id)
    if (!hackathon) return

    const newRole = prompt("Update your role:", hackathon.role)
    if (newRole) {
      setMyHackathons(myHackathons.map(h =>
        h.id === id ? { ...h, role: newRole } : h
      ))
      addToast("success", "Role updated successfully!")
    }
  }, [addToast, myHackathons])

  const handleSubmitProject = useCallback((id: string) => {
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
  }, [addToast, myHackathons])

  const handleClearNotification = useCallback((id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
    addToast("info", "Notification removed")
  }, [addToast, notifications])

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, unread: false } : n
    ))
  }, [notifications])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-5xl px-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-7 w-16" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <Skeleton key={idx} className="h-28" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-96 lg:col-span-2" />
            <div className="space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-3 py-4 sm:px-4 sm:py-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* User Profile Card */}
        {userData && (
          <Card className="mb-6 sm:mb-8 border-0 bg-gradient-to-r from-primary/10 to-transparent shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xl sm:text-2xl font-bold text-white overflow-hidden flex-shrink-0 shadow-lg">
                  {userData.profile?.avatar ? (
                    <Image
                      src={userData.profile.avatar}
                      alt={userData.name || "avatar"}
                      fill
                      sizes="64px"
                      className="object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    (userData.name || userData.email).charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-xl font-bold text-foreground truncate">{userData.name || 'User'}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{userData.email}</p>
                  {userData.profile && (
                    <div className="mt-1.5 flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {userData.profile.institution && <span>🎓 {userData.profile.institution}</span>}
                      {userData.profile.location && <span>📍 {userData.profile.location}</span>}
                    </div>
                  )}
                </div>
                <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {userData.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 sm:mb-8 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-secondary/50 to-background border border-border/50">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Welcome back{userData?.name ? `, ${userData.name}` : ''}! 👋</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ready to build something amazing today?
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Link href="/hackathons" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                  <Trophy className="h-5 w-5" />
                  Explore Hackathons
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 bg-gradient-to-br from-secondary/50 to-transparent hover:shadow-md transition-all">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold text-foreground text-right">{stat.value}</span>
                </div>
                <h3 className="mt-3 text-xs sm:text-sm font-semibold text-foreground line-clamp-1">{stat.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 w-full">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 pb-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">My Hackathons</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Manage your registrations</p>
                </div>
                <Link href="/dashboard/hackathons" className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto text-xs">
                    View all <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-secondary/50 pl-9 text-sm border-0"
                  />
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
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
                                <p className="font-medium text-foreground text-sm">{hackathon.name}</p>
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
                                className="text-xs"
                              >
                                {hackathon.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(hackathon.deadline).toLocaleDateString('en-US')}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  hackathon.submission
                                    ? "default"
                                    : "destructive"
                                }
                                className={`text-xs ${hackathon.submission ? "bg-green-500/10 text-green-500" : ""}`}
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
                                    className="h-8 w-8 p-0"
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
                                    className="h-8 w-8 p-0"
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
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {filteredHackathons.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">No hackathons found</p>
                  ) : (
                    filteredHackathons.map((hackathon) => (
                      <div key={hackathon.id} className="border-0 bg-gradient-to-br from-secondary/40 to-transparent rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm truncate">{hackathon.name}</p>
                            <p className="text-xs text-muted-foreground">{hackathon.mode || 'Individual'}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs flex-shrink-0 border-0 font-medium ${hackathon.status === "live"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : hackathon.status === "past"
                                ? "bg-slate-500/10 text-slate-600"
                                : "bg-blue-500/10 text-blue-600"
                              }`}
                          >
                            {hackathon.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-background/50 rounded p-2.5">
                            <p className="text-muted-foreground font-medium">Deadline</p>
                            <p className="font-semibold text-foreground mt-1">{new Date(hackathon.deadline).toLocaleDateString('en-US')}</p>
                          </div>
                          <div className="bg-background/50 rounded p-2.5">
                            <p className="text-muted-foreground font-medium">Submission</p>
                            <Badge
                              className={`text-xs w-fit mt-1 border-0 ${hackathon.submission
                                ? "bg-green-500/10 text-green-600"
                                : "bg-orange-500/10 text-orange-600"
                                }`}
                            >
                              {hackathon.submission ? hackathon.submission.status : "Pending"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-border/50">
                          <Link href={`/hackathons/${hackathon.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs border-0 hover:bg-secondary">
                              <ExternalLink className="h-3 w-3 mr-1.5" /> View
                            </Button>
                          </Link>
                          {!hackathon.submission && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleSubmitProject(hackathon.id)}
                              className="flex-1 text-xs"
                            >
                              <FileText className="h-3 w-3 mr-1.5" /> Submit
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 pb-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Notifications</CardTitle>
                  {unreadCount > 0 && <Badge className="ml-2 text-xs bg-destructive/10 text-destructive border-0 mt-2 sm:mt-0 sm:inline">{unreadCount} unread</Badge>}
                </div>
                <Link href="/dashboard/notifications" className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto text-xs">
                    View all <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-lg border-l-4 border-primary p-3 sm:p-4 text-sm sm:text-base transition-all ${!notification.read ? "bg-primary/5 border-primary" : "bg-secondary/30 border-transparent"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-foreground line-clamp-2">
                            {notification.title}
                          </h4>
                          <div className="flex gap-1 flex-shrink-0">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                                title="Mark as read"
                                className="h-6 w-6 p-0"
                              >
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleClearNotification(notification.id)}
                              title="Clear"
                              className="h-6 w-6 p-0 text-xs"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString('en-US')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 sm:mt-6 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3">
                  {myHackathons
                    .filter((h) => h.status !== "Completed")
                    .map((hackathon) => (
                      <div key={hackathon.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{hackathon.name}</p>
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
