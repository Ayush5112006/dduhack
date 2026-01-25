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
    <Card className="flex h-full flex-col overflow-hidden border-border/70 transition-shadow hover:shadow-lg">
      <div
        className="h-36 w-full bg-gradient-to-r from-primary/15 via-primary/5 to-transparent"
      />
      <CardHeader className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-xl leading-tight text-foreground line-clamp-2">{hackathon.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className={`rounded-full border-transparent px-2.5 py-1 capitalize ${statusStyles[hackathon.status]}`}>
                {hackathon.status}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs capitalize">
                {hackathon.category}
              </Badge>
              {hackathon.mode && (
                <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                  {hackathon.mode}
                </Badge>
              )}
              {hackathon.difficulty && (
                <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                  {hackathon.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{hackathon.description || "No description provided."}</p>
        <p className="text-xs text-muted-foreground">
          By {hackathon.organizer}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-5">
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide">Starts</p>
              <p className="font-medium text-foreground">{formatDate(hackathon.startDate.toString())}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide">Ends</p>
              <p className="font-medium text-foreground">{formatDate(hackathon.endDate.toString())}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide">Prize Pool</p>
              <p className="font-medium text-foreground">${prizeFormatter.format(hackathon.prizeAmount || 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide">Participants</p>
              <p className="font-medium text-foreground">{hackathon.registrations}</p>
            </div>
          </div>
        </div>

        {hackathon.tags && hackathon.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hackathon.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {hackathon.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{hackathon.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild variant={ctaVariant} className="flex-1">
            <Link href={`/hackathons/${hackathon.id}`}>{ctaLabel}</Link>
          </Button>
          {hackathon.problemStatementPdf && (
            <Button asChild variant="outline" size="icon" title="Download Problem Statement">
              <a href={hackathon.problemStatementPdf} download>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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