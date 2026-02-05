
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
  CheckCircle,
  LogIn,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { SmartRegistrationForm } from "@/components/smart-registration/smart-registration-form"
import { SubmissionForm } from "@/components/submissions/submission-form"
import Link from "next/link"
import { notFound } from "next/navigation"
import { isUserInTeam, getTeamDetails } from "@/lib/team-utils"
import { ClientOnly } from "@/components/client-only"

export const revalidate = 60 // Revalidate every 60 seconds

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
      hackathonId_userId: {
        hackathonId,
        userId,
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

const isRegistrationOpen = (registrationDeadline: Date): boolean => {
  return new Date() <= registrationDeadline
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
  const isAuthenticated = !!session
  const isRegistered = userId ? await checkUserRegistration(id, userId) : false
  const status = computeStatus(hackathon.startDate, hackathon.endDate)
  const registrationIsOpen = isRegistrationOpen(hackathon.registrationDeadline)

  // Fetch user profile if authenticated
  let user = null
  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })
  }

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

  // Fetch team details if user is in a team
  let teamData = null
  if (userId) {
    const { inTeam, teamId } = await isUserInTeam(userId, id)
    if (inTeam && teamId) {
      teamData = await getTeamDetails(teamId)
    }
  }

  const teamMode = hackathon.allowTeams
  const teamId = teamData?.id || ""
  const teamName = teamData?.name || ""
  const teamMembers = teamData?.members?.length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar handled by MainLayout */}
      <div className="flex-1">
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
                            ${hackathon.prizeAmount.toLocaleString('en-US')}
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

                {(() => {
                  const tags = Array.isArray(hackathon.tags) ? hackathon.tags : (typeof hackathon.tags === 'string' ? (() => { try { return JSON.parse(hackathon.tags) as string[]; } catch { return [] as string[]; } })() : [] as string[]);
                  return tags && tags.length > 0 ? (
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Topics</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((tag: string) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {hackathon.problemStatementPdf && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Resources</h2>
                    <div className="mt-4">
                      <Button asChild variant="outline" className="gap-2">
                        <a href={hackathon.problemStatementPdf} download>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Download Problem Statement
                        </a>
                      </Button>
                    </div>
                    {/* End of Resources Section */}
                  </div>
                )}
                {/* End of mt-8 space-y-6 */}

                {/* New Registration Section */}
                <div className="mt-8 p-6 rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">Ready to participate?</h3>
                      <p className="text-muted-foreground">
                        Join {hackathon.title} now and showcase your skills!
                      </p>
                    </div>
                    {isRegistered ? (
                      <Button size="lg" variant="secondary" className="gap-2 font-semibold" disabled>
                        <CheckCircle className="h-5 w-5" />
                        Registered
                      </Button>
                    ) : registrationIsOpen && isAuthenticated ? (
                      <div className="w-full sm:w-auto">
                        <ClientOnly>
                          <SmartRegistrationForm
                            hackathonId={id}
                            hackathonTitle={hackathon.title}
                            isAuthenticated={isAuthenticated}
                            userProfile={{
                              email: user?.email || "",
                              name: user?.name || "",
                              phone: user?.phone || "",
                              university: "",
                              skills: user?.profile?.skills ? (JSON.parse(user.profile.skills) as string[]) : [],
                              githubProfile: user?.profile?.github || "",
                              linkedinProfile: user?.profile?.linkedin || "",
                            }}
                          />
                        </ClientOnly>
                      </div>
                    ) : !isAuthenticated ? (
                      <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
                        <Link href={`/auth/login?callbackUrl=/hackathons/${id}`}>
                          <LogIn className="h-5 w-5" />
                          Login to Register
                        </Link>
                      </Button>
                    ) : (
                      <Button size="lg" variant="secondary" disabled>
                        Registration Closed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {/* End of lg:col-span-2 */}

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
                        {formatDate(hackathon.registrationDeadline)}
                      </p>
                    </div>

                    {isRegistered ? (
                      <div className="space-y-4">
                        <div className="rounded-lg bg-emerald-500/10 p-3 text-center text-sm text-emerald-600">
                          ✓ You're registered for this hackathon
                        </div>
                        {status === "live" && (
                          <ClientOnly>
                            <SubmissionForm
                              hackathonId={id}
                              hackathonTitle={hackathon.title}
                              isAuthenticated={isAuthenticated}
                              isRegistered={true}
                              teamMode={teamMode}
                              teamId={teamId}
                              teamName={teamName}
                              teamMembers={teamMembers}
                              minTeamSize={hackathon.minTeamSize}
                              maxTeamSize={hackathon.maxTeamSize}
                              hackathonEndDate={hackathon.endDate}
                            />
                          </ClientOnly>
                        )}
                      </div>
                    ) : registrationIsOpen && isAuthenticated ? (
                      <div className="w-full">
                        <ClientOnly>
                          <SmartRegistrationForm
                            hackathonId={id}
                            hackathonTitle={hackathon.title}
                            isAuthenticated={isAuthenticated}
                            userProfile={{
                              email: user?.email || "",
                              name: user?.name || "",
                              phone: user?.phone || "",
                              university: "", // University not stored in profile currently
                              skills: user?.profile?.skills ? (JSON.parse(user.profile.skills) as string[]) : [],
                              githubProfile: user?.profile?.github || "",
                              linkedinProfile: user?.profile?.linkedin || "",
                            }}
                          />
                        </ClientOnly>
                      </div>
                    ) : !isAuthenticated ? (
                      <div className="rounded-lg bg-blue-500/10 p-3 text-center text-sm text-blue-600">
                        <p className="mb-2">Please <Link href="/auth/login" className="font-semibold underline">log in</Link> to register for this event</p>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-slate-500/10 p-3 text-center text-sm text-slate-600">
                        Registration is closed for this event
                      </div>
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
        </div>
      </div>
      <Footer />
    </div>
  )
}
