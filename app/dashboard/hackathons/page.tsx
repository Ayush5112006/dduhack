"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { SubmissionForm } from "@/components/submissions/submission-form"
import { isUserInTeam, getTeamDetails } from "@/lib/team-utils"

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
  teamId?: string
  teamName?: string
  teamMembers?: number
  minTeamSize?: number
  maxTeamSize?: number
  allowTeams?: boolean
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
    <div className="min-h-screen bg-transparent">
      <main className="px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">My Hackathons</h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-muted-foreground">
            Manage your hackathon registrations and submissions
          </p>
        </div>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg md:text-xl">Your Hackathons</CardTitle>
            <Link href="/hackathons">
              <Button className="gap-2 h-10 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Browse More</span><span className="sm:hidden">Browse</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search hackathons..."
                  className="pl-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground">Loading registrations...</p>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 sm:p-8 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {registrations.length === 0
                    ? "You haven't registered for any hackathons yet"
                    : "No hackathons match your search"}
                </p>
                <Link href="/hackathons">
                  <Button variant="outline" className="mt-4 h-10 text-sm">
                    Explore Hackathons
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 sm:-mx-0">
                <div className="inline-block min-w-full px-6 sm:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Name</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Category</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden md:table-cell">Mode</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Dates</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Prize Pool</TableHead>
                        <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium text-foreground text-xs sm:text-sm">
                            {registration.hackathonTitle}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary" className="text-xs">{registration.category}</Badge>
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
                                  ? "bg-emerald-500/10 text-emerald-600 text-xs"
                                  : registration.status === "upcoming"
                                    ? "bg-blue-500/10 text-blue-600 text-xs"
                                    : "text-xs"
                              }
                            >
                              {registration.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground capitalize text-xs sm:text-sm hidden md:table-cell">
                            {registration.mode}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs sm:text-sm flex items-center gap-1 hidden lg:flex">
                            <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xl:inline">{formatDate(registration.startDate)} - {formatDate(registration.endDate)}</span>
                            <span className="xl:hidden">{formatDate(registration.startDate)}</span>
                          </TableCell>
                          <TableCell className="font-medium text-foreground text-xs sm:text-sm hidden lg:table-cell">
                            ${registration.prizeAmount.toLocaleString('en-US')}
                          </TableCell>
                          <TableCell className="text-right flex items-center justify-end gap-2">
                            {registration.status === "live" && (
                              <SubmissionForm
                                hackathonId={registration.hackathonId}
                                hackathonTitle={registration.hackathonTitle}
                                isAuthenticated={true}
                                isRegistered={true}
                                // Pass team details if available
                                teamMode={registration.allowTeams && !!registration.teamId}
                                teamId={registration.teamId}
                                teamName={registration.teamName}
                                teamMembers={registration.teamMembers}
                                minTeamSize={registration.minTeamSize}
                                maxTeamSize={registration.maxTeamSize}
                                hackathonEndDate={registration.endDate}
                              />
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild className="gap-2 text-xs sm:text-sm">
                                  <Link href={`/hackathons/${registration.hackathonId}`}>
                                    <ExternalLink className="h-4 w-4" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleWithdraw(registration.id)}
                                  className="gap-2 text-destructive text-xs sm:text-sm"
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
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4 sm:mt-6 border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg md:text-xl">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Registered
                </p>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
                  {registrations.length}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Live Events
                </p>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
                  {registrations.filter((r) => r.status === "live").length}
                </p>
              </div>
              <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Upcoming
                </p>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
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
