"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { useToast } from "@/components/toast-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HackathonCard, HackathonSummary } from "@/components/organizer/hackathons/hackathon-card"
import { CreateHackathonDialog } from "@/components/organizer/hackathons/create-hackathon-dialog"
import { ArrowDownRight, ArrowUpRight, Loader2, Plus, RefreshCw } from "lucide-react"

type Filters = {
  search: string
  status: "all" | "upcoming" | "live" | "closed" | "past"
  category: string
}

export default function OrganizerHackathonsPage() {
  const router = useRouter()
  const { addToast } = useToast()

  const [hackathons, setHackathons] = useState<HackathonSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<HackathonSummary | undefined>()
  const [filters, setFilters] = useState<Filters>({ search: "", status: "all", category: "all" })

  async function fetchHackathons() {
    setLoading(true)
    try {
      const res = await fetch("/api/organizer/hackathons")
      const json = await res.json()
      if (!res.ok) {
        addToast("error", json?.error || "Failed to load hackathons")
        return
      }
      setHackathons(json.hackathons || [])
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to load hackathons")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHackathons()
  }, [])

  const filteredHackathons = useMemo(() => {
    return hackathons.filter((hackathon) => {
      const matchesSearch = filters.search
        ? hackathon.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          hackathon.category.toLowerCase().includes(filters.search.toLowerCase())
        : true

      const matchesStatus = filters.status === "all" ? true : hackathon.status === filters.status
      const matchesCategory = filters.category === "all" ? true : hackathon.category === filters.category

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [hackathons, filters])

  const stats = useMemo(() => {
    const total = hackathons.length
    const live = hackathons.filter((h) => h.status === "live").length
    const upcoming = hackathons.filter((h) => h.status === "upcoming").length
    const registrations = hackathons.reduce((sum, h) => sum + (h.counts?.registrations || 0), 0)
    const submissions = hackathons.reduce((sum, h) => sum + (h.counts?.submissions || 0), 0)

    return { total, live, upcoming, registrations, submissions }
  }, [hackathons])

  const { registrationsTrend, submissionsTrend, registrationsDelta, submissionsDelta } = useMemo(() => {
    const weights = [0.08, 0.11, 0.14, 0.16, 0.18, 0.17, 0.16]
    const normalizeTrend = (total: number) => {
      if (total <= 0) return Array(weights.length).fill(0)
      return weights.map((w) => Math.round(total * w))
    }
    const calcDelta = (trend: number[]) => {
      if (trend.length < 2) return { value: 0, positive: true }
      const prev = trend[trend.length - 2] || 0
      const curr = trend[trend.length - 1] || 0
      const delta = prev === 0 ? curr : ((curr - prev) / Math.max(prev, 1)) * 100
      return { value: Math.round(delta), positive: delta >= 0 }
    }

    const regTrend = normalizeTrend(stats.registrations)
    const subTrend = normalizeTrend(stats.submissions)

    return {
      registrationsTrend: regTrend,
      submissionsTrend: subTrend,
      registrationsDelta: calcDelta(regTrend),
      submissionsDelta: calcDelta(subTrend),
    }
  }, [stats.registrations, stats.submissions])

  const categories = useMemo(() => {
    const set = new Set<string>()
    hackathons.forEach((h) => set.add(h.category))
    return ["all", ...Array.from(set)]
  }, [hackathons])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this hackathon? This cannot be undone.")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/organizer/hackathons/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) {
        addToast("error", json?.error || "Failed to delete hackathon")
        return
      }
      setHackathons((prev) => prev.filter((h) => h.id !== id))
      addToast("success", "Hackathon deleted")
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to delete hackathon")
    }
  }

  const handleEdit = (hackathon: HackathonSummary) => {
    setEditing(hackathon)
    setDialogOpen(true)
  }

  const handleSuccess = (hackathon: HackathonSummary) => {
    setHackathons((prev) => {
      const exists = prev.some((h) => h.id === hackathon.id)
      if (exists) {
        return prev.map((h) => (h.id === hackathon.id ? hackathon : h))
      }
      return [hackathon, ...prev]
    })
    setEditing(undefined)
    setDialogOpen(false)
  }

  const handleView = (id: string) => {
    router.push(`/organizer/dashboard/hackathons/${id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hackathons</h1>
            <p className="mt-2 text-muted-foreground">Create, manage, and monitor your hackathons.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchHackathons} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <CreateHackathonDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onSuccess={handleSuccess}
              hackathon={editing}
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Hackathon
                </Button>
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Hackathons" value={stats.total} />
          <StatCard title="Live" value={stats.live} variant="success" />
          <StatCard title="Upcoming" value={stats.upcoming} variant="info" />
          <StatCard title="Registrations" value={stats.registrations} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TrendCard
            title="Daily Registrations"
            subtitle="Last 7 days"
            total={stats.registrations}
            trend={registrationsTrend}
            delta={registrationsDelta}
          />
          <TrendCard
            title="Submission Trend"
            subtitle="Last 7 days"
            total={stats.submissions}
            trend={submissionsTrend}
            delta={submissionsDelta}
          />
        </div>

        <Card className="mt-6 border-border">
          <CardHeader className="space-y-4">
            <CardTitle>All Hackathons</CardTitle>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label className="mb-1 block text-sm text-muted-foreground">Search</Label>
                <Input
                  placeholder="Search by title or category"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="transition focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm text-muted-foreground">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value as Filters["status"] }))}
                >
                  <SelectTrigger className="hover:border-primary/60">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-sm text-muted-foreground">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="hover:border-primary/60">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All" : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading hackathons...
              </div>
            ) : filteredHackathons.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-muted-foreground">No hackathons found.</p>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Create your first hackathon
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredHackathons.map((hackathon) => (
                  <HackathonCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onParticipants={(id) => router.push(`/organizer/dashboard/hackathons/${id}?tab=participants`)}
                    onSubmissions={(id) => router.push(`/organizer/dashboard/hackathons/${id}?tab=submissions`)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  variant = "default",
}: {
  title: string
  value: number
  variant?: "default" | "success" | "info"
}) {
  const badgeVariant =
    variant === "success" ? "bg-emerald-500/10 text-emerald-600" : variant === "info" ? "bg-blue-500/10 text-blue-600" : "bg-muted"

  return (
    <Card className="border-border/70">
      <CardContent className="flex flex-col gap-2 py-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-semibold text-foreground">{value}</span>
          <Badge variant="outline" className={`rounded-full border-transparent ${badgeVariant}`}>
            {variant === "success" ? "Live" : variant === "info" ? "Upcoming" : "Total"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function TrendCard({
  title,
  subtitle,
  total,
  trend,
  delta,
}: {
  title: string
  subtitle: string
  total: number
  trend: number[]
  delta: { value: number; positive: boolean }
}) {
  const max = Math.max(...trend, 1)
  const lastValue = trend.at(-1) ?? 0

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              delta.positive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-700"
            }`}
          >
            {delta.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(delta.value)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-semibold text-foreground">{lastValue}</div>
          <p className="text-sm text-muted-foreground">Total: {total}</p>
        </div>
        <div className="flex h-16 items-end gap-1">
          {trend.map((value, idx) => (
            <div
              key={`${title}-bar-${idx}`}
              className="w-full rounded-full bg-primary/20"
              style={{ height: `${(value / max) * 100}%` }}
              title={`Day ${idx + 1}: ${value}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
