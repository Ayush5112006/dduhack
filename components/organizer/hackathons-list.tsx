"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { HackathonCard } from "./hackathon-card"
import { CreateHackathonDialog } from "./create-hackathon-dialog"
import { useToast } from "@/components/toast-provider"

interface Hackathon {
  id: string
  title: string
  description?: string
  status: string
  mode: string
  category: string
  startDate: string | Date
  endDate: string | Date
  registrationDeadline: string | Date
  participants: number
  difficulty: string
  prizeAmount: number
  location?: string
  banner?: string
  _count?: {
    registrations: number
    submissions: number
    teams: number
  }
}

export function HackathonsList() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { addToast } = useToast()

  const loadHackathons = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/organizer/hackathons", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setHackathons(data.hackathons || [])
        setFilteredHackathons(data.hackathons || [])
      } else {
        addToast("error", "Failed to load hackathons")
      }
    } catch (error) {
      console.error("Error:", error)
      addToast("error", "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHackathons()
  }, [])

  useEffect(() => {
    let filtered = hackathons

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((h) =>
        h.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((h) => h.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((h) => h.category === categoryFilter)
    }

    setFilteredHackathons(filtered)
  }, [searchQuery, statusFilter, categoryFilter, hackathons])

  const stats = [
    {
      label: "Total Hackathons",
      value: hackathons.length,
      color: "text-blue-600",
    },
    {
      label: "Live",
      value: hackathons.filter((h) => h.status === "live").length,
      color: "text-green-600",
    },
    {
      label: "Upcoming",
      value: hackathons.filter((h) => h.status === "upcoming").length,
      color: "text-orange-600",
    },
    {
      label: "Total Registrations",
      value: hackathons.reduce((sum, h) => sum + (h._count?.registrations || 0), 0),
      color: "text-purple-600",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading hackathons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header with controls */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>My Hackathons</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your hosted hackathons
            </p>
          </div>
          <CreateHackathonDialog onHackathonCreated={(h) => {
            setHackathons([h, ...hackathons])
            setFilteredHackathons([h, ...filteredHackathons])
          }} />
        </CardHeader>
      </Card>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search hackathons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Web Development">Web Development</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
              <SelectItem value="AI/ML">AI/ML</SelectItem>
              <SelectItem value="Cloud">Cloud</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hackathons Grid */}
      {filteredHackathons.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                No hackathons found
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first hackathon to get started"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon.id}
              hackathon={hackathon}
              onUpdate={loadHackathons}
            />
          ))}
        </div>
      )}
    </div>
  )
}
