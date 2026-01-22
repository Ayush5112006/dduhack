import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { hackathons } from "@/lib/data"
import {
  Calendar,
  Trophy,
  Users,
  Clock,
  ExternalLink,
  Share2,
  Heart,
} from "lucide-react"
import { HackathonTabs } from "@/components/hackathon-tabs"

export default async function HackathonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const hackathon = hackathons.find((h) => h.id === id) || hackathons[0]
  const similarHackathons = hackathons.filter((h) => h.id !== id && h.category === hackathon.category).slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <div className="relative h-64 w-full md:h-80 lg:h-96">
          <Image
            src={hackathon.banner || "/placeholder.svg"}
            alt={hackathon.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="-mt-20 relative z-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                    {hackathon.mode}
                  </Badge>
                  <Badge variant="outline" className="bg-background/80 backdrop-blur">
                    {hackathon.difficulty}
                  </Badge>
                  {hackathon.isFree && (
                    <Badge className="bg-green-500/10 text-green-500">Free Entry</Badge>
                  )}
                </div>
                <h1 className="mt-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl text-balance">
                  {hackathon.title}
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  Organized by {hackathon.organizer}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" aria-label="Save hackathon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Share hackathon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="lg" className="gap-2">
                  Register Now
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <Card className="border-border bg-card">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Prize</p>
                    <p className="text-lg font-semibold text-foreground">{hackathon.prize}</p>
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
                    <p className="text-lg font-semibold text-foreground">{hackathon.startDate} - {hackathon.endDate}</p>
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
                    <p className="text-lg font-semibold text-foreground">{hackathon.participants.toLocaleString()}+</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="text-lg font-semibold text-foreground">{hackathon.deadline}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 pb-16">
            <HackathonTabs hackathon={hackathon} />

            {similarHackathons.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-foreground">Similar Hackathons</h2>
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {similarHackathons.map((h) => (
                    <Card key={h.id} className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50">
                      <div className="relative aspect-video">
                        <Image
                          src={h.banner || "/placeholder.svg"}
                          alt={h.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{h.mode}</Badge>
                          <Badge variant="outline" className="text-xs">{h.difficulty}</Badge>
                        </div>
                        <h3 className="mt-2 font-semibold text-foreground line-clamp-1">{h.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{h.organizer}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-primary">{h.prize}</span>
                          <Link href={`/hackathons/${h.id}`}>
                            <Button size="sm" variant="ghost">View</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
