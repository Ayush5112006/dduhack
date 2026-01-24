"use client"

import { useMemo, useState } from "react"
import { PublicHackathon, PublicHackathonCard } from "@/components/public/hackathon-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const categories = [
  { label: "All", value: "all" },
  { label: "Web Development", value: "Web Development" },
  { label: "Mobile", value: "Mobile" },
  { label: "AI/ML", value: "AI/ML" },
  { label: "Cloud", value: "Cloud" },
  { label: "Other", value: "Other" },
]

type Props = {
  hackathons: PublicHackathon[]
}

export function HackathonList({ hackathons }: Props) {
  const [category, setCategory] = useState<string>("all")
  const [minPrize, setMinPrize] = useState<string>("")
  const [maxPrize, setMaxPrize] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  const resetFilters = () => {
    setCategory("all")
    setMinPrize("")
    setMaxPrize("")
    setStartDate("")
    setEndDate("")
  }

  const filtered = useMemo(() => {
    const min = Number(minPrize)
    const max = Number(maxPrize)
    const hasMin = !Number.isNaN(min) && minPrize !== ""
    const hasMax = !Number.isNaN(max) && maxPrize !== ""

    const from = startDate ? new Date(startDate) : null
    const to = endDate ? new Date(endDate) : null

    const hasInvalidRange = from && to && from > to

    return hackathons.filter((hackathon) => {
      if (hasInvalidRange) return false

      const matchesCategory = category === "all" || hackathon.category === category

      const prize = hackathon.prizeAmount ?? 0
      if (hasMin && prize < min) return false
      if (hasMax && prize > max) return false

      const start = new Date(hackathon.startDate)
      const end = new Date(hackathon.endDate)

      if (from && end < from) return false
      if (to && start > to) return false

      return matchesCategory
    })
  }, [category, endDate, hackathons, maxPrize, minPrize, startDate])

  const invalidRange = useMemo(() => {
    if (!startDate || !endDate) return false
    const from = new Date(startDate)
    const to = new Date(endDate)
    return from > to
  }, [startDate, endDate])

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="filters">
        <AccordionItem value="filters" className="border border-border/60 rounded-xl bg-muted/40">
          <AccordionTrigger className="px-4 py-3 text-sm font-semibold">Filters</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="bg-background">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPrize">Min Prize</Label>
                <Input
                  id="minPrize"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={minPrize}
                  onChange={(e) => setMinPrize(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrize">Max Prize</Label>
                <Input
                  id="maxPrize"
                  type="number"
                  inputMode="numeric"
                  placeholder="50000"
                  value={maxPrize}
                  onChange={(e) => setMaxPrize(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date (from)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (to)</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset
              </Button>
              {invalidRange && <p className="text-sm text-destructive">Start date must be before end date.</p>}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-8 py-12 text-center">
          <p className="text-lg font-semibold text-foreground">No hackathons match these filters</p>
          <p className="text-sm text-muted-foreground">Try adjusting the category, prize, or date range.</p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((hackathon) => (
            <PublicHackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>
      )}
    </div>
  )
}