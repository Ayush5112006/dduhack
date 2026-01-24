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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, ExternalLink, Trash2, Edit, CalendarDays } from "lucide-react"
import { useToast } from "@/components/toast-provider"

const mockHackathons: Array<{
  id: string
  name: string
  role: string
  status: string
  deadline: string
  submission: string
  prize: string
  participants: number
}> = []

export default function ParticipantHackathonsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [hackathons, setHackathons] = useState(mockHackathons)
  const { addToast } = useToast()

  const filteredHackathons = hackathons.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleWithdraw = (id: string) => {
    if (confirm("Withdraw from this hackathon?")) {
      setHackathons(hackathons.filter((h) => h.id !== id))
      addToast("success", "Withdrawn successfully!")
    }
  }

  const handleSubmitProject = (id: string) => {
    const hackathon = hackathons.find((h) => h.id === id)
    if (hackathon) {
      const githubUrl = prompt("Enter your GitHub repository URL:")
      if (githubUrl) {
        if (!githubUrl.includes("github.com")) {
          addToast("error", "Invalid GitHub URL!")
          return
        }
        setHackathons(
          hackathons.map((h) =>
            h.id === id ? { ...h, submission: "Submitted" } : h
          )
        )
        addToast("success", "Project submitted successfully!")
      }
    }
  }

  const handleViewDetails = (id: string) => {
    const hackathon = hackathons.find((h) => h.id === id)
    if (hackathon) {
      window.location.href = `/hackathons/${id}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Hackathons</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your hackathon registrations and submissions
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Hackathons</CardTitle>
            <Link href="/hackathons">
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Browse More
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search hackathons..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredHackathons.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-muted-foreground">
                  {hackathons.length === 0
                    ? "You haven't registered for any hackathons yet"
                    : "No hackathons match your search"}
                </p>
                <Link href="/hackathons">
                  <Button variant="outline" className="mt-4">
                    Explore Hackathons
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Your Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submission</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Prize Pool</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHackathons.map((hackathon) => (
                      <TableRow key={hackathon.id}>
                        <TableCell className="font-medium text-foreground">
                          {hackathon.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {hackathon.role}
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
                            className={
                              hackathon.status === "In Progress"
                                ? "bg-blue-500/10 text-blue-500"
                                : hackathon.status === "Completed"
                                ? "bg-green-500/10 text-green-500"
                                : ""
                            }
                          >
                            {hackathon.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              hackathon.submission === "Submitted"
                                ? "default"
                                : "outline"
                            }
                            className={
                              hackathon.submission === "Submitted"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            }
                          >
                            {hackathon.submission}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {hackathon.deadline}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {hackathon.prize}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(hackathon.id)}
                                className="gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {hackathon.submission === "Not submitted" && (
                                <DropdownMenuItem
                                  onClick={() => handleSubmitProject(hackathon.id)}
                                  className="gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Submit Project
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleWithdraw(hackathon.id)}
                                className="gap-2 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Withdraw
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
          </CardContent>
        </Card>

        <Card className="mt-6 border-border bg-card">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Registered
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {hackathons.length}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Submissions Made
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {hackathons.filter((h) => h.submission === "Submitted").length}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {hackathons.filter((h) => h.status === "Completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
