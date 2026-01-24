"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { CreateHackathonDialog } from "@/components/organizer/hackathons/create-hackathon-dialog"
import { HackathonSummary } from "@/components/organizer/hackathons/hackathon-card"
import { useToast } from "@/components/toast-provider"
import { CalendarDays, Loader2, MapPin, Pencil, RefreshCw, ShieldAlert, Trophy, Users } from "lucide-react"

type HackathonDetail = HackathonSummary & {
  eligibility?: string
  createdAt?: string
  updatedAt?: string
}

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function HackathonDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [hackathon, setHackathon] = useState<HackathonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const activeTab = useMemo(() => searchParams.get("tab") || "details", [searchParams])

  async function fetchHackathon() {
    setLoading(true)
    try {
      const res = await fetch(`/api/organizer/hackathons/${params.id}`)
      const json = await res.json()
      if (!res.ok) {
        addToast("error", json?.error || "Failed to load hackathon")
        return
      }
      setHackathon(json.hackathon)
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to load hackathon")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHackathon()
  }, [params.id])

  const handleSuccess = (updated: HackathonSummary) => {
    setHackathon((prev) => (prev ? { ...prev, ...updated } : updated))
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this hackathon? This action cannot be undone.")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/organizer/hackathons/${params.id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) {
        addToast("error", json?.error || "Failed to delete hackathon")
        return
      }
      addToast("success", "Hackathon deleted")
      router.push("/organizer/dashboard/hackathons")
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to delete hackathon")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar type="organizer" />
        <main className="ml-64 flex items-center justify-center p-8 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading hackathon...
        </main>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar type="organizer" />
        <main className="ml-64 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500" />
          <p className="text-muted-foreground">Hackathon not found.</p>
          <Button onClick={() => router.push("/organizer/dashboard/hackathons")}>Back to list</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs capitalize">
                {hackathon.status}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {hackathon.category}
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">{hackathon.title}</h1>
            <p className="mt-2 text-muted-foreground">{hackathon.description || "No description provided."}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1">Start: {formatDate(hackathon.startDate)}</span>
              <span className="rounded-full bg-muted px-3 py-1">End: {formatDate(hackathon.endDate)}</span>
              <span className="rounded-full bg-muted px-3 py-1">Reg deadline: {formatDate(hackathon.registrationDeadline)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchHackathon}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
            <CreateHackathonDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onSuccess={handleSuccess}
              hackathon={hackathon}
              trigger={
                <Button size="sm" className="gap-2">
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              }
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="border-border/70">
            <CardContent className="flex items-center gap-3 py-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Registrations</p>
                <p className="text-2xl font-semibold text-foreground">{hackathon.counts.registrations}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="flex items-center gap-3 py-4">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Submissions</p>
                <p className="text-2xl font-semibold text-foreground">{hackathon.counts.submissions}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="flex items-center gap-3 py-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Teams</p>
                <p className="text-2xl font-semibold text-foreground">{hackathon.counts.teams}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-border/80">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <CalendarDays className="mt-1 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Timeline</p>
                <p>Starts {formatDate(hackathon.startDate)}</p>
                <p>Ends {formatDate(hackathon.endDate)}</p>
                <p>Registration closes {formatDate(hackathon.registrationDeadline)}</p>
              </div>
            </div>
            {hackathon.location && (
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <p>{hackathon.location}</p>
                </div>
              </div>
            )}
            {hackathon.eligibility && (
              <div className="text-sm text-muted-foreground md:col-span-2">
                <p className="font-medium text-foreground">Eligibility</p>
                <p className="mt-1 whitespace-pre-line">{hackathon.eligibility}</p>
              </div>
            )}
            {hackathon.tags && hackathon.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 md:col-span-2">
                {hackathon.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full px-3 py-1 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 border-border/80">
          <CardHeader>
            <Tabs defaultValue={activeTab} value={activeTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab}>
              <TabsContent value="details" className="space-y-3 text-sm text-muted-foreground">
                <p className="whitespace-pre-line">{hackathon.description || "No description yet."}</p>
                <p className="text-xs text-muted-foreground">Last updated {hackathon.updatedAt ? formatDate(hackathon.updatedAt) : ""}</p>
              </TabsContent>
              <TabsContent value="participants" className="text-sm text-muted-foreground">
                Participant list coming soon. Track registrations in the API counts above for now.
              </TabsContent>
              <TabsContent value="submissions" className="text-sm text-muted-foreground">
                Submissions management will live here. Hook up to submissions API when ready.
              </TabsContent>
              <TabsContent value="settings" className="text-sm text-muted-foreground space-y-2">
                <p>Use the edit button to update metadata, timelines, and visibility.</p>
                <p className="text-destructive">Danger: deleting this hackathon removes registrations and submissions.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
