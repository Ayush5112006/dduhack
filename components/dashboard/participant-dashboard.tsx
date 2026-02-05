"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/toast-provider"
import {
  Calendar,
  Clock,
  Trophy,
  GitBranch,
  Video,
  FileText,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
  Plus,
} from "lucide-react"
import Link from "next/link"

interface Registration {
  id: string
  hackathonId: string
  mode: "individual" | "team"
  status: string
  hackathon: {
    id: string
    title: string
    status: string
    startDate: string
    endDate: string
    registrationDeadline: string
  }
  team?: {
    id: string
    name: string
    leaderEmail: string
  }
}

interface Submission {
  id: string
  hackathonId: string
  title: string
  status: "draft" | "submitted" | "late"
  github: string
  demo?: string
  video?: string
  scores?: Array<{
    id: string
    total: number
    feedback: string
  }>
  hackathon: {
    title: string
    endDate: string
  }
}

export function ParticipantDashboard() {
  const { addToast } = useToast()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [regRes, subRes] = await Promise.all([
        fetch("/api/participant/registration"),
        fetch("/api/participant/submissions"),
      ])

      if (regRes.ok) {
        const data = await regRes.json()
        setRegistrations(data.registrations)
      }

      if (subRes.ok) {
        const data = await subRes.json()
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error(error)
      addToast("error", "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500/10 text-blue-700"
      case "live":
        return "bg-emerald-500/10 text-emerald-700"
      case "past":
        return "bg-slate-500/10 text-slate-700"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-500/10 text-yellow-700"
      case "submitted":
        return "bg-emerald-500/10 text-emerald-700"
      case "late":
        return "bg-orange-500/10 text-orange-700"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  const [currentTime, setCurrentTime] = useState<number | null>(null)

  useEffect(() => {
    setCurrentTime(Date.now())
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const isDeadlineSoon = (deadline: string) => {
    const daysLeft = Math.ceil(
      (new Date(deadline).getTime() - currentTime) / (1000 * 60 * 60 * 24)
    )
    return daysLeft <= 3 && daysLeft > 0
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Participant Dashboard</h1>
        <p className="text-muted-foreground mt-2">Track your hackathon journey</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registrations">
            Registrations ({registrations.length})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Registrations Tab */}
        <TabsContent value="registrations" className="space-y-4 mt-6">
          {registrations.length === 0 ? (
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No hackathon registrations yet</p>
                <Button asChild>
                  <Link href="/hackathons">Browse Hackathons</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {registrations.map((reg) => (
                <Card key={reg.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {reg.hackathon.title}
                          <Badge className={getStatusColor(reg.hackathon.status)}>
                            {reg.hackathon.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {reg.mode === "team" ? (
                            <span className="flex items-center gap-1">
                              <Trophy className="h-4 w-4" />
                              Team: {reg.team?.name}
                            </span>
                          ) : (
                            <span>Individual registration</span>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{reg.status}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid gap-2 text-sm md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(reg.hackathon.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(reg.hackathon.endDate)}</span>
                      </div>
                      {isDeadlineSoon(reg.hackathon.registrationDeadline) && (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Ends {formatDate(reg.hackathon.registrationDeadline)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/hackathons/${reg.hackathonId}`}>View Details</Link>
                      </Button>
                      {reg.hackathon.status === "live" && (
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/submissions?hackathonId=${reg.hackathonId}`}>
                            Submit Project
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4 mt-6">
          {submissions.length === 0 ? (
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="pt-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">No submissions yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {submissions.map((sub) => (
                <Card key={sub.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {sub.title}
                        </CardTitle>
                        <CardDescription>{sub.hackathon.title}</CardDescription>
                      </div>
                      <Badge className={getSubmissionStatusColor(sub.status)}>
                        {sub.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {sub.github && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={sub.github} target="_blank" rel="noopener noreferrer">
                            <GitBranch className="h-4 w-4 mr-1" />
                            Repository
                          </a>
                        </Button>
                      )}
                      {sub.demo && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={sub.demo} target="_blank" rel="noopener noreferrer">
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {sub.video && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={sub.video} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-1" />
                            Video
                          </a>
                        </Button>
                      )}
                    </div>

                    {sub.scores && sub.scores.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <h4 className="font-semibold text-sm">Scores</h4>
                        {sub.scores.map((score, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Judge {idx + 1}</span>
                              <span className="font-semibold">{score.total.toFixed(1)}/10</span>
                            </div>
                            {score.feedback && (
                              <p className="text-xs text-muted-foreground italic">{score.feedback}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="w-full"
                    >
                      <Link href={`/dashboard/submissions/${sub.id}`}>
                        {sub.status === "draft" ? "Continue Editing" : "View"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Timeline</CardTitle>
              <CardDescription>Track all your hackathon events and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...registrations]
                  .sort((a, b) => new Date(a.hackathon.startDate).getTime() - new Date(b.hackathon.startDate).getTime())
                  .map((reg) => (
                    <div key={reg.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex flex-col items-center">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div className="my-2 h-12 w-0.5 bg-border"></div>
                      </div>
                      <div className="pt-1">
                        <p className="font-semibold">{reg.hackathon.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(reg.hackathon.startDate)} - {formatDate(reg.hackathon.endDate)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
