"use client"

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
import { Search, MoreHorizontal, Eye, Edit, Check, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSearchParams } from "next/navigation"

const mockSubmissions: Array<{
  id: string
  team: string
  project: string
  hackathon: string
  date: string
  status: string
  score: number
}> = []

export default function SubmissionsPage() {
  const searchParams = useSearchParams()
  const hackathonFilter = searchParams.get("hackathon")
  const [searchQuery, setSearchQuery] = useState("")
  const [submissions, setSubmissions] = useState(mockSubmissions)
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.project.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesHackathon = !hackathonFilter || s.hackathon.includes(hackathonFilter)
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    return matchesSearch && matchesHackathon && matchesStatus
  })

  const handleExportSubmissions = () => {
    const csv = [
      ["Team", "Project", "Hackathon", "Submitted Date", "Status", "Score"],
      ...filteredSubmissions.map(s => [
        s.team, s.project, s.hackathon, s.date, s.status, s.score || "N/A"
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "submissions.csv"
    a.click()
    alert("Submissions exported successfully!")
  }

  const pendingReview = submissions.filter((s) => s.status === "Pending Review").length
  const underReview = submissions.filter((s) => s.status === "Under Review").length
  const reviewed = submissions.filter((s) => s.status === "Reviewed").length

  const handleView = (id: string) => {
    alert(`Viewing submission ${id}`)
  }

  const handleReview = (id: string) => {
    const score = prompt("Enter score (0-100):")
    if (score && !isNaN(Number(score)) && Number(score) >= 0 && Number(score) <= 100) {
      setSubmissions(submissions.map(s => 
        s.id === id ? { ...s, score: Number(score), status: "Reviewed" } : s
      ))
    }
  }

  const handleApprove = (id: string) => {
    if (confirm("Approve this submission?")) {
      setSubmissions(submissions.map(s => 
        s.id === id ? { ...s, status: "Reviewed" } : s
      ))
      alert("Submission approved!")
    }
  }

  const handleReject = (id: string) => {
    if (confirm("Reject this submission?")) {
      setSubmissions(submissions.filter(s => s.id !== id))
      alert("Submission rejected")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Submissions</h1>
          <p className="mt-2 text-muted-foreground">
            Review and score project submissions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold text-foreground mt-2">{pendingReview}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-3xl font-bold text-foreground mt-2">{underReview}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                <p className="text-3xl font-bold text-foreground mt-2">{reviewed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Submissions</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportSubmissions}
                disabled={filteredSubmissions.length === 0}
              >
                Export CSV
              </Button>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-secondary pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-border bg-secondary px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Under Review">Under Review</option>
                <option value="Reviewed">Reviewed</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSubmissions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No submissions found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Hackathon</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium text-foreground">
                        {submission.team}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {submission.project}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {submission.hackathon}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {submission.date}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            submission.status === "Reviewed"
                              ? "default"
                              : submission.status === "Under Review"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {submission.score ? `${submission.score}/100` : "-"}
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
                              onClick={() => handleView(submission.id)}
                            >
                              <Eye className="h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => handleReview(submission.id)}
                            >
                              <Edit className="h-4 w-4" /> Review & Score
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-green-600"
                              onClick={() => handleApprove(submission.id)}
                            >
                              <Check className="h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => handleReject(submission.id)}
                            >
                              <X className="h-4 w-4" /> Reject
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
      </main>
    </div>
  )
}
