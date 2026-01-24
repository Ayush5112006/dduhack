import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

export async function GET() {
  try {
    const hackathons = await prisma.hackathon.findMany({
      where: {
        owner: {
          role: {
            in: ["ORGANIZER", "organizer"],
          },
        },
        status: {
          not: "draft",
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        mode: true,
        difficulty: true,
        prizeAmount: true,
        startDate: true,
        endDate: true,
        registrationDeadline: true,
        banner: true,
        status: true,
        _count: {
          select: {
            registrations: true,
            teams: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    })

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
        startDate: hackathon.startDate.toISOString(),
        endDate: hackathon.endDate.toISOString(),
        registrationDeadline: hackathon.registrationDeadline.toISOString(),
        banner: hackathon.banner,
        status: computeStatus(startDate, endDate),
        counts: {
          registrations: hackathon._count.registrations,
          teams: hackathon._count.teams,
        },
      }
    })

    return NextResponse.json({ hackathons: sanitized })
  } catch (error) {
    console.error("Failed to fetch public hackathons", error)
    return NextResponse.json({ error: "Unable to fetch hackathons" }, { status: 500 })
  }
}

export const revalidate = 60