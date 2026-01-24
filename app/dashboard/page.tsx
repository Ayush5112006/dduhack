"use client"

import { useState } from "react"
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

const mockStats = [
  { title: "Active Hackathons", value: "3", change: "+1 this month", icon: Trophy },
  { title: "Submissions", value: "5", change: "+2 pending review", icon: FileText },
  { title: "Wins", value: "2", change: "Last win 2 weeks ago", icon: Award },
  { title: "Notifications", value: "4", change: "2 unread", icon: Bell },
]

const mockMyHackathons = [
  { id: "1", name: "Web3 Hackathon 2026", role: "Full Stack Developer", status: "In Progress", deadline: "Jan 30, 2026", submission: "Not submitted" },
  { id: "2", name: "AI Challenge 2026", role: "ML Engineer", status: "In Progress", deadline: "Feb 5, 2026", submission: "Submitted" },
  { id: "3", name: "Climate Tech Hack", role: "Backend Developer", status: "Completed", deadline: "Jan 15, 2026", submission: "Submitted" },
]

const mockNotifications = [
  { id: "1", title: "Submission Received", message: "Your AI Challenge submission has been received", time: "2 hours ago", unread: true },
  { id: "2", title: "Results Announced", message: "Winners of Climate Tech Hack announced", time: "5 hours ago", unread: true },
  { id: "3", title: "New Hackathon", message: "Blockchain Hack 2026 is now open for registration", time: "1 day ago", unread: false },
  { id: "4", title: "Reminder", message: "Your Web3 Hackathon submission deadline is approaching", time: "2 days ago", unread: false },
]

export default function ParticipantDashboard() {
  const [myHackathons, setMyHackathons] = useState(mockMyHackathons)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [stats] = useState(mockStats)
  const [searchQuery, setSearchQuery] = useState("")
  const { addToast } = useToast()

  const filteredHackathons = myHackathons.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteHackathon = (id: string) => {
    if (confirm("Are you sure you want to delete this hackathon from your list?")) {
      setMyHackathons(myHackathons.filter(h => h.id !== id))
      addToast("Hackathon removed successfully!", "success")
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
      addToast("Role updated successfully!", "success")
    }
  }

  const handleSubmitProject = (id: string) => {
    const hackathon = myHackathons.find(h => h.id === id)
    if (!hackathon) return
    
    if (hackathon.submission === "Submitted") {
      addToast("You have already submitted for this hackathon!", "info")
      return
    }

    const projectUrl = prompt("Enter your project submission URL (GitHub link):")
    if (projectUrl) {
      if (!projectUrl.includes("github.com")) {
        addToast("Please enter a valid GitHub URL!", "error")
        return
      }
      setMyHackathons(myHackathons.map(h => 
        h.id === id ? { ...h, submission: "Submitted" } : h
      ))
      addToast("Project submitted successfully!", "success")
    }
  }

  const handleClearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
    addToast("Notification removed", "info")
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, unread: false } : n
    ))
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, John!</h1>
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
                              <p className="text-xs text-muted-foreground">{hackathon.role}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                hackathon.status === "In Progress"
                                  ? "default"
                                  : hackathon.status === "Completed"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {hackathon.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{hackathon.deadline}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                hackathon.submission === "Submitted"
                                  ? "default"
                                  : hackathon.submission === "Not submitted"
                                  ? "destructive"
                                  : "outline"
                              }
                              className={hackathon.submission === "Submitted" ? "bg-green-500/10 text-green-500" : ""}
                            >
                              {hackathon.submission}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSubmitProject(hackathon.id)}
                                title="Submit Project"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditHackathon(hackathon.id)}
                                title="Edit Role"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteHackathon(hackathon.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                              <Link href={`/hackathons/${hackathon.id}`}>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
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
                          notification.unread ? "bg-primary/5" : "bg-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-foreground">
                            {notification.title}
                          </h4>
                          <div className="flex gap-1">
                            {notification.unread && (
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
                        <p className="mt-2 text-xs text-muted-foreground">{notification.time}</p>
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
