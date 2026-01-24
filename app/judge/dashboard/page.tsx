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

export default function JudgeDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<SubmissionWithHackathon[]>([])
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

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
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
                <p className="text-sm text-foreground">{profile?.bio || "Tell organizers about you"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground">Skills</p>
                <p className="text-sm text-foreground">{profile?.skills?.join(", ") || "Add skills to appear in assignments"}</p>
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
