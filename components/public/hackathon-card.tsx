import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CountdownTimer } from "@/components/public/countdown-timer"
import { Calendar, Clock, Trophy, Users } from "lucide-react"

export type PublicHackathon = {
  id: string
  title: string
  description: string | null
  category: string
  mode: string
  difficulty: string
  prizeAmount: number
  startDate: string
  endDate: string
  registrationDeadline: string
  banner: string | null
  status: "upcoming" | "live" | "past"
  counts?: {
    registrations?: number
    teams?: number
  }
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
  const now = new Date()
  const registrationOpen = new Date(hackathon.registrationDeadline) > now && hackathon.status !== "past"
  const ctaLabel = registrationOpen ? "Register" : "View"
  const ctaVariant = registrationOpen ? "default" : "secondary"
  const registrationCount = hackathon.counts?.registrations ?? 0
  const teamCount = hackathon.counts?.teams ?? 0

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/70">
      <div
        className="h-36 w-full bg-gradient-to-r from-primary/15 via-primary/5 to-transparent"
        style={{
          backgroundImage: hackathon.banner ? `url(${hackathon.banner})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <CardHeader className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-xl leading-tight text-foreground line-clamp-1">{hackathon.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className={`rounded-full border-transparent px-2.5 py-1 capitalize ${statusStyles[hackathon.status]}`}>
                {hackathon.status}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs capitalize">
                {hackathon.category}
              </Badge>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                {hackathon.mode}
              </Badge>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                {hackathon.difficulty}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{hackathon.description || "No description provided."}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-5">
        <CountdownTimer startDate={hackathon.startDate} endDate={hackathon.endDate} />

        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide">Starts</p>
              <p className="font-medium text-foreground">{formatDate(hackathon.startDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide">Ends</p>
              <p className="font-medium text-foreground">{formatDate(hackathon.endDate)}</p>
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
              <p className="text-xs uppercase tracking-wide">Registrations</p>
              <p className="font-medium text-foreground">{registrationCount} regs · {teamCount} teams</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {registrationOpen ? (
              <>Register before {formatDate(hackathon.registrationDeadline)}</>
            ) : (
              <>Registration closed</>
            )}
          </div>
          <Button asChild variant={ctaVariant}>
            <Link href={`/hackathons/${hackathon.id}`}>{ctaLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}