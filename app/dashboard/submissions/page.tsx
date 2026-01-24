"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Search, MoreHorizontal, Download, Trash2, Eye, Send } from "lucide-react"
import { useToast } from "@/components/toast-provider"
import type { Hackathon } from "@/lib/data"

type UiSubmission = {
  id: string
  hackathonId: string
  hackathonTitle: string
  project: string
  date: string
  status: string
  score?: number
  github?: string
  psTitle?: string
}

export default function SubmissionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [submissions, setSubmissions] = useState<UiSubmission[]>([])
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [form, setForm] = useState({
    hackathonId: "",
    title: "",
    description: "",
    github: "",
    demo: "",
    video: "",
    techStack: "",
    psId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<UiSubmission | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const [subsRes, hacksRes] = await Promise.all([
          fetch("/api/submissions", { credentials: "include" }),
          fetch("/api/hackathons", { credentials: "include" }),
        ])

        if (subsRes.ok) {
          const data = await subsRes.json()
          const mapped: UiSubmission[] = (data.submissions || []).map((s: any) => ({
            id: s.id,
            hackathonId: s.hackathonId,
            hackathonTitle: s.hackathon?.title || s.hackathonId,
            project: s.title,
            date: new Date(s.createdAt).toLocaleDateString(),
            status: s.status,
            score: s.score,
            github: s.github,
            psTitle: s.problem?.title,
          }))
          setSubmissions(mapped)
        }

        if (hacksRes.ok) {
          const data = await hacksRes.json()
          setHackathons(data.hackathons || [])
        }
      } catch (error) {
        console.error("Failed to load submissions", error)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const filteredSubmissions = submissions.filter((s) =>
    s.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.hackathonTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm("Delete this submission?")) {
      setSubmissions(submissions.filter((s) => s.id !== id))
      addToast("success", "Submission deleted locally (in-memory only)")
    }
  }

  const handleDownload = (id: string) => {
    const submission = submissions.find((s) => s.id === id)
    if (!submission) return

    const payload = {
      project: submission.project,
      hackathon: submission.hackathonTitle,
      status: submission.status,
      score: submission.score ?? null,
      github: submission.github ?? null,
      problem: submission.psTitle ?? null,
      date: submission.date,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${submission.project || "submission"}.json`
    link.click()
    URL.revokeObjectURL(url)

    addToast("success", `Downloaded ${submission.project} details`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.hackathonId) {
      addToast("error", "Select a hackathon")
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/hackathons/${form.hackathonId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          github: form.github,
          demo: form.demo,
          video: form.video,
          techStack: form.techStack
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          psId: form.psId || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions([
          {
            id: data.submission.id,
            hackathonId: data.submission.hackathonId,
            hackathonTitle: hackathons.find((h) => h.id === data.submission.hackathonId)?.title || data.submission.hackathonId,
            project: data.submission.title,
            date: new Date(data.submission.createdAt).toLocaleDateString(),
            status: data.submission.status,
            github: data.submission.github,
          },
          ...submissions,
        ])
        setForm({ hackathonId: "", title: "", description: "", github: "", demo: "", video: "", techStack: "", psId: "" })
        addToast("success", "Submission created")
      } else {
        const error = await response.json()
        addToast(error.error || "Failed to submit", "error")
      }
    } catch (error) {
      console.error("submit error", error)
      addToast("error", "Failed to submit")
    } finally {
      setIsSubmitting(false)
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
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <div>
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
              <form className="space-y-3 rounded-lg border border-border p-4 bg-muted/10" onSubmit={handleSubmit}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Hackathon</Label>
                    <Select
                      value={form.hackathonId}
                      onValueChange={(value) => setForm({ ...form, hackathonId: value })}
                    >
                      <SelectTrigger className="bg-secondary">
                        <SelectValue placeholder="Select hackathon" />
                      </SelectTrigger>
                      <SelectContent>
                        {hackathons.map((h) => (
                          <SelectItem value={h.id} key={h.id}>{h.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Project title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Project description"
                    required
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>GitHub</Label>
                    <Input
                      value={form.github}
                      onChange={(e) => setForm({ ...form, github: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Demo URL</Label>
                    <Input
                      value={form.demo}
                      onChange={(e) => setForm({ ...form, demo: e.target.value })}
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Video URL</Label>
                    <Input
                      value={form.video}
                      onChange={(e) => setForm({ ...form, video: e.target.value })}
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tech stack (comma separated)</Label>
                    <Input
                      value={form.techStack}
                      onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                      placeholder="Next.js, Tailwind, PostgreSQL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Problem statement ID (optional)</Label>
                    <Input
                      value={form.psId}
                      onChange={(e) => setForm({ ...form, psId: e.target.value })}
                      placeholder="ps-id"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "Submitting..." : <><Send className="mr-2 h-4 w-4" />Submit</>}
                </Button>
              </form>
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-muted-foreground">Loading submissions...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
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
                      <TableHead>Problem</TableHead>
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
                          {submission.hackathonTitle}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {submission.psTitle || "-"}
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
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setSelected(submission)
                                  setDetailsOpen(true)
                                }}
                              >
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.project || "Submission Details"}</DialogTitle>
            <DialogDescription>
              {selected?.hackathonTitle ? `Hackathon: ${selected.hackathonTitle}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm text-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span>{selected.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{selected.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score</span>
                <span>{selected.score ?? "N/A"}</span>
              </div>
              {selected.psTitle && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Problem</span>
                  <span className="text-right max-w-[200px] truncate">{selected.psTitle}</span>
                </div>
              )}
              {selected.github && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">GitHub</span>
                  <a
                    className="text-primary truncate max-w-[220px] hover:underline"
                    href={selected.github.startsWith("http") ? selected.github : `https://${selected.github}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selected.github}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
