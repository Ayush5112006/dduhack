import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Trophy,
  Users,
  MapPin,
  Share2,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { RegisterButton } from "@/components/hackathons/register-button"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getHackathonDetail(id: string) {
  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    include: {
      owner: true,
      _count: {
        select: {
          registrations: true,
          submissions: true,
        },
      },
    },
  })

  return hackathon
}

async function checkUserRegistration(hackathonId: string, userId: string) {
  const registration = await prisma.registration.findUnique({
    where: {
      userId_hackathonId: {
        userId,
        hackathonId,
      },
    },
  })
  return !!registration
}

const computeStatus = (startDate: Date, endDate: Date): string => {
  const now = new Date()
  if (now < startDate) return "upcoming"
  if (now > endDate) return "past"
  return "live"
}

export default async function HackathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const hackathon = await getHackathonDetail(id)

  if (!hackathon) {
    notFound()
  }

  const session = await getSession()
  const userId = session?.userId
  const isRegistered = userId ? await checkUserRegistration(id, userId) : false
  const status = computeStatus(hackathon.startDate, hackathon.endDate)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = formatDate(start)
    const endStr = formatDate(end)
    return `${startStr} - ${endStr}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{hackathon.difficulty || "Beginner"}</Badge>
                <Badge
                  variant={status === "live" ? "default" : "secondary"}
                  className={
                    status === "live"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : status === "upcoming"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-slate-500/10 text-slate-600"
                  }
                >
                  {status === "live" ? "Live" : status === "upcoming" ? "Upcoming" : "Past"}
                </Badge>
              </div>

              <h1 className="mt-4 text-4xl font-bold text-foreground">{hackathon.title}</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                by {hackathon.owner?.name || "Anonymous"}
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">About</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {hackathon.description || "No description available"}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-foreground">Key Details</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Card className="border-border bg-card">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Prize Pool</p>
                          <p className="text-lg font-semibold text-foreground">
                            ${hackathon.prizeAmount.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatDateRange(hackathon.startDate, hackathon.endDate)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Participants</p>
                          <p className="text-lg font-semibold text-foreground">
                            {hackathon._count.registrations}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="text-lg font-semibold text-foreground">
                            {hackathon.location || "Virtual"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {hackathon.tags && hackathon.tags.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Topics</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(hackathon.tags as string[]).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Card className="sticky top-8 border-border bg-card">
                <CardHeader>
                  <CardTitle>Register for Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Event Status</p>
                    <Badge
                      variant="outline"
                      className={
                        status === "live"
                          ? "w-full justify-center bg-emerald-500/10 text-emerald-600"
                          : status === "upcoming"
                            ? "w-full justify-center bg-blue-500/10 text-blue-600"
                            : "w-full justify-center bg-slate-500/10 text-slate-600"
                      }
                    >
                      {status === "live"
                        ? "Registration Open"
                        : status === "upcoming"
                          ? "Coming Soon"
                          : "Event Closed"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Registration Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(hackathon.startDate)}
                    </p>
                  </div>

                  {isRegistered ? (
                    <div className="rounded-lg bg-emerald-500/10 p-3 text-center text-sm text-emerald-600">
                      ✓ You're registered for this hackathon
                    </div>
                  ) : status === "live" ? (
                    <RegisterButton hackathonId={id} />
                  ) : (
                    <Button disabled className="w-full">
                      {status === "upcoming"
                        ? "Registration Opens Soon"
                        : "Event Closed"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
