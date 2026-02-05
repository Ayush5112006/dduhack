import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Trophy, Users, Calendar } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getFeaturedHackathons() {
  try {
    const hackathons = await prisma.hackathon.findMany({
      where: {
        owner: {
          role: { in: ["ORGANIZER", "organizer"] },
        },
      },
      include: {
        owner: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    })

    const computeStatus = (startDate: Date, endDate: Date): string => {
      const now = new Date()
      if (now < startDate) return "upcoming"
      if (now > endDate) return "past"
      return "live"
    }

    return hackathons.map((h) => ({
      id: h.id,
      title: h.title,
      organizer: h.owner?.name || "Anonymous",
      status: computeStatus(h.startDate, h.endDate),
      category: h.category || "General",
      startDate: h.startDate,
      endDate: h.endDate,
      prizeAmount: h.prizeAmount,
      registrations: h._count.registrations,
    }))
  } catch (error) {
    console.error("Error fetching featured hackathons", error)
    return []
  }
}

export async function FeaturedHackathons() {
  const featured = await getFeaturedHackathons()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
  }

  return (
    <section className="border-b border-border bg-card py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Featured Hackathons</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Handpicked opportunities with the best prizes and sponsors
            </p>
          </div>
          <Link href="/hackathons" className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 md:flex touch-manipulation">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="mt-8 sm:mt-10 text-center py-12">
            <p className="text-muted-foreground">No featured hackathons available at this time</p>
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((hackathon) => (
              <Link key={hackathon.id} href={`/hackathons/${hackathon.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden touch-manipulation">
                  <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                    <div className="mb-4 flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-lg mb-1 line-clamp-2">{hackathon.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{hackathon.organizer}</p>
                      </div>
                      <Badge
                        className={
                          hackathon.status === "live"
                            ? "bg-green-500 hover:bg-green-600"
                            : hackathon.status === "upcoming"
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-gray-400 hover:bg-gray-500"
                        }
                      >
                        {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>
                          {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">₹{hackathon.prizeAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{hackathon.registrations} registered</span>
                      </div>
                    </div>

                    <Badge variant="secondary" className="w-fit">
                      {hackathon.category}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 sm:mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="gap-2 bg-transparent h-11 touch-manipulation w-full sm:w-auto">
            <Link href="/hackathons">
              View all hackathons <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
