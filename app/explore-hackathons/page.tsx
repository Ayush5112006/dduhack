"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
import { Search, ChevronRight, Calendar, Trophy, Users, Filter, Sparkles, Crown } from "lucide-react"

// Premium tier threshold
const PREMIUM_PRIZE_THRESHOLD = 6000

export default function ExploreHackathonsPage() {
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
      if (!response.ok) throw new Error("Failed to fetch hackathons")
      const data = await response.json()
      setHackathons(data.hackathons || [])
    } catch (error) {
      console.error("Error fetching hackathons:", error)
      setHackathons([])
    } finally {
      setLoading(false)
    }
  }

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      {/* Navbar handled by MainLayout */}

      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Explore Hackathons
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Discover and join amazing hackathons from around the world. Find the perfect event to showcase your skills and win prizes!
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
              placeholder="Search hackathons by name or description..."
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
            {filteredHackathons.map((hackathon) => {
              const isPremium = hackathon.prizeAmount >= PREMIUM_PRIZE_THRESHOLD

              return (
                <Link
                  key={hackathon.id}
                  href={`/hackathons/${hackathon.id}`}
                  className="group"
                >
                  {/* Premium Badge Background */}
                  {isPremium && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-300" />
                  )}

                  <Card className={`h-full border-0 overflow-hidden cursor-pointer relative transition-all duration-300 ${isPremium
                    ? "bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-amber-50/20 border border-amber-200/50 hover:shadow-2xl hover:shadow-amber-500/20"
                    : "bg-gradient-to-br from-secondary/50 to-transparent border-0 hover:shadow-lg"
                    }`}>
                    {/* Premium Crown Badge */}
                    {isPremium && (
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1.5 shadow-lg">
                        <Crown className="h-4 w-4 text-white" />
                        <span className="text-xs font-bold text-white">PREMIUM</span>
                      </div>
                    )}

                    {/* Banner Image with Premium Glow */}
                    {hackathon.banner && (
                      <div className={`h-40 overflow-hidden relative ${isPremium
                        ? "bg-gradient-to-r from-amber-400/30 via-yellow-300/20 to-amber-400/30"
                        : "bg-gradient-to-r from-primary/20 to-primary/10"
                        }`}>
                        <img
                          src={hackathon.banner}
                          alt={hackathon.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {isPremium && (
                          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-transparent" />
                        )}
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className={`text-lg line-clamp-2 group-hover:text-amber-600 transition-colors ${isPremium ? "text-amber-900" : ""
                            }`}>
                            {hackathon.name}
                            {isPremium && <Sparkles className="h-4 w-4 inline ml-1 text-amber-500" />}
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
                          <Badge variant="secondary" className={`w-fit text-xs ${isPremium ? "bg-amber-200/50 text-amber-900 border-amber-300/50" : ""
                            }`}>
                            {hackathon.category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className={`text-sm line-clamp-3 ${isPremium ? "text-amber-900/70" : "text-muted-foreground"
                        }`}>
                        {hackathon.description}
                      </p>

                      {/* Details Grid with Premium Styling */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className={`rounded p-2.5 transition-colors ${isPremium
                          ? "bg-gradient-to-br from-amber-100/60 to-yellow-100/40 border border-amber-200/30"
                          : "rounded bg-background/50"
                          }`}>
                          <p className={`font-medium ${isPremium ? "text-amber-700" : "text-muted-foreground"
                            }`}>
                            Deadline
                          </p>
                          <p className={`font-semibold mt-1 ${isPremium ? "text-amber-900" : "text-foreground"
                            }`}>
                            {new Date(hackathon.registrationDeadline).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </p>
                        </div>
                        <div className={`rounded p-2.5 transition-colors ${isPremium
                          ? "bg-gradient-to-br from-emerald-100/60 to-green-100/40 border border-emerald-200/30"
                          : "rounded bg-background/50"
                          }`}>
                          <p className={`font-medium ${isPremium ? "text-emerald-700" : "text-muted-foreground"
                            }`}>
                            Prize Pool
                          </p>
                          <p className={`font-bold mt-1 text-lg ${isPremium ? "text-emerald-600" : "text-foreground"
                            }`}>
                            ${hackathon.prizeAmount?.toLocaleString('en-US') || "TBA"}
                          </p>
                        </div>
                      </div>

                      {/* Mode and Difficulty */}
                      <div className="flex flex-wrap gap-2">
                        {hackathon.mode && (
                          <Badge variant="outline" className={`text-xs border-0 ${isPremium
                            ? "bg-amber-500/20 text-amber-700 border-amber-300/50"
                            : "bg-primary/10 text-primary"
                            }`}>
                            {hackathon.mode}
                          </Badge>
                        )}
                        {hackathon.difficulty && (
                          <Badge variant="outline" className={`text-xs border-0 ${isPremium
                            ? "bg-orange-500/20 text-orange-700"
                            : "bg-orange-500/10 text-orange-600"
                            }`}>
                            {hackathon.difficulty}
                          </Badge>
                        )}
                      </div>

                      {/* CTA Button with Premium Styling */}
                      <Button
                        variant={isPremium ? "default" : "default"}
                        size="sm"
                        className={`w-full group/btn mt-2 transition-all ${isPremium
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-amber-500/30"
                          : ""
                          }`}
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(`/hackathons/${hackathon.id}`)
                        }}
                      >
                        {isPremium ? "🏆 Register Now" : "View Details"}
                        <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
