"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CountdownTimer } from "@/components/public/countdown-timer"
import { Calendar, Clock, Trophy, Users } from "lucide-react"

export type PublicHackathon = {
  id: string
  title: string
  description: string
  organizer: string
  category: string
  status: "upcoming" | "live" | "past"
  difficulty?: string
  mode?: string
  startDate: Date
  endDate: Date
  location: string
  prizeAmount: number
  registrations: number
  submissions: number
  tags?: string[]
  problemStatementPdf?: string
}

const statusStyles: Record<PublicHackathon["status"], string> = {
  upcoming: "bg-blue-500/10 text-blue-600",
  live: "bg-emerald-500/10 text-emerald-600",
  past: "bg-slate-500/10 text-slate-600",
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

const prizeFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function PublicHackathonCard({ hackathon }: { hackathon: PublicHackathon }) {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false)
  
  useEffect(() => {
    setIsRegistrationOpen(hackathon.status === "upcoming" || hackathon.status === "live")
  }, [hackathon.status])
  
  const ctaLabel = isRegistrationOpen ? "Register" : "View Details"
  const ctaVariant = isRegistrationOpen ? "default" : "secondary"

  return (
    <Card className="flex h-full flex-col overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-sm hover:shadow-lg transition-all duration-300">
      <div
        className="h-24 sm:h-36 w-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-small-white/5"></div>
      </div>
      <CardHeader className="flex flex-1 flex-col gap-2 sm:gap-3 px-4 sm:px-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg lg:text-xl leading-tight text-foreground line-clamp-2 font-bold">{hackathon.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className={`rounded-full border-0 px-2 sm:px-2.5 py-0.5 sm:py-1 capitalize text-xs font-medium ${statusStyles[hackathon.status]}`}>
                {hackathon.status}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs capitalize bg-secondary/70 border-0">
                {hackathon.category}
              </Badge>
              {hackathon.mode && (
                <Badge variant="outline" className="rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs border-0 bg-background/60">
                  {hackathon.mode}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">{hackathon.description || "No description provided."}</p>
        <p className="text-xs text-muted-foreground/75 font-medium">
          by <span className="text-foreground font-semibold">{hackathon.organizer}</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:gap-4 pb-4 sm:pb-5 px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2 sm:p-2.5 text-xs sm:text-sm">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground/75 font-medium">Starts</p>
              <p className="font-semibold text-foreground text-xs sm:text-sm truncate">{formatDate(hackathon.startDate.toString())}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2 sm:p-2.5 text-xs sm:text-sm">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground/75 font-medium">Ends</p>
              <p className="font-semibold text-foreground text-xs sm:text-sm truncate">{formatDate(hackathon.endDate.toString())}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2 sm:p-2.5 text-xs sm:text-sm">
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground/75 font-medium">Prize</p>
              <p className="font-semibold text-foreground text-xs sm:text-sm truncate">${prizeFormatter.format(hackathon.prizeAmount || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-background/60 rounded-lg p-2 sm:p-2.5 text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground/75 font-medium">Registered</p>
              <p className="font-semibold text-foreground text-xs sm:text-sm">{hackathon.registrations}</p>
            </div>
          </div>
        </div>

        {hackathon.tags && hackathon.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {hackathon.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5 sm:py-1 bg-background/60 border-border/50">
                #{tag}
              </Badge>
            ))}
            {hackathon.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 sm:py-1 bg-background/60 border-border/50">
                +{hackathon.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button asChild variant={ctaVariant} className="flex-1 text-xs sm:text-sm h-9 sm:h-10 font-semibold">
            <Link href={`/hackathons/${hackathon.id}`}>{ctaLabel}</Link>
          </Button>
          {hackathon.problemStatementPdf && (
            <Button asChild variant="outline" size="icon" title="Download Problem Statement" className="h-9 sm:h-10 w-9 sm:w-10 border-0 bg-background/60 hover:bg-secondary">
              <a href={hackathon.problemStatementPdf} download>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}