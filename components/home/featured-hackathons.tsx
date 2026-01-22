import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { hackathons } from "@/lib/data"
import { Calendar, MapPin, Trophy, Users, ArrowRight } from "lucide-react"

export function FeaturedHackathons() {
  const featured = hackathons.filter((h) => h.featured).slice(0, 3)

  return (
    <section className="border-b border-border bg-card py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Hackathons</h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked opportunities with the best prizes and sponsors
            </p>
          </div>
          <Link href="/hackathons" className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 md:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((hackathon) => (
            <Card key={hackathon.id} className="group overflow-hidden border-border bg-background transition-all hover:border-primary/50">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={hackathon.banner || "/placeholder.svg"}
                  alt={hackathon.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                    {hackathon.mode}
                  </Badge>
                  <Badge className="bg-primary text-primary-foreground">
                    <Trophy className="mr-1 h-3 w-3" />
                    {hackathon.prize}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  {hackathon.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {hackathon.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  by {hackathon.organizer}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{hackathon.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{hackathon.participants.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Link href={`/hackathons/${hackathon.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/hackathons/${hackathon.id}#register`}>
                    <Button>Register</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/hackathons">
            <Button variant="outline" className="gap-2 bg-transparent">
              View all hackathons <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
