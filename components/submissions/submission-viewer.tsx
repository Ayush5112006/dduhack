"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Download, Github, ExternalLink, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Submission {
  id: string
  title: string
  description: string
  technologiesUsed: string[]
  gitHubLink: string
  liveLink?: string
  deploymentLink?: string
  video?: string
  documentation?: string
  status: "submitted" | "reviewing" | "shortlisted" | "won" | "rejected"
  submittedAt: Date
  score?: number
  feedback?: string
  fileUrls?: string[]
  teamName?: string
}

const statusConfig = {
  submitted: { color: "bg-blue-500/10 text-blue-600", icon: Clock, label: "Submitted" },
  reviewing: { color: "bg-yellow-500/10 text-yellow-600", icon: AlertCircle, label: "Under Review" },
  shortlisted: { color: "bg-purple-500/10 text-purple-600", icon: CheckCircle2, label: "Shortlisted" },
  won: { color: "bg-green-500/10 text-green-600", icon: CheckCircle2, label: "Won" },
  rejected: { color: "bg-red-500/10 text-red-600", icon: AlertCircle, label: "Not Selected" },
}

export function SubmissionCard({ submission }: { submission: Submission }) {
  const [viewDetails, setViewDetails] = useState(false)
  const statusInfo = statusConfig[submission.status]
  const StatusIcon = statusInfo.icon

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{submission.title}</CardTitle>
            <CardDescription className="mt-1">{submission.teamName || "Individual Submission"}</CardDescription>
          </div>
          <Badge className={`flex items-center gap-1 ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{submission.description}</p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2">
          {submission.technologiesUsed.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          {submission.gitHubLink && (
            <Button variant="ghost" size="sm" asChild>
              <a href={submission.gitHubLink} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-1" />
                Code
              </a>
            </Button>
          )}
          {submission.liveLink && (
            <Button variant="ghost" size="sm" asChild>
              <a href={submission.liveLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Live Demo
              </a>
            </Button>
          )}
          {submission.video && (
            <Button variant="ghost" size="sm" asChild>
              <a href={submission.video} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Video
              </a>
            </Button>
          )}
        </div>

        {/* Score */}
        {submission.score !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Score:</span>
            <span className="font-semibold">{submission.score}/100</span>
          </div>
        )}

        {/* Submitted Date */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Submitted {new Date(submission.submittedAt).toISOString().split('T')[0]}
        </div>

        {/* Actions */}
        <Dialog open={viewDetails} onOpenChange={setViewDetails}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{submission.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Status & Score */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`mt-2 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                </div>
                {submission.score !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold mt-2">{submission.score}/100</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{submission.description}</p>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="font-semibold mb-2">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {submission.technologiesUsed.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div>
                <h3 className="font-semibold mb-3">Project Links</h3>
                <div className="space-y-2">
                  {submission.gitHubLink && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={submission.gitHubLink} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub Repository
                      </a>
                    </Button>
                  )}
                  {submission.liveLink && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={submission.liveLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {submission.deploymentLink && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={submission.deploymentLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Deployment
                      </a>
                    </Button>
                  )}
                  {submission.video && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={submission.video} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Video Demo
                      </a>
                    </Button>
                  )}
                  {submission.documentation && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={submission.documentation} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Files */}
              {submission.fileUrls && submission.fileUrls.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Attached Files</h3>
                  <div className="space-y-2">
                    {submission.fileUrls.map((fileUrl, idx) => (
                      <Button key={idx} variant="outline" className="w-full justify-start" asChild>
                        <a href={fileUrl} download>
                          <Download className="h-4 w-4 mr-2" />
                          File {idx + 1}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {submission.feedback && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Feedback</h3>
                  <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export function SubmissionHistory({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No submissions yet. Start by submitting your first project!</p>
        </CardContent>
      </Card>
    )
  }

  // Group submissions by status
  const grouped = submissions.reduce(
    (acc, sub) => {
      if (!acc[sub.status]) acc[sub.status] = []
      acc[sub.status].push(sub)
      return acc
    },
    {} as Record<string, Submission[]>
  )

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([status, subs]) => (
        <div key={status}>
          <h3 className="font-semibold mb-3 capitalize">{status} Submissions ({subs.length})</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subs.map((sub) => (
              <SubmissionCard key={sub.id} submission={sub} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
