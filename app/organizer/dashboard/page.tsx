"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Trophy,
  Users,
  FileText,
  Eye,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Megaphone,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast-provider"
import { CreateHackathonDialog } from "@/components/organizer/hackathons/create-hackathon-dialog"
import type { HackathonSummary } from "@/components/organizer/hackathons/hackathon-card"

const recentParticipants: Array<{
  id: string
  name: string
  email: string
  hackathon: string
  joinDate: string
}> = []

type UserProfile = {
  bio: string | null
  location: string | null
  website: string | null
  github: string | null
  linkedin: string | null
  twitter: string | null
  skills: string[] | null
  avatar: string | null
}

type UserInfo = {
  name: string
  email: string
  role: string
}

export default function OrganizerDashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [hackathons, setHackathons] = useState<HackathonSummary[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState("")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editProfile, setEditProfile] = useState({
    bio: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    twitter: "",
    skillsText: "",
  })
  const [pageViews, setPageViews] = useState(0)
  const { addToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/organizer/hackathons", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          setHackathons(data.hackathons || [])
        }
      } catch (error) {
        console.error("Failed to load hackathons", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
    
    // Track page views in database
    const trackPageView = async () => {
      try {
        const res = await fetch("/api/analytics/page-views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ page: "organizer-dashboard" }),
        })
        if (res.ok) {
          const data = await res.json()
          setPageViews(data.totalViews || 0)
        }
      } catch (error) {
        console.error("Failed to track page view", error)
      }
    }
    trackPageView()
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "include" })
        if (!res.ok) {
          setProfileError("Could not load profile")
          return
        }
        const data = await res.json()
        const skillsArray = (() => {
          if (!data.profile?.skills) return []
          if (Array.isArray(data.profile.skills)) return data.profile.skills
          try {
            const parsed = JSON.parse(data.profile.skills)
            return Array.isArray(parsed) ? parsed : []
          } catch {
            return []
          }
        })()

        setProfile({
          bio: data.profile?.bio ?? null,
          location: data.profile?.location ?? null,
          website: data.profile?.website ?? null,
          github: data.profile?.github ?? null,
          linkedin: data.profile?.linkedin ?? null,
          twitter: data.profile?.twitter ?? null,
          avatar: data.profile?.avatar ?? null,
          skills: skillsArray,
        })
        setUser(data.user)
        setEditProfile({
          bio: data.profile?.bio ?? "",
          location: data.profile?.location ?? "",
          website: data.profile?.website ?? "",
          github: data.profile?.github ?? "",
          linkedin: data.profile?.linkedin ?? "",
          twitter: data.profile?.twitter ?? "",
          skillsText: skillsArray.join(", "),
        })
      } catch (error) {
        console.error("Failed to load profile", error)
        setProfileError("Could not load profile")
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSaveProfile = async () => {
    const skillsArray = editProfile.skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bio: editProfile.bio,
          location: editProfile.location,
          website: editProfile.website,
          github: editProfile.github,
          linkedin: editProfile.linkedin,
          twitter: editProfile.twitter,
          skills: skillsArray,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        alert(error.error || "Failed to update profile")
        return
      }

      const data = await res.json()
      setProfile({
        bio: data.profile?.bio ?? null,
        location: data.profile?.location ?? null,
        website: data.profile?.website ?? null,
        github: data.profile?.github ?? null,
        linkedin: data.profile?.linkedin ?? null,
        twitter: data.profile?.twitter ?? null,
        avatar: data.profile?.avatar ?? null,
        skills: skillsArray,
      })
      setEditProfileOpen(false)
    } catch (error) {
      console.error("Failed to save profile", error)
      alert("Failed to update profile")
    }
  }

  const totalHackathons = hackathons.length
  const totalParticipants = hackathons.reduce((sum, h) => sum + (h.counts?.registrations || 0), 0)
  const totalSubmissions = 0
  const reviewedPercentage = 0

  const stats = [
    { title: "Total Hackathons", value: totalHackathons.toString(), icon: Trophy },
    { title: "Total Participants", value: totalParticipants.toLocaleString(), icon: Users },
    { title: "Submissions", value: totalSubmissions.toLocaleString(), icon: FileText, change: `${reviewedPercentage}% reviewed` },
    { title: "Page Views", value: pageViews.toString(), icon: Eye },
  ]

  const filteredHackathons = hackathons.filter((h) =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSuccess = (hackathon: any) => {
    setHackathons([hackathon, ...hackathons])
    setIsDialogOpen(false)
    addToast("success", "Hackathon created successfully")
  }

  const handleDeleteHackathon = (id: string) => {
    if (confirm("Delete this hackathon?")) {
      setHackathons(hackathons.filter((h) => h.id !== id))
      addToast("info", "Hackathon deleted locally")
    }
  }

  const handleViewHackathon = (id: string) => {
    router.push(`/hackathons/${id}`)
  }

  const handleEditHackathon = (id: string) => {
    alert(`Edit ${id} (future feature)`)
  }

  // Handle viewing participants
  const handleViewParticipants = (id: string) => {
    router.push(`/organizer/dashboard/participants?hackathon=${id}`)
  }

  // Handle viewing submissions
  const handleViewSubmissions = (id: string) => {
    router.push(`/organizer/dashboard/submissions?hackathon=${id}`)
  }

  // Handle announcing results
  const handleAnnounceResults = (id: string) => {
    alert(`Announcing results for hackathon ${id}`)
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Organizer Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your hackathons and track performance
            </p>
            </div>
            <CreateHackathonDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onSuccess={handleSuccess}
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Hackathon
                </Button>
              }
            />
          </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Card className="border-border bg-card lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <p className="text-sm text-muted-foreground">Profile</p>
                    <CardTitle className="text-xl">{user?.name || "Your profile"}</CardTitle>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setEditProfileOpen(true)}>
                    Edit profile
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm capitalize text-foreground">{user?.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm text-foreground">{profile?.location || "Add your location"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <p className="text-sm text-primary">{profile?.website || "Add a website"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Bio</p>
                    <p className="text-sm text-foreground">{profile?.bio || "Tell participants about you"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Skills</p>
                    <p className="text-sm text-foreground">{profile?.skills?.join(", ") || "Add skills"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle>Connections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">GitHub</p>
                    <p className="text-sm text-primary">{profile?.github || "Add GitHub"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LinkedIn</p>
                    <p className="text-sm text-primary">{profile?.linkedin || "Add LinkedIn"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Twitter</p>
                    <p className="text-sm text-primary">{profile?.twitter || "Add Twitter"}</p>
                  </div>
                  {profileError && <p className="text-xs text-red-500">{profileError}</p>}
                  {profileLoading && <p className="text-xs text-muted-foreground">Loading profile…</p>}
                </CardContent>
              </Card>
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
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Hackathons</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search hackathons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-secondary pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredHackathons.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No hackathons found. {searchQuery && "Try a different search."}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hackathon</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHackathons.map((hackathon) => (
                        <TableRow key={hackathon.id}>
                          <TableCell className="font-medium text-foreground">{hackathon.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                hackathon.status === "live"
                                  ? "default"
                                  : hackathon.status === "closed"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {hackathon.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {(hackathon.counts?.registrations || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            0
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {hackathon.registrationDeadline instanceof Date 
                              ? hackathon.registrationDeadline.toLocaleDateString() 
                              : hackathon.registrationDeadline}
                          </TableCell>
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
                                  onClick={() => handleViewHackathon(hackathon.id)}
                                >
                                  <Eye className="h-4 w-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleEditHackathon(hackathon.id)}
                                >
                                  <Edit className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleViewParticipants(hackathon.id)}
                                >
                                  <Users className="h-4 w-4" /> Participants
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2"
                                  onClick={() => handleViewSubmissions(hackathon.id)}
                                >
                                  <FileText className="h-4 w-4" /> Submissions
                                </DropdownMenuItem>
                                {hackathon.status === "live" && (
                                  <DropdownMenuItem 
                                    className="gap-2 text-primary"
                                    onClick={() => handleAnnounceResults(hackathon.id)}
                                  >
                                    <Megaphone className="h-4 w-4" /> Announce Results
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="gap-2 text-destructive"
                                  onClick={() => handleDeleteHackathon(hackathon.id)}
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Recent Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Hackathon</TableHead>
                      <TableHead>Team</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentParticipants.map((participant) => (
                      <TableRow key={participant.email}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{participant.name}</p>
                            <p className="text-xs text-muted-foreground">{participant.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{participant.hackathon}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{participant.joinDate}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button 
                    variant="outline" 
                    className="h-auto flex-col items-start gap-2 p-4 bg-transparent"
                    onClick={() => router.push("/organizer/dashboard/participants")}
                  >
                    <Users className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Manage Participants</p>
                      <p className="text-xs text-muted-foreground">View and manage registrations</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto flex-col items-start gap-2 p-4 bg-transparent"
                    onClick={() => router.push("/organizer/dashboard/submissions")}
                  >
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Review Submissions</p>
                      <p className="text-xs text-muted-foreground">Judge and score projects</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto flex-col items-start gap-2 p-4 bg-transparent"
                    onClick={() => alert("Results announcement feature coming soon!")}
                  >
                    <Megaphone className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Announce Results</p>
                      <p className="text-xs text-muted-foreground">Publish winners and prizes</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto flex-col items-start gap-2 p-4 bg-transparent"
                    onClick={() => alert("Analytics coming soon!")}
                  >
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">View Analytics</p>
                      <p className="text-xs text-muted-foreground">Track engagement metrics</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Bio</Label>
              <Input
                value={editProfile.bio}
                onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                placeholder="Short intro"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={editProfile.location}
                onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={editProfile.website}
                onChange={(e) => setEditProfile({ ...editProfile, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input
                value={editProfile.github}
                onChange={(e) => setEditProfile({ ...editProfile, github: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={editProfile.linkedin}
                onChange={(e) => setEditProfile({ ...editProfile, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter</Label>
              <Input
                value={editProfile.twitter}
                onChange={(e) => setEditProfile({ ...editProfile, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Skills (comma separated)</Label>
              <Input
                value={editProfile.skillsText}
                onChange={(e) => setEditProfile({ ...editProfile, skillsText: e.target.value })}
                placeholder="AI, Backend, UX"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
