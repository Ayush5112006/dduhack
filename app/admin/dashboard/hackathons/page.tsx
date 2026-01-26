"use client"

import { useEffect, useState } from "react"
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
import { Search, Loader2, MoreHorizontal, Eye, Trash2, Calendar } from "lucide-react"
import { useToast } from "@/components/toast-provider"
import Link from "next/link"

type Hackathon = {
  id: string
  title: string
  organizer: string
  status: string
  startDate: string
  endDate: string
  registrations: number
  submissions: number
  prizeAmount: number
  category: string
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { addToast } = useToast()

  useEffect(() => {
    fetchHackathons()
  }, [])

  const fetchHackathons = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/hackathons/all")
      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
      }
    } catch (error) {
      console.error("Failed to fetch hackathons:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (hackathonId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        addToast("success", `Hackathon status updated to ${status}`)
        fetchHackathons()
      }
    } catch (error) {
      addToast("error", "Failed to update hackathon status")
    }
  }

  const handleDeleteHackathon = async (hackathonId: string) => {
    if (!confirm("Are you sure you want to delete this hackathon?")) return
    try {
      const response = await fetch(`/api/admin/hackathons/${hackathonId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        addToast("success", "Hackathon deleted")
        fetchHackathons()
      }
    } catch (error) {
      addToast("error", "Failed to delete hackathon")
    }
  }

  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || hackathon.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar type="admin" />
      <main className="flex-1 p-8 ml-0 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Hackathons Management</h1>
            <p className="text-muted-foreground">Manage all platform hackathons</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>All Hackathons ({filteredHackathons.length})</CardTitle>
                <div className="flex items-center gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="past">Past</option>
                  </select>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search hackathons..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredHackathons.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hackathons found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Registrations</TableHead>
                      <TableHead>Prize Pool</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHackathons.map((hackathon) => (
                      <TableRow key={hackathon.id}>
                        <TableCell className="font-medium">{hackathon.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                              {hackathon.organizer.charAt(0).toUpperCase()}
                            </div>
                            <span>{hackathon.organizer}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              hackathon.status === "live"
                                ? "default"
                                : hackathon.status === "upcoming"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {hackathon.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{hackathon.startDate ? new Date(hackathon.startDate).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell>{hackathon.registrations || 0}</TableCell>
                        <TableCell>${(hackathon.prizeAmount || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/hackathons/${hackathon.id}`} className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(hackathon.id, "live")}
                                className="gap-2"
                              >
                                Set as Live
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(hackathon.id, "past")}
                                className="gap-2"
                              >
                                Set as Past
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteHackathon(hackathon.id)}
                                className="gap-2 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
