"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { hackathons } from "@/lib/data"
import {
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  Trophy,
  Users,
  X,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const modes = ["Online", "Offline", "Hybrid"]
const difficulties = ["Beginner", "Intermediate", "Advanced"]
const categories = ["AI", "Blockchain", "Web", "Mobile", "Security", "IoT"]

function FilterSidebar({
  selectedModes,
  setSelectedModes,
  selectedDifficulties,
  setSelectedDifficulties,
  prizeRange,
  setPrizeRange,
  isFreeOnly,
  setIsFreeOnly,
}: {
  selectedModes: string[]
  setSelectedModes: (modes: string[]) => void
  selectedDifficulties: string[]
  setSelectedDifficulties: (difficulties: string[]) => void
  prizeRange: number[]
  setPrizeRange: (range: number[]) => void
  isFreeOnly: boolean
  setIsFreeOnly: (free: boolean) => void
}) {
  const toggleMode = (mode: string) => {
    setSelectedModes(
      selectedModes.includes(mode)
        ? selectedModes.filter((m) => m !== mode)
        : [...selectedModes, mode]
    )
  }

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(
      selectedDifficulties.includes(difficulty)
        ? selectedDifficulties.filter((d) => d !== difficulty)
        : [...selectedDifficulties, difficulty]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Mode</h3>
        <div className="space-y-3">
          {modes.map((mode) => (
            <div key={mode} className="flex items-center gap-2">
              <Checkbox
                id={`mode-${mode}`}
                checked={selectedModes.includes(mode)}
                onCheckedChange={() => toggleMode(mode)}
              />
              <Label htmlFor={`mode-${mode}`} className="text-sm text-muted-foreground">
                {mode}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Difficulty</h3>
        <div className="space-y-3">
          {difficulties.map((difficulty) => (
            <div key={difficulty} className="flex items-center gap-2">
              <Checkbox
                id={`difficulty-${difficulty}`}
                checked={selectedDifficulties.includes(difficulty)}
                onCheckedChange={() => toggleDifficulty(difficulty)}
              />
              <Label htmlFor={`difficulty-${difficulty}`} className="text-sm text-muted-foreground">
                {difficulty}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Prize Range</h3>
        <Slider
          value={prizeRange}
          onValueChange={setPrizeRange}
          max={100000}
          step={5000}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${prizeRange[0].toLocaleString()}</span>
          <span>${prizeRange[1]?.toLocaleString() || "100,000"}+</span>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Entry Fee</h3>
        <div className="flex items-center gap-2">
          <Checkbox
            id="free-only"
            checked={isFreeOnly}
            onCheckedChange={(checked) => setIsFreeOnly(checked as boolean)}
          />
          <Label htmlFor="free-only" className="text-sm text-muted-foreground">
            Free hackathons only
          </Label>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return null
}

export default function HackathonsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedModes, setSelectedModes] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [prizeRange, setPrizeRange] = useState([0])
  const [isFreeOnly, setIsFreeOnly] = useState(false)

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.organizer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMode = selectedModes.length === 0 || selectedModes.includes(h.mode)
    const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(h.difficulty)
    const matchesFree = !isFreeOnly || h.isFree
    return matchesSearch && matchesMode && matchesDifficulty && matchesFree
  })

  const sortedHackathons = [...filteredHackathons].sort((a, b) => {
    if (sortBy === "prize") {
      return parseInt(b.prize.replace(/[^0-9]/g, "")) - parseInt(a.prize.replace(/[^0-9]/g, ""))
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Browse Hackathons</h1>
          <p className="mt-2 text-muted-foreground">
            Discover {hackathons.length}+ hackathons and find your perfect match
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 lg:hidden bg-transparent">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar
                    selectedModes={selectedModes}
                    setSelectedModes={setSelectedModes}
                    selectedDifficulties={selectedDifficulties}
                    setSelectedDifficulties={setSelectedDifficulties}
                    prizeRange={prizeRange}
                    setPrizeRange={setPrizeRange}
                    isFreeOnly={isFreeOnly}
                    setIsFreeOnly={setIsFreeOnly}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 bg-secondary">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="closing">Closing Soon</SelectItem>
                <SelectItem value="prize">Highest Prize</SelectItem>
                <SelectItem value="participants">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(selectedModes.length > 0 || selectedDifficulties.length > 0 || isFreeOnly) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedModes.map((mode) => (
              <Badge key={mode} variant="secondary" className="gap-1">
                {mode}
                <button
                  type="button"
                  onClick={() => setSelectedModes(selectedModes.filter((m) => m !== mode))}
                  className="ml-1"
                  aria-label={`Remove ${mode} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedDifficulties.map((diff) => (
              <Badge key={diff} variant="secondary" className="gap-1">
                {diff}
                <button
                  type="button"
                  onClick={() => setSelectedDifficulties(selectedDifficulties.filter((d) => d !== diff))}
                  className="ml-1"
                  aria-label={`Remove ${diff} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {isFreeOnly && (
              <Badge variant="secondary" className="gap-1">
                Free Only
                <button
                  type="button"
                  onClick={() => setIsFreeOnly(false)}
                  className="ml-1"
                  aria-label="Remove free only filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedModes([])
                setSelectedDifficulties([])
                setIsFreeOnly(false)
              }}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Filters</h2>
              <FilterSidebar
                selectedModes={selectedModes}
                setSelectedModes={setSelectedModes}
                selectedDifficulties={selectedDifficulties}
                setSelectedDifficulties={setSelectedDifficulties}
                prizeRange={prizeRange}
                setPrizeRange={setPrizeRange}
                isFreeOnly={isFreeOnly}
                setIsFreeOnly={setIsFreeOnly}
              />
            </div>
          </aside>

          <div className="flex-1">
            <div className="grid gap-6">
              {sortedHackathons.map((hackathon) => (
                <Card key={hackathon.id} className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative aspect-video w-full md:aspect-auto md:h-auto md:w-64 lg:w-80">
                      <Image
                        src={hackathon.banner || "/placeholder.svg"}
                        alt={hackathon.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 md:bg-gradient-to-l" />
                    </div>
                    <CardContent className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{hackathon.mode}</Badge>
                          <Badge variant="outline">{hackathon.difficulty}</Badge>
                          {hackathon.isFree && <Badge className="bg-green-500/10 text-green-500">Free</Badge>}
                        </div>
                        <h3 className="mt-3 text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                          {hackathon.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          by {hackathon.organizer}
                        </p>
                        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                          {hackathon.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {hackathon.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-5 flex flex-col justify-between gap-4 border-t border-border pt-4 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">{hackathon.prize}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Deadline: {hackathon.deadline}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{hackathon.participants.toLocaleString()} participants</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/hackathons/${hackathon.id}`}>
                            <Button variant="outline">View</Button>
                          </Link>
                          <Link href={`/hackathons/${hackathon.id}#register`}>
                            <Button>Register</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {sortedHackathons.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">No hackathons found</h3>
                <p className="mt-2 text-muted-foreground">Try adjusting your filters or search query</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedModes([])
                    setSelectedDifficulties([])
                    setIsFreeOnly(false)
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export { Loading }
