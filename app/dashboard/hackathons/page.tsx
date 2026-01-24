"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { Search, MoreHorizontal, ExternalLink, Trash2, CalendarDays, Loader2 } from "lucide-react"
import { useToast } from "@/components/toast-provider"

type Registration = {
  id: string
  hackathonId: string
  hackathonTitle: string
  startDate: string
  endDate: string
  status: string
  prizeAmount: number
  category: string
  mode: string
  registrationStatus: string
  registeredAt: string
}

export default function ParticipantHackathonsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    fetchRegistrations()
  }, [])

  async function fetchRegistrations() {
    setLoading(true)
    try {
      const res = await fetch("/api/participant/registrations")
      const data = await res.json()
      
      if (!res.ok) {
        addToast("error", data.error || "Failed to load registrations")
        return
      }

      setRegistrations(data.registrations || [])
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to load registrations")
    } finally {
      setLoading(false)
    }
  }

  const filteredRegistrations = registrations.filter((r) =>
    r.hackathonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleWithdraw = async (id: string) => {
    if (!confirm("Withdraw from this hackathon?")) return

    try {
      const res = await fetch(`/api/participant/registrations/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        addToast("error", data.error || "Failed to withdraw")
        return
      }

      setRegistrations(registrations.filter((r) => r.id !== id))
      addToast("success", "Withdrawn successfully!")
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to withdraw")
    }
  }

  const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Hackathons</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your hackathon registrations and submissions
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Hackathons</CardTitle>
            <Link href="/hackathons">
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Browse More
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search hackathons..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading registrations...</p>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-muted-foreground">
                  {registrations.length === 0
                    ? "You haven't registered for any hackathons yet"
                    : "No hackathons match your search"}
                </p>
                <Link href="/hackathons">
                  <Button variant="outline" className="mt-4">
                    Explore Hackathons
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Prize Pool</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium text-foreground">
                          {registration.hackathonTitle}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{registration.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              registration.status === "live"
                                ? "default"
                                : registration.status === "upcoming"
                                ? "outline"
                                : "secondary"
                            }
                            className={
                              registration.status === "live"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : registration.status === "upcoming"
                                ? "bg-blue-500/10 text-blue-600"
                                : ""
                            }
                          >
                            {registration.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">
                          {registration.mode}
                        </TableCell>
                        <TableCell className="text-muted-foreground flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(registration.startDate)} - {formatDate(registration.endDate)}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          ${registration.prizeAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild className="gap-2">
                                <Link href={`/hackathons/${registration.hackathonId}`}>
                                  <ExternalLink className="h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleWithdraw(registration.id)}
                                className="gap-2 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Withdraw
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

        <Card className="mt-6 border-border bg-card">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Registered
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {registrations.length}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Live Events
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {registrations.filter((r) => r.status === "live").length}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {registrations.filter((r) => r.status === "upcoming").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
