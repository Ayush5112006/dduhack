"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarDays, MapPin, MoreHorizontal, Pencil, Users, Trophy, Trash2, ArrowRight, Layers } from "lucide-react"

export type HackathonSummary = {
  id: string
  title: string
  description?: string
  category: string
  mode: string
  difficulty?: string
  prize?: string | null
  prizeAmount?: number
  location?: string | null
  banner?: string | null
  startDate: string | Date
  endDate: string | Date
  registrationDeadline: string | Date
  status: "upcoming" | "live" | "closed" | "past"
  tags?: string[]
  counts: {
    registrations: number
    submissions: number
    teams: number
  }
}

interface Props {
  hackathon: HackathonSummary
  onView: (id: string) => void
  onEdit: (hackathon: HackathonSummary) => void
  onDelete: (id: string) => void
  onParticipants?: (id: string) => void
  onSubmissions?: (id: string) => void
}

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function HackathonCard({ hackathon, onView, onEdit, onDelete, onParticipants, onSubmissions }: Props) {
  return (
    <Card className="h-full border border-border/60 shadow-sm transition hover:-translate-y-1 hover:border-border hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-xl font-semibold leading-tight text-foreground line-clamp-1">
              {hackathon.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs capitalize bg-muted/60 border-border/70">
                {hackathon.status}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                {hackathon.category}
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs bg-muted/60 border-border/70">
                {hackathon.mode}
              </Badge>
              {hackathon.difficulty && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs bg-muted/60 border-border/70">
                  {hackathon.difficulty}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(hackathon.id)} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(hackathon)} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {onParticipants && (
                <DropdownMenuItem onClick={() => onParticipants(hackathon.id)} className="gap-2">
                  <Users className="h-4 w-4" />
                  Participants
                </DropdownMenuItem>
              )}
              {onSubmissions && (
                <DropdownMenuItem onClick={() => onSubmissions(hackathon.id)} className="gap-2">
                  <Layers className="h-4 w-4" />
                  Submissions
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(hackathon.id)} className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{hackathon.description || "No description provided."}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide">Starts</p>
              <p className="font-medium text-foreground">{formatDate(hackathon.startDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide">Ends</p>
              <p className="font-medium text-foreground">{formatDate(hackathon.endDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-xs uppercase tracking-wide">Registration</p>
              <p className="font-medium text-foreground">{formatDate(hackathon.registrationDeadline)}</p>
            </div>
          </div>
          {hackathon.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide">Location</p>
                <p className="font-medium text-foreground">{hackathon.location}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 hover:bg-muted/80 transition">
            <Users className="h-4 w-4 text-primary" />
            <span>{hackathon.counts.registrations} registered</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 hover:bg-muted/80 transition">
            <Layers className="h-4 w-4 text-primary" />
            <span>{hackathon.counts.submissions} submissions</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 hover:bg-muted/80 transition">
            <Trophy className="h-4 w-4 text-primary" />
            <span>{hackathon.counts.teams} teams</span>
          </div>
        </div>
        {(() => {
          const tags = Array.isArray(hackathon.tags) ? hackathon.tags : (typeof hackathon.tags === 'string' ? (() => { try { return JSON.parse(hackathon.tags); } catch { return []; } })() : []);
          return tags && tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full px-3 py-1 text-xs bg-muted/40 border-border/60">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null;
        })()}
      </CardContent>
    </Card>
  )
}
