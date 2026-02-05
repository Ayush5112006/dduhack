import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.userRole !== "participant") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const registrations = await prisma.registration.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            registrationDeadline: true,
            status: true,
            prizeAmount: true,
            category: true,
            minTeamSize: true,
            maxTeamSize: true,
            allowTeams: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            members: {
              select: { id: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formatted = registrations.map((reg) => ({
      id: reg.id,
      hackathonId: reg.hackathon.id,
      hackathonTitle: reg.hackathon.title,
      startDate: reg.hackathon.startDate.toISOString(),
      endDate: reg.hackathon.endDate.toISOString(),
      registrationDeadline: reg.hackathon.registrationDeadline.toISOString(),
      status: reg.hackathon.status,
      prizeAmount: reg.hackathon.prizeAmount,
      category: reg.hackathon.category,
      mode: reg.mode,
      registrationStatus: reg.status,
      registeredAt: reg.createdAt.toISOString(),
      teamId: reg.team?.id,
      teamName: reg.team?.name,
      teamMembers: reg.team?.members.length || 0,
      minTeamSize: reg.hackathon.minTeamSize,
      maxTeamSize: reg.hackathon.maxTeamSize,
      allowTeams: reg.hackathon.allowTeams,
    }))

    return NextResponse.json({ registrations: formatted })
  } catch (error) {
    console.error("Failed to fetch registrations", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}
