"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Submission {
  id: string
  userId: string
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
  locked?: boolean
  lockedAt?: Date
  lockedReason?: string
  createdAt: Date
  updatedAt: Date
}

interface SubmissionManagerProps {
  hackathonId: string
}

export function AdminSubmissionManager({ hackathonId }: SubmissionManagerProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [newStatus, setNewStatus] = useState<Submission["status"]>("submitted")
  const [isLocked, setIsLocked] = useState(false)
  const [lockReason, setLockReason] = useState("")
  const [isTogglingLock, setIsTogglingLock] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [hackathonId])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/submissions`)
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
    setScore(submission.score || 0)
    setFeedback(submission.feedback || "")
    setNewStatus(submission.status)
    setIsLocked(submission.locked || false)
    setLockReason(submission.lockedReason || "")
    setIsDialogOpen(true)
  }

  const handleToggleLock = async () => {
    if (!selectedSubmission) return

    try {
      setIsTogglingLock(true)
      const response = await fetch(
        `/api/admin/hackathons/${hackathonId}/submissions/${selectedSubmission.id}/lock`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locked: !isLocked,
            reason: lockReason || (isLocked ? "" : "admin"),
          }),
        }
      )

      if (response.ok) {
        const updated = await response.json()
        setSubmissions(submissions.map((s) => (s.id === updated.id ? updated : s)))
        setSelectedSubmission(updated)
        setIsLocked(updated.locked)
      }
    } catch (error) {
      console.error("Failed to toggle submission lock:", error)
    } finally {
      setIsTogglingLock(false)
    }
  }

  const handleUpdateSubmission = async () => {
    if (!selectedSubmission) return

    try {
      const response = await fetch(
        `/api/admin/hackathons/${hackathonId}/submissions/${selectedSubmission.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            score,
            feedback,
          }),
        }
      )

      if (response.ok) {
        const updated = await response.json()
        setSubmissions(submissions.map((s) => (s.id === updated.id ? updated : s)))
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to update submission:", error)
    }
  }

  const filteredSubmissions = submissions.filter((s) => {
    const matchesStatus = filterStatus === "all" || s.status === filterStatus
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const statusColors: Record<Submission["status"], string> = {
    submitted: "bg-blue-100 text-blue-800",
    reviewing: "bg-yellow-100 text-yellow-800",
    shortlisted: "bg-purple-100 text-purple-800",
    won: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  }

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search by title or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Submissions ({filteredSubmissions.length} of {submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.title}</TableCell>
                    <TableCell className="text-sm">{submission.userId}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[submission.status]}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{submission.score}/100</TableCell>
                    <TableCell className="text-sm">
                      {new Date(submission.createdAt).toISOString().split('T')[0]}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetails(submission)}
                      >
                        View & Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8 text-gray-500">No submissions found</div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      {selectedSubmission && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSubmission.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Submission Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <p className="text-sm text-gray-600">{selectedSubmission.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Submitted</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedSubmission.createdAt).toISOString().replace('T', ' ').split('.')[0]}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Technologies</label>
                  <p className="text-sm text-gray-600">{selectedSubmission.technologiesUsed}</p>
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
                      <strong>Live:</strong>{" "}
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
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-gray-600 mt-1">{selectedSubmission.description}</p>
              </div>

              {/* Update Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Update Submission</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={newStatus} onValueChange={(value: string) => setNewStatus(value as Submission["status"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Score (0-100)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Feedback</label>
                    <Textarea
                      placeholder="Provide feedback for the team..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Lock Controls */}
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">Submission Lock</h4>
                    <div>
                      <label className="text-sm font-medium">Lock Status</label>
                      <p className="text-sm text-gray-600 mb-2">
                        {isLocked ? "🔒 This submission is locked" : "🔓 This submission is unlocked"}
                      </p>
                      {isLocked && selectedSubmission.lockedAt && (
                        <p className="text-xs text-gray-500">
                          Locked at {new Date(selectedSubmission.lockedAt).toISOString().replace('T', ' ').split('.')[0]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium">Lock Reason</label>
                      <Input
                        placeholder="Reason for locking submission..."
                        value={lockReason}
                        onChange={(e) => setLockReason(e.target.value)}
                        disabled={isTogglingLock}
                      />
                    </div>

                    <Button
                      onClick={handleToggleLock}
                      disabled={isTogglingLock}
                      variant={isLocked ? "destructive" : "outline"}
                      className="w-full"
                    >
                      {isTogglingLock ? "Processing..." : isLocked ? "Unlock Submission" : "Lock Submission"}
                    </Button>
                  </div>

                  <Button onClick={handleUpdateSubmission} className="w-full">
                    Update Submission
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
