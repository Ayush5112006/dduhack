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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Download, Trash2, Eye } from "lucide-react"
import { useToast } from "@/components/toast-provider"

const mockSubmissions: Array<{
  id: string
  hackathon: string
  project: string
  team: string
  date: string
  status: string
  score: number
  url: string
}> = []

export default function SubmissionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [submissions, setSubmissions] = useState(mockSubmissions)
  const { addToast } = useToast()

  const filteredSubmissions = submissions.filter((s) =>
    s.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.hackathon.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.team.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm("Delete this submission?")) {
      setSubmissions(submissions.filter((s) => s.id !== id))
      addToast("success", "Submission deleted successfully!")
    }
  }

  const handleDownload = (id: string) => {
    const submission = submissions.find((s) => s.id === id)
    if (submission) {
      addToast("success", `Downloaded ${submission.project} submission`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Submissions</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your hackathon project submissions
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Project Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-muted-foreground">
                  {submissions.length === 0
                    ? "You haven't submitted any projects yet"
                    : "No submissions match your search"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Hackathon</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium text-foreground">
                          {submission.project}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.hackathon}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.team}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.date}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.status === "Approved"
                                ? "default"
                                : submission.status === "Under Review"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              submission.status === "Approved"
                                ? "bg-green-500/10 text-green-500"
                                : submission.status === "Under Review"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-blue-500/10 text-blue-500"
                            }
                          >
                            {submission.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {submission.score || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownload(submission.id)}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(submission.id)}
                                className="gap-2 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
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
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
