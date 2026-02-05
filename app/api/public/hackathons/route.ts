import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCache, setCache } from "@/lib/cache"
import { checkRateLimit } from "@/lib/security"

type HackathonResponse = {
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
  problemStatementPdf: string | null
  status: "upcoming" | "live" | "past"
  counts: {
    registrations: number
    teams: number
  }
}

function computeStatus(startDate: Date, endDate: Date): HackathonResponse["status"] {
  const now = new Date()
  if (startDate > now) return "upcoming"
  if (endDate < now) return "past"
  return "live"
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Avoid hitting the database during production build to prevent schema-mismatch crashes.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return NextResponse.json({ hackathons: [] }, { status: 200 })
    }

    // Skip rate limit during build to avoid static generation failures; enable only at runtime.
    if (process.env.NODE_ENV !== "production" || process.env.BUILD_PHASE === "true") {
      // no-op
    } else {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
      const rate = checkRateLimit(`public-hackathons:${ip}`, 60, 60_000)
      if (!rate.allowed) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": String(rate.retryAfter ?? 60) } }
        )
      }
    }

    const cacheKey = "public:hackathons:v1"
    const cached = await getCache<{ hackathons: HackathonResponse[] }>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
          "CDN-Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      })
    }

    let hackathons: Array<{
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
      problemStatementPdf: string | null
      status: string
      registrations: number
      teams: number
    }> = []

    try {
      // Use Prisma to fetch hackathons with proper type safety
      const dbHackathons = await prisma.hackathon.findMany({
        where: {
          status: { not: "draft" },
        },
        include: {
          registrations: {
            select: { id: true },
          },
          teams: {
            select: { id: true },
          },
        },
        orderBy: {
          startDate: "asc",
        },
      })

      hackathons = dbHackathons.map((h) => ({
        id: h.id,
        title: h.title,
        description: h.description,
        category: h.category,
        mode: h.mode,
        difficulty: h.difficulty,
        prizeAmount: h.prizeAmount,
        startDate: h.startDate.toISOString(),
        endDate: h.endDate.toISOString(),
        registrationDeadline: h.registrationDeadline.toISOString(),
        banner: h.banner,
        problemStatementPdf: h.problemStatementPdf,
        status: h.status,
        registrations: h.registrations.length,
        teams: h.teams.length,
      }))
    } catch (err: any) {
      console.error("Failed to fetch public hackathons (fallback to empty)", err?.message || err)
      hackathons = []
    }

    const sanitized: HackathonResponse[] = hackathons.map((hackathon) => {
      const startDate = new Date(hackathon.startDate)
      const endDate = new Date(hackathon.endDate)

      return {
        id: hackathon.id,
        title: hackathon.title,
        description: hackathon.description,
        category: hackathon.category,
        mode: hackathon.mode,
        difficulty: hackathon.difficulty,
        prizeAmount: hackathon.prizeAmount,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        registrationDeadline: hackathon.registrationDeadline,
        banner: hackathon.banner,
        problemStatementPdf: hackathon.problemStatementPdf,
        status: computeStatus(startDate, endDate),
        counts: {
          registrations: hackathon.registrations,
          teams: hackathon.teams,
        },
      }
    })

    const payload = { hackathons: sanitized }
    await setCache(cacheKey, payload, 120)

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        "CDN-Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Failed to fetch public hackathons", error)
    return NextResponse.json({ error: "Unable to fetch hackathons" }, { status: 500 })
  }
}

export const runtime = "nodejs"