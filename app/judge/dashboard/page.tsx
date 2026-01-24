"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trophy, FileText, Star, Award } from "lucide-react"
import type { Submission } from "@/lib/data"

type Assignment = {
  id: string
  hackathonId: string
  hackathonTitle: string
}

type SubmissionWithHackathon = Submission & {
  hackathonTitle: string
}

export default function JudgeDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<SubmissionWithHackathon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [scoringSubmission, setScoringSubmission] = useState<SubmissionWithHackathon | null>(null)
  const [scores, setScores] = useState({
    innovation: 5,
    technical: 5,
    design: 5,
    impact: 5,
    presentation: 5,
    feedback: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        // In real app, fetch judge's assigned hackathons
        // For now, mock data
        setAssignments([
          { id: "ja_1", hackathonId: "ai-summit", hackathonTitle: "Global AI Innovation Summit" },
        ])
        
        // Load submissions for assigned hackathons
        const response = await fetch("/api/hackathons/ai-summit/submissions", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          const mapped = data.submissions.map((s: Submission) => ({
            ...s,
            hackathonTitle: "Global AI Innovation Summit",
          }))
          setSubmissions(mapped)
        }
      } catch (error) {
        console.error("Failed to load", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSubmitScore = async () => {
    if (!scoringSubmission) return

    try {
      const response = await fetch(`/api/submissions/${scoringSubmission.id}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(scores),
      })

      if (response.ok) {
        alert("Score submitted successfully!")
        setScoringSubmission(null)
        setScores({ innovation: 5, technical: 5, design: 5, impact: 5, presentation: 5, feedback: "" })
      } else {
        const error = await response.json()
        alert(error.error || "Failed to submit score")
      }
    } catch (error) {
      console.error("Score error", error)
      alert("Failed to submit score")
    }
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  const stats = [
    { title: "Assigned Hackathons", value: assignments.length.toString(), icon: Trophy },
    { title: "Total Submissions", value: submissions.length.toString(), icon: FileText },
    { title: "Scored", value: "0", icon: Star },
    { title: "Pending Review", value: submissions.length.toString(), icon: Award },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="judge" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Judge Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Evaluate submissions for assigned hackathons</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Submissions to Evaluate</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No submissions to evaluate yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Hackathon</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{submission.title}</p>
                          <p className="text-xs text-muted-foreground">{submission.description?.substring(0, 50)}...</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{submission.hackathonTitle}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge>{submission.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{submission.score || "-"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => setScoringSubmission(submission)}
                        >
                          Evaluate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!scoringSubmission} onOpenChange={() => setScoringSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evaluate Submission: {scoringSubmission?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm font-medium">Description:</p>
              <p className="text-sm text-muted-foreground">{scoringSubmission?.description}</p>
              {scoringSubmission?.github && (
                <p className="mt-2 text-sm">
                  <a href={scoringSubmission.github} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    View on GitHub →
                  </a>
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { key: "innovation", label: "Innovation" },
                { key: "technical", label: "Technical Quality" },
                { key: "design", label: "Design & UX" },
                { key: "impact", label: "Impact & Utility" },
                { key: "presentation", label: "Presentation" },
              ].map((criterion) => (
                <div key={criterion.key} className="space-y-2">
                  <Label>{criterion.label} (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={scores[criterion.key as keyof typeof scores]}
                    onChange={(e) => setScores({ ...scores, [criterion.key]: parseInt(e.target.value) || 1 })}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Feedback (Optional)</Label>
              <Input
                value={scores.feedback}
                onChange={(e) => setScores({ ...scores, feedback: e.target.value })}
                placeholder="Provide constructive feedback..."
              />
            </div>

            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-sm font-medium">
                Total Score: {scores.innovation + scores.technical + scores.design + scores.impact + scores.presentation} / 50
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitScore} className="flex-1">
                Submit Score
              </Button>
              <Button variant="outline" onClick={() => setScoringSubmission(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
