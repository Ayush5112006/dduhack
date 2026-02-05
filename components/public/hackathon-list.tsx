"use client"

import { useMemo, useState, useEffect } from "react"
import { PublicHackathon, PublicHackathonCard } from "@/components/public/hackathon-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const categories = [
  "Web Development",
  "Mobile",
  "AI/ML",
  "Cloud",
  "Blockchain",
  "IoT",
  "Gaming",
  "Cybersecurity",
  "Healthcare",
  "Education",
  "Finance",
  "Social Impact",
  "Other",
]

const difficulties = ["Beginner", "Intermediate", "Advanced"]
const modes = ["Online", "Offline", "Hybrid"]
const statuses = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Live", value: "live" },
  { label: "Past", value: "past" },
]

const sortOptions = [
  { label: "Latest First", value: "latest" },
  { label: "Ending Soon", value: "ending-soon" },
  { label: "Prize: High to Low", value: "prize-desc" },
  { label: "Prize: Low to High", value: "prize-asc" },
  { label: "Most Popular", value: "popular" },
]

const prizeRanges = [
  { label: "Under $5,000", min: 0, max: 5000 },
  { label: "$5,000 - $10,000", min: 5000, max: 10000 },
  { label: "$10,000 - $25,000", min: 10000, max: 25000 },
  { label: "$25,000 - $50,000", min: 25000, max: 50000 },
  { label: "Above $50,000", min: 50000, max: Infinity },
]

type Props = {
  hackathons: PublicHackathon[]
}

// Filter Section Component
function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  )
}

