import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { destroySession, getSession } from "@/lib/session"

export async function DELETE() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const userId = session.userId

  try {
    const teamsLed = await prisma.team.findMany({
      where: { leaderId: userId },
      select: { id: true },
    })

    const teamIds = teamsLed.map((team) => team.id)

    await prisma.$transaction([
      prisma.score.deleteMany({ where: { judgeId: userId } }),
      prisma.judgeAssignment.deleteMany({ where: { judgeId: userId } }),
      prisma.certificate.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.submission.deleteMany({
        where: {
          OR: [
            { userId },
            ...(teamIds.length ? [{ teamId: { in: teamIds } }] : []),
          ],
        },
      }),
      prisma.registration.deleteMany({ where: { userId } }),
      prisma.teamMember.deleteMany({ where: { userId } }),
      prisma.team.deleteMany({ where: { id: { in: teamIds } } }),
      prisma.hackathon.deleteMany({ where: { ownerId: userId } }),
      prisma.userProfile.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ])

    await destroySession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
