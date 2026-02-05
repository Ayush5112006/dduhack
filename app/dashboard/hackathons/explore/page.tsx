"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ChevronRight, ChevronLeft, Calendar, Trophy, Users, Filter } from "lucide-react"

export default function DashboardExploreHackathonsPage() {
  const router = useRouter()
  const [hackathons, setHackathons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchHackathons()
  }, [])

  async function fetchHackathons() {
    try {
      setLoading(true)
      const response = await fetch("/api/public/hackathons")
      if (!response.ok) {
        console.error("API Error:", response.status, response.statusText)
        throw new Error("Failed to fetch hackathons")
      }
      const data = await response.json()
      console.log("Hackathons fetched:", data)

      // Handle both 'hackathons' and 'data' response formats
      const hackathonsList = data.hackathons || data.data || []
      setHackathons(Array.isArray(hackathonsList) ? hackathonsList : [])
    } catch (error) {
      console.error("Error fetching hackathons:", error)
      setHackathons([])
    } finally {
      setLoading(false)
    }
  }

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      (h.title || h.name)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || h.status === statusFilter
    const matchesCategory = categoryFilter === "all" || h.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const categories = Array.from(
    new Set(hackathons.map((h) => h.category).filter(Boolean))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
      case "upcoming":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30"
      case "past":
        return "bg-slate-500/10 text-slate-600 border-slate-500/30"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />

      <main className="lg:ml-64 px-3 py-4 sm:px-4 sm:py-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Back Button */}
        <Link href="/dashboard/hackathons" className="inline-block mb-6">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to My Hackathons
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Explore Hackathons
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Discover and register for amazing hackathons. Find the perfect event to showcase your skills and win prizes!
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {hackathons.length} Hackathons
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {hackathons.filter((h) => h.status === "live").length} Live
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 lg:flex lg:gap-4 lg:space-y-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary/50 pl-10 py-2 h-auto text-base border-0"
            />
          </div>

          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40 bg-secondary/50 border-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-40 bg-secondary/50 border-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hackathons Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-lg bg-secondary/50 animate-pulse"
              />
            ))}
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-12 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              No hackathons found
            </p>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHackathons.map((hackathon) => (
              <Card
                key={hackathon.id}
                className="border-0 bg-gradient-to-br from-secondary/50 to-transparent hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Banner Image */}
                {hackathon.banner && (
                  <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/10 overflow-hidden">
                    <img
                      src={hackathon.banner}
                      alt={hackathon.title || hackathon.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2 hover:text-primary transition-colors">
                        {hackathon.title || hackathon.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 ${getStatusColor(
                          hackathon.status
                        )}`}
                      >
                        {hackathon.status}
                      </Badge>
                    </div>
                    {hackathon.category && (
                      <Badge variant="secondary" className="w-fit text-xs">
                        {hackathon.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {hackathon.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded bg-background/50 p-2.5">
                      <p className="text-muted-foreground font-medium">Deadline</p>
                      <p className="font-semibold text-foreground mt-1">
                        {new Date(hackathon.registrationDeadline).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </p>
                    </div>
                    <div className="rounded bg-background/50 p-2.5">
                      <p className="text-muted-foreground font-medium">Prize</p>
                      <p className="font-semibold text-foreground mt-1">
                        ${hackathon.prizeAmount?.toLocaleString('en-US') || "TBA"}
                      </p>
                    </div>
                  </div>

                  {/* Mode and Difficulty */}
                  <div className="flex flex-wrap gap-2">
                    {hackathon.mode && (
                      <Badge variant="outline" className="text-xs border-0 bg-primary/10 text-primary">
                        {hackathon.mode}
                      </Badge>
                    )}
                    {hackathon.difficulty && (
                      <Badge variant="outline" className="text-xs border-0 bg-orange-500/10 text-orange-600">
                        {hackathon.difficulty}
                      </Badge>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link href={`/hackathons/${hackathon.id}`} className="block">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full group/btn mt-2"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
