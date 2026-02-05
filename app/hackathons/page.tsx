
import { Footer } from "@/components/footer"
import { PublicHackathon } from "@/components/public/hackathon-card"
import { HackathonList } from "@/components/public/hackathon-list"
import { getPrismaClient } from "@/lib/prisma-multi-db"

async function getPublicHackathons(): Promise<PublicHackathon[]> {
  try {
    const organizerDb = getPrismaClient("organizer")
    const hackathons = await organizerDb.hackathon.findMany({
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

    const computeStatus = (startDate: Date, endDate: Date): "upcoming" | "live" | "past" => {
      const now = new Date()
      if (now < startDate) return "upcoming"
      if (now > endDate) return "past"
      return "live"
    }

    const parseTags = (tags: unknown): string[] => {
      if (!tags) return []
      if (Array.isArray(tags)) return tags.filter((t): t is string => typeof t === "string")
      if (typeof tags === "string") {
        try {
          const parsed = JSON.parse(tags)
          return Array.isArray(parsed)
            ? parsed.filter((t): t is string => typeof t === "string")
            : []
        } catch {
          return []
        }
      }
      return []
    }

    return hackathons.map((h) => ({
      id: h.id,
      title: h.title,
      description: h.description || "",
      organizer: h.owner?.name || "Anonymous",
      status: computeStatus(h.startDate, h.endDate),
      category: h.category || "General",
      difficulty: h.difficulty || "Beginner",
      mode: h.mode || "Online",
      startDate: h.startDate,
      endDate: h.endDate,
      location: h.location || "Virtual",
      prizeAmount: h.prizeAmount,
      registrations: h._count.registrations,
      submissions: h._count.submissions,
      tags: parseTags(h.tags),
    }))
  } catch (error) {
    console.error("Error fetching public hackathons", error)
    return []
  }
}

export const revalidate = 60

export default async function HackathonsPage() {
  const hackathons = await getPublicHackathons()

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar handled by MainLayout */}
      <main className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-4 sm:py-12 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">🚀 Public Hackathons</p>
            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Discover & Participate</h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Browse verified hackathons and register to start your competitive journey
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-secondary/30 backdrop-blur px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground w-fit font-medium">
            📊 {hackathons.length} event{hackathons.length === 1 ? "" : "s"} available
          </div>
        </div>

        <HackathonList hackathons={hackathons} />
      </main>
      <Footer />
    </div>
  )
}
