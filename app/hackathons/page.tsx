import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PublicHackathon } from "@/components/public/hackathon-card"
import { HackathonList } from "@/components/public/hackathon-list"
import { getPrismaClient } from "@/lib/prisma-multi-db"

async function getPublicHackathons(): Promise<PublicHackathon[]> {
  try {
    const organizerDb = getPrismaClient("organizer")
    const hackathons = await organizerDb.hackathon.findMany({
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
            submissions: true,
          },
        },
      },
    })

    const computeStatus = (startDate: Date, endDate: Date): string => {
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
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Public Hackathons</p>
            <h1 className="text-3xl font-bold text-foreground">Browse live & upcoming events</h1>
            <p className="mt-2 text-muted-foreground">
              Only hackathons created by verified organizers are shown. No login required.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Showing {hackathons.length} event{hackathons.length === 1 ? "" : "s"}
          </div>
        </div>

        <HackathonList hackathons={hackathons} />
      </main>
      <Footer />
    </div>
  )
}