export function HackathonList({ hackathons }: Props) {
  const [isMounted, setIsMounted] = useState(false)
  
  // Search and Filter States
  const [search, setSearch] = useState<string>("")
  const [showCheatsheet, setShowCheatsheet] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedModes, setSelectedModes] = useState<string[]>([])
  const [selectedPrizeRanges, setSelectedPrizeRanges] = useState<number[]>([])
  
  // Sorting
  const [sortBy, setSortBy] = useState<string>("latest")
  
  // UI State
  const [showCategoryFilter, setShowCategoryFilter] = useState(true)
  const [showStatusFilter, setShowStatusFilter] = useState(true)
  const [showDifficultyFilter, setShowDifficultyFilter] = useState(true)
  const [showModeFilter, setShowModeFilter] = useState(true)
  const [showPrizeFilter, setShowPrizeFilter] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Toggle filter functions
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    )
  }

  const toggleMode = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    )
  }

  const togglePrizeRange = (index: number) => {
    setSelectedPrizeRanges((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const resetFilters = () => {
    setSearch("")
    setSelectedCategories([])
    setSelectedStatuses([])
    setSelectedDifficulties([])
    setSelectedModes([])
    setSelectedPrizeRanges([])
  }

  const hasActiveFilters =
    search ||
    selectedCategories.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedDifficulties.length > 0 ||
    selectedModes.length > 0 ||
    selectedPrizeRanges.length > 0

  // Parse tokenized search query (e.g., status:live category:AI/ML prize:>10000)
  const parsedTokens = useMemo(() => {
    const tokens = {
      text: "",
      status: [] as string[],
      category: [] as string[],
      difficulty: [] as string[],
      mode: [] as string[],
      organizer: [] as string[],
      tag: [] as string[],
      prizeOp: null as null | ">" | "<" | ">=" | "<=" | "=" ,
      prizeVal: null as null | number,
    }

    if (!search) return tokens
    const parts = search.split(/\s+/).filter(Boolean)
    const recognized = ["status", "category", "difficulty", "mode", "organizer", "org", "tag", "prize"]

    const rest: string[] = []
    parts.forEach((p) => {
      const [keyRaw, valRaw] = p.split(":")
      const key = keyRaw?.toLowerCase()
      const val = (valRaw ?? "").trim()
      if (!key || !recognized.includes(key)) {
        rest.push(p)
        return
      }

      switch (key) {
        case "status":
          if (val) tokens.status.push(val.toLowerCase())
          break
        case "category":
          if (val) tokens.category.push(val)
          break
        case "difficulty":
          if (val) tokens.difficulty.push(val)
          break
        case "mode":
          if (val) tokens.mode.push(val)
          break
        case "organizer":
        case "org":
          if (val) tokens.organizer.push(val)
          break
        case "tag":
          if (val) tokens.tag.push(val)
          break
        case "prize": {
          // Supports prize:>10000, prize:<5000, prize:>=25000, prize:=10000
          const m = val.match(/^(>=|<=|>|<|=)?\s*(\d+)$/)
          if (m) {
            const op = (m[1] as any) || ">="
            const num = parseInt(m[2], 10)
            tokens.prizeOp = op as any
            tokens.prizeVal = num
          }
          break
        }
      }
    })

    tokens.text = rest.join(" ")
    return tokens
  }, [search])

  // Filtering logic
  const filtered = useMemo(() => {
    return hackathons.filter((hackathon) => {
      // Text search (non-token residue)
      if (parsedTokens.text) {
        const text = parsedTokens.text.toLowerCase().trim()
        const matchesSearch =
          hackathon.title.toLowerCase().includes(text) ||
          hackathon.description.toLowerCase().includes(text) ||
          hackathon.organizer.toLowerCase().includes(text) ||
          hackathon.location.toLowerCase().includes(text) ||
          (hackathon.tags || []).some((t) => t.toLowerCase().includes(text))
        if (!matchesSearch) return false
      }

      // Category filter
      const categoriesActive = selectedCategories.length > 0 || parsedTokens.category.length > 0
      const categoryMatch =
        (!selectedCategories.length || selectedCategories.includes(hackathon.category)) &&
        (!parsedTokens.category.length || parsedTokens.category.some((c) => c.toLowerCase() === hackathon.category.toLowerCase()))
      if (categoriesActive && !categoryMatch) {
        return false
      }

      // Status filter
      const statusesActive = selectedStatuses.length > 0 || parsedTokens.status.length > 0
      const statusMatch =
        (!selectedStatuses.length || selectedStatuses.includes(hackathon.status)) &&
        (!parsedTokens.status.length || parsedTokens.status.includes(hackathon.status))
      if (statusesActive && !statusMatch) {
        return false
      }

      // Difficulty filter
      const difficultiesActive = selectedDifficulties.length > 0 || parsedTokens.difficulty.length > 0
      const difficultyMatch =
        (!selectedDifficulties.length || (hackathon.difficulty && selectedDifficulties.includes(hackathon.difficulty))) &&
        (!parsedTokens.difficulty.length || (hackathon.difficulty && parsedTokens.difficulty.some((d) => d.toLowerCase() === hackathon.difficulty!.toLowerCase())))
      if (difficultiesActive && !difficultyMatch) {
        return false
      }

      // Mode filter
      const modesActive = selectedModes.length > 0 || parsedTokens.mode.length > 0
      const modeMatch =
        (!selectedModes.length || (hackathon.mode && selectedModes.includes(hackathon.mode))) &&
        (!parsedTokens.mode.length || (hackathon.mode && parsedTokens.mode.some((m) => m.toLowerCase() === hackathon.mode!.toLowerCase())))
      if (modesActive && !modeMatch) {
        return false
      }

      // Organizer token filter
      if (parsedTokens.organizer.length > 0) {
        const orgMatch = parsedTokens.organizer.some((o) =>
          hackathon.organizer.toLowerCase().includes(o.toLowerCase())
        )
        if (!orgMatch) return false
      }

      // Tag token filter
      if (parsedTokens.tag.length > 0) {
        const tags = hackathon.tags || []
        const tagMatch = parsedTokens.tag.some((t) =>
          tags.map((x) => x.toLowerCase()).includes(t.toLowerCase())
        )
        if (!tagMatch) return false
      }

      // Prize range filter
      const prize = hackathon.prizeAmount ?? 0
      if (selectedPrizeRanges.length > 0) {
        const matchesPrizeRange = selectedPrizeRanges.some((index) => {
          const range = prizeRanges[index]
          return prize >= range.min && prize <= range.max
        })
        if (!matchesPrizeRange) return false
      }

      // Prize tokenized filter
      if (parsedTokens.prizeVal !== null && parsedTokens.prizeOp) {
        const target = parsedTokens.prizeVal!
        const op = parsedTokens.prizeOp!
        let ok = true
        switch (op) {
          case ">": ok = prize > target; break
          case "<": ok = prize < target; break
          case ">=": ok = prize >= target; break
          case "<=": ok = prize <= target; break
          case "=": ok = prize === target; break
        }
        if (!ok) return false
      }

      return true
    })
  }, [
    hackathons,
    parsedTokens,
    selectedCategories,
    selectedStatuses,
    selectedDifficulties,
    selectedModes,
    selectedPrizeRanges,
  ])

  // Sorting logic
  const sorted = useMemo(() => {
    const copy = [...filtered]
    switch (sortBy) {
      case "latest":
        return copy.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      case "ending-soon":
        return copy.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      case "prize-desc":
        return copy.sort((a, b) => (b.prizeAmount ?? 0) - (a.prizeAmount ?? 0))
      case "prize-asc":
        return copy.sort((a, b) => (a.prizeAmount ?? 0) - (b.prizeAmount ?? 0))
      case "popular":
        return copy.sort((a, b) => (b.registrations ?? 0) - (a.registrations ?? 0))
      default:
        return copy
    }
  }, [filtered, sortBy])

  // Sidebar Filter Component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection
        title="Category"
        isOpen={showCategoryFilter}
        onToggle={() => setShowCategoryFilter(!showCategoryFilter)}
      >
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat}`}
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <label
                htmlFor={`cat-${cat}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {cat}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Status Filter */}
      <FilterSection
        title="Status"
        isOpen={showStatusFilter}
        onToggle={() => setShowStatusFilter(!showStatusFilter)}
      >
        <div className="space-y-2.5">
          {statuses.map((status) => (
            <div key={status.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status.value}`}
                checked={selectedStatuses.includes(status.value)}
                onCheckedChange={() => toggleStatus(status.value)}
              />
              <label
                htmlFor={`status-${status.value}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {status.label}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Difficulty Filter */}
      <FilterSection
        title="Difficulty"
        isOpen={showDifficultyFilter}
        onToggle={() => setShowDifficultyFilter(!showDifficultyFilter)}
      >
        <div className="space-y-2.5">
          {difficulties.map((diff) => (
            <div key={diff} className="flex items-center space-x-2">
              <Checkbox
                id={`diff-${diff}`}
                checked={selectedDifficulties.includes(diff)}
                onCheckedChange={() => toggleDifficulty(diff)}
              />
              <label
                htmlFor={`diff-${diff}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {diff}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Mode Filter */}
      <FilterSection
        title="Mode"
        isOpen={showModeFilter}
        onToggle={() => setShowModeFilter(!showModeFilter)}
      >
        <div className="space-y-2.5">
          {modes.map((mode) => (
            <div key={mode} className="flex items-center space-x-2">
              <Checkbox
                id={`mode-${mode}`}
                checked={selectedModes.includes(mode)}
                onCheckedChange={() => toggleMode(mode)}
              />
              <label
                htmlFor={`mode-${mode}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {mode}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Prize Range Filter */}
      <FilterSection
        title="Prize Range"
        isOpen={showPrizeFilter}
        onToggle={() => setShowPrizeFilter(!showPrizeFilter)}
      >
        <div className="space-y-2.5">
          {prizeRanges.map((range, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`prize-${index}`}
                checked={selectedPrizeRanges.includes(index)}
                onCheckedChange={() => togglePrizeRange(index)}
              />
              <label
                htmlFor={`prize-${index}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {range.label}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>
    </div>
  )

  if (!isMounted) return null

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20 bg-card border border-border rounded-lg p-4 shadow-sm">
          <FilterSidebar />
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="lg"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg lg:hidden"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto">
          <div className="mt-6">
            <FilterSidebar />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 min-w-0 w-full">
        {/* Search and Sort Bar */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          {/* Search Bar + Cheatsheet */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search hackathons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 h-10 sm:h-12 border-2 focus:border-primary text-sm sm:text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {/* Cheatsheet trigger */}
            <Dialog open={showCheatsheet} onOpenChange={setShowCheatsheet}>
              <DialogTrigger asChild>
                <button
                  aria-label="Search Cheatsheet"
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">Search Cheatsheet</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Use tokens to filter directly in the search bar:</p>
                  <ul className="space-y-1">
                    <li><span className="font-medium text-foreground">status:</span> upcoming | live | past</li>
                    <li><span className="font-medium text-foreground">category:</span> AI/ML | Web Development | Mobile ...</li>
                    <li><span className="font-medium text-foreground">difficulty:</span> Beginner | Intermediate | Advanced</li>
                    <li><span className="font-medium text-foreground">mode:</span> online | offline | hybrid</li>
                    <li><span className="font-medium text-foreground">organizer:</span> Acme | DevClub (alias: org:)</li>
                    <li><span className="font-medium text-foreground">tag:</span> ai | cloud | blockchain ...</li>
                    <li><span className="font-medium text-foreground">prize:</span> &gt;10000, &lt;5000, &gt;=25000, =10000</li>
                  </ul>
                  <p className="pt-2">Example: <span className="text-foreground">status:live category:AI/ML prize:&gt;10000 hackathon</span></p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Filters and Sort */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
            {/* Results Count */}
            <span className="text-xs sm:text-sm font-medium text-foreground">
              {sorted.length} {sorted.length === 1 ? "result" : "results"}
            </span>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">•</span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {selectedCategories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs">
                      {cat}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => toggleCategory(cat)}
                      />
                    </Badge>
                  ))}
                  {selectedStatuses.map((status) => (
                    <Badge key={status} variant="secondary" className="gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs capitalize">
                      {status}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => toggleStatus(status)}
                      />
                    </Badge>
                  ))}
                  {selectedDifficulties.map((diff) => (
                    <Badge key={diff} variant="secondary" className="gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs">
                      {diff}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => toggleDifficulty(diff)}
                      />
                    </Badge>
                  ))}
                  {selectedModes.map((mode) => (
                    <Badge key={mode} variant="secondary" className="gap-1.5 px-2.5 py-1">
                      {mode}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                        onClick={() => toggleMode(mode)} 
                      />
                    </Badge>
                  ))}
                  {selectedPrizeRanges.map((index) => (
                    <Badge key={index} variant="secondary" className="gap-1.5 px-2.5 py-1">
                      {prizeRanges[index].label}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => togglePrizeRange(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {/* Sort Dropdown */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm font-medium border-2 border-border rounded-md px-3 py-1.5 bg-background hover:bg-muted cursor-pointer focus:border-primary outline-none transition-colors"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-muted/30 px-8 py-16 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground">No hackathons found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Try adjusting your filters or search terms to find more hackathons.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters} className="mt-2">
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {sorted.map((hackathon) => (
              <PublicHackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
