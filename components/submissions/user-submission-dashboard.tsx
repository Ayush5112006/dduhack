"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Submission {
  id: string
  hackathonId: string
  title: string
  description: string
  technologiesUsed: string
  gitHubLink: string
  liveLink: string
  deploymentLink: string
  video: string
  documentation: string
  fileUrls: string
  status: "submitted" | "reviewing" | "shortlisted" | "won" | "rejected"
  score: number
  feedback: string
  createdAt: Date
  updatedAt: Date
}

export function UserSubmissionDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/submissions")
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDialogOpen(true)
  }

  const downloadFile = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  const statusColors: Record<Submission["status"], string> = {
    submitted: "bg-blue-100 text-blue-800",
    reviewing: "bg-yellow-100 text-yellow-800",
    shortlisted: "bg-purple-100 text-purple-800",
    won: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  }

  const statusSteps = [
    { key: "submitted", label: "Submitted" },
    { key: "reviewing", label: "Reviewing" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "won", label: "Won" },
  ]

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Submissions</h2>
        <p className="text-gray-600">Track your hackathon submissions and their status</p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => {
            // Calculate progress step
            const currentStepIndex = statusSteps.findIndex(
              (step) => step.key === submission.status
            )

            return (
              <Card key={submission.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{submission.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={statusColors[submission.status]}>
                      {submission.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Steps */}
                  <div className="flex items-center gap-2">
                    {statusSteps.map((step, index) => (
                      <div key={step.key} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                            index <= currentStepIndex
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`flex-1 h-1 mx-2 ${
                              index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Score Display */}
                  {submission.score > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Score</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {submission.score}/100
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {submission.feedback && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-1">Feedback</p>
                      <p className="text-sm text-blue-800">{submission.feedback}</p>
                    </div>
                  )}

                  {/* Links Preview */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Project Links</p>
                    <div className="flex flex-wrap gap-2">
                      {submission.gitHubLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(submission.gitHubLink, "_blank")}
                        >
                          GitHub
                        </Button>
                      )}
                      {submission.liveLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(submission.liveLink, "_blank")}
                        >
                          Live Demo
                        </Button>
                      )}
                      {submission.video && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(submission.video, "_blank")}
                        >
                          Video
                        </Button>
                      )}
                      {submission.documentation && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(submission.documentation, "_blank")}
                        >
                          Docs
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleOpenDetails(submission)}
                    className="w-full"
                    variant="outline"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Details Dialog */}
      {selectedSubmission && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSubmission.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-gray-600 mt-1">{selectedSubmission.description}</p>
              </div>

              {/* Technologies */}
              <div>
                <label className="text-sm font-medium">Technologies Used</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSubmission.technologiesUsed.split(",").map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech.trim()}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Links</label>
                <div className="space-y-1 text-sm">
                  {selectedSubmission.gitHubLink && (
                    <p>
                      <strong>GitHub:</strong>{" "}
                      <a
                        href={selectedSubmission.gitHubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedSubmission.gitHubLink}
                      </a>
                    </p>
                  )}
                  {selectedSubmission.liveLink && (
                    <p>
                      <strong>Live Demo:</strong>{" "}
                      <a
                        href={selectedSubmission.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedSubmission.liveLink}
                      </a>
                    </p>
                  )}
                  {selectedSubmission.deploymentLink && (
                    <p>
                      <strong>Deployment:</strong>{" "}
                      <a
                        href={selectedSubmission.deploymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedSubmission.deploymentLink}
                      </a>
                    </p>
                  )}
                  {selectedSubmission.video && (
                    <p>
                      <strong>Video:</strong>{" "}
                      <a
                        href={selectedSubmission.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedSubmission.video}
                      </a>
                    </p>
                  )}
                  {selectedSubmission.documentation && (
                    <p>
                      <strong>Documentation:</strong>{" "}
                      <a
                        href={selectedSubmission.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedSubmission.documentation}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Files */}
              {selectedSubmission.fileUrls && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attached Files</label>
                  <div className="space-y-1">
                    {selectedSubmission.fileUrls.split(",").map((file, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(file.trim())}
                      >
                        Download File {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status & Score */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Status</span>
                  <Badge className={statusColors[selectedSubmission.status]}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
                {selectedSubmission.score > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium">Score</span>
                    <span className="text-lg font-bold text-blue-600">
                      {selectedSubmission.score}/100
                    </span>
                  </div>
                )}
                {selectedSubmission.feedback && (
                  <div>
                    <span className="font-medium">Feedback</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedSubmission.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
