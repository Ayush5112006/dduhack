export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma-multi-db"
import { destroySession, getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function DELETE() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const userId = session.userId
  const db = getPrismaClient(session.userRole)

  try {
    const teamsLed = await db.team.findMany({
      where: { leaderId: userId },
      select: { id: true },
    })

    const teamIds = teamsLed.map((team) => team.id)

    await db.$transaction([
      db.score.deleteMany({ where: { judgeId: userId } }),
      db.judgeAssignment.deleteMany({ where: { judgeId: userId } }),
      db.certificate.deleteMany({ where: { userId } }),
      db.notification.deleteMany({ where: { userId } }),
      db.submission.deleteMany({
        where: {
          OR: [
            { userId },
            ...(teamIds.length ? [{ teamId: { in: teamIds } }] : []),
          ],
        },
      }),
      db.registration.deleteMany({ where: { userId } }),
      db.teamMember.deleteMany({ where: { userId } }),
      db.team.deleteMany({ where: { id: { in: teamIds } } }),
      db.hackathon.deleteMany({ where: { ownerId: userId } }),
      db.userProfile.deleteMany({ where: { userId } }),
      db.user.delete({ where: { id: userId } }),
    ])

    await destroySession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
