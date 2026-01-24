"use client"

import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/components/toast-provider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { HackathonSummary } from "./hackathon-card"

const categories = ["AI", "Blockchain", "Web", "Mobile", "Security", "Data", "Health", "Game"]
const modes = ["Online", "Offline", "Hybrid"]
const difficulties = ["Beginner", "Intermediate", "Advanced"]

type HackathonFormValues = {
  title: string
  description: string
  category: string
  mode: string
  difficulty: string
  prizeAmount: string
  prize: string
  location: string
  startDate: string
  endDate: string
  registrationDeadline: string
  eligibility: string
  banner: string
  tags: string
  isFree: boolean
  featured: boolean
}

interface Props {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess: (hackathon: HackathonSummary) => void
  hackathon?: HackathonSummary
}

function formatDateInput(value?: string | Date) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const iso = date.toISOString()
  return iso.slice(0, 16)
}

export function CreateHackathonDialog({ trigger, open, onOpenChange, onSuccess, hackathon }: Props) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)

  const isEdit = Boolean(hackathon)

  const [form, setForm] = useState<HackathonFormValues>({
    title: hackathon?.title || "",
    description: hackathon?.description || "",
    category: hackathon?.category || categories[0],
    mode: hackathon?.mode || modes[0],
    difficulty: hackathon?.difficulty || difficulties[1],
    prizeAmount: hackathon?.prizeAmount ? String(hackathon.prizeAmount) : "",
    prize: hackathon?.prize || "",
    location: hackathon?.location || "",
    startDate: formatDateInput(hackathon?.startDate),
    endDate: formatDateInput(hackathon?.endDate),
    registrationDeadline: formatDateInput(hackathon?.registrationDeadline),
    eligibility: "",
    banner: hackathon?.banner || "",
    tags: hackathon?.tags?.join(", ") || "",
    isFree: true,
    featured: false,
  })

  const controlledOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  useEffect(() => {
    if (hackathon) {
      setForm((prev) => ({
        ...prev,
        title: hackathon.title,
        description: hackathon.description || "",
        category: hackathon.category,
        mode: hackathon.mode,
        difficulty: hackathon.difficulty || difficulties[1],
        prizeAmount: hackathon.prizeAmount ? String(hackathon.prizeAmount) : "",
        prize: hackathon.prize || "",
        location: hackathon.location || "",
        startDate: formatDateInput(hackathon.startDate),
        endDate: formatDateInput(hackathon.endDate),
        registrationDeadline: formatDateInput(hackathon.registrationDeadline),
        tags: hackathon.tags?.join(", ") || "",
      }))
    }
  }, [hackathon])

  const handleChange = (key: keyof HackathonFormValues, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const payload = useMemo(() => {
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)

    return {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      mode: form.mode,
      difficulty: form.difficulty,
      prizeAmount: form.prizeAmount ? Number(form.prizeAmount) : undefined,
      prize: form.prize.trim() || undefined,
      location: form.location.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      registrationDeadline: form.registrationDeadline,
      eligibility: form.eligibility.trim() || undefined,
      banner: form.banner.trim() || undefined,
      tags,
      isFree: form.isFree,
      featured: form.featured,
    }
  }, [form])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payload.title || !payload.startDate || !payload.endDate || !payload.registrationDeadline) {
      addToast("error", "Please fill required fields")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        hackathon ? `/api/organizer/hackathons/${hackathon.id}` : "/api/organizer/hackathons",
        {
          method: hackathon ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const json = await res.json()
      if (!res.ok) {
        const message = json?.error?.message || json?.error || "Failed to save hackathon"
        addToast("error", message)
        return
      }

      const saved = json.hackathon as HackathonSummary
      onSuccess(saved)
      addToast("success", hackathon ? "Hackathon updated" : "Hackathon created")
      setOpen(false)
    } catch (error) {
      console.error(error)
      addToast("error", "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={controlledOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{hackathon ? "Edit Hackathon" : "Create Hackathon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="AI Innovation Sprint"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Mode *</Label>
              <Select value={form.mode} onValueChange={(v) => handleChange("mode", v)}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {modes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select value={form.difficulty} onValueChange={(v) => handleChange("difficulty", v)}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizeAmount">Prize Amount</Label>
              <Input
                id="prizeAmount"
                type="number"
                min="0"
                value={form.prizeAmount}
                onChange={(e) => handleChange("prizeAmount", e.target.value)}
                placeholder="25000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize">Prize Label</Label>
              <Input
                id="prize"
                value={form.prize}
                onChange={(e) => handleChange("prize", e.target.value)}
                placeholder="$25,000 in prizes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Remote / San Francisco"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner">Banner URL</Label>
              <Input
                id="banner"
                value={form.banner}
                onChange={(e) => handleChange("banner", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationDeadline">Registration Deadline *</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(e) => handleChange("registrationDeadline", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="AI, ML, Agents"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                placeholder="Describe the challenge, expectations, and judging criteria..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="eligibility">Eligibility</Label>
              <Textarea
                id="eligibility"
                value={form.eligibility}
                onChange={(e) => handleChange("eligibility", e.target.value)}
                rows={3}
                placeholder="Who can participate?"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
              <div>
                <p className="text-sm font-medium">Free to join</p>
                <p className="text-xs text-muted-foreground">Mark if there is no entry fee.</p>
              </div>
              <Switch checked={form.isFree} onCheckedChange={(val) => handleChange("isFree", val)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
              <div>
                <p className="text-sm font-medium">Featured</p>
                <p className="text-xs text-muted-foreground">Highlight this hackathon.</p>
              </div>
              <Switch checked={form.featured} onCheckedChange={(val) => handleChange("featured", val)} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
