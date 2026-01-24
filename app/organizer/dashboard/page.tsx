"use client"

import Link from "next/link"
import { useState } from "react"
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
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import Loading from "./loading"

const recentParticipants: Array<{
  id: string
  name: string
  email: string
  hackathon: string
  joinDate: string
}> = []

export default function OrganizerDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [hackathons, setHackathons] = useState<Array<{
    id: string
    name: string
    status: string
    participants: number
    submissions: number
    deadline: string
  }>>([])
  const [newHackathonName, setNewHackathonName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Calculate dynamic stats
  const totalHackathons = hackathons.length
  const totalParticipants = hackathons.reduce((sum, h) => sum + h.participants, 0)
  const totalSubmissions = hackathons.reduce((sum, h) => sum + h.submissions, 0)
  const reviewedPercentage =
    totalSubmissions > 0
      ? Math.round((hackathons.filter((h) => h.status === "Completed").reduce((sum, h) => sum + h.submissions, 0) / totalSubmissions) * 100)
      : 0

  const stats = [
    { title: "Total Hackathons", value: totalHackathons.toString(), icon: Trophy, change: "+1 this month" },
    { title: "Total Participants", value: totalParticipants.toLocaleString(), icon: Users, change: "+342 this week" },
    { title: "Submissions", value: totalSubmissions.toLocaleString(), icon: FileText, change: `${reviewedPercentage}% reviewed` },
    { title: "Page Views", value: "45.2K", icon: Eye, change: "+12% from last month" },
  ]

  // Filter hackathons based on search query
  const filteredHackathons = hackathons.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle creating a new hackathon
  const handleCreateHackathon = () => {
    if (newHackathonName.trim()) {
      const newHackathon = {
        id: (hackathons.length + 1).toString(),
        name: newHackathonName,
        status: "Draft",
        participants: 0,
        submissions: 0,
        deadline: "TBD",
      }
      setHackathons([...hackathons, newHackathon])
      setNewHackathonName("")
      setIsDialogOpen(false)
    }
  }

  // Handle deleting a hackathon
  const handleDeleteHackathon = (id: string) => {
    setHackathons(hackathons.filter((h) => h.id !== id))
  }

  // Handle viewing hackathon details
  const handleViewHackathon = (id: string) => {
    router.push(`/organizer/dashboard/hackathons/${id}`)
  }

  // Handle editing hackathon
  const handleEditHackathon = (id: string) => {
    router.push(`/organizer/dashboard/hackathons/${id}/edit`)
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

  return (
    <Suspense fallback={<Loading />}>
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Hackathon
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Hackathon</DialogTitle>
                  <DialogDescription>
                    Start by entering basic details. You can add more information later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label htmlFor="hackathonName" className="text-sm font-medium text-foreground">
                      Hackathon Name
                    </label>
                    <Input 
                      id="hackathonName" 
                      placeholder="Enter hackathon name" 
                      className="bg-secondary"
                      value={newHackathonName}
                      onChange={(e) => setNewHackathonName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateHackathon()
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        setNewHackathonName("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateHackathon} disabled={!newHackathonName.trim()}>
                      Continue
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                          <TableCell className="font-medium text-foreground">{hackathon.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                hackathon.status === "Active"
                                  ? "default"
                                  : hackathon.status === "Completed"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {hackathon.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {hackathon.participants.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {hackathon.submissions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{hackathon.deadline}</TableCell>
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
                                {hackathon.status === "Active" && (
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
      </div>
    </Suspense>
  )
}
