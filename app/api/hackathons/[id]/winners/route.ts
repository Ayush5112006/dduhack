import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { winnersList, submissions, hackathons, ensureUser, notifications, users } from "@/lib/data"

// POST: Announce winners for a hackathon
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  ensureUser(session)

  const hackathon = hackathons.find((h) => h.id === id)
  if (!hackathon) {
    return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
  }

  // Only organizer (owner) or admin can announce winners
  if (session.userRole !== "admin" && (session.userRole !== "organizer" || hackathon.ownerId !== session.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { winners } = body // Array of { submissionId, rank, prize }

  if (!winners || !Array.isArray(winners)) {
    return NextResponse.json({ error: "winners array required" }, { status: 400 })
  }

  const announcedAt = Date.now()
  const newWinners = []

  for (const w of winners) {
    const submission = submissions.find((s) => s.id === w.submissionId && s.hackathonId === id)
    if (!submission) continue

    const winner = {
      id: `winner_${Date.now()}_${w.rank}`,
      hackathonId: id,
      submissionId: w.submissionId,
      rank: w.rank,
      prize: w.prize,
      announcedAt,
    }

    winnersList.push(winner)
    newWinners.push(winner)

    // Create notification for submission owner
    if (submission.userEmail) {
      const user = users.find((u) => u.email === submission.userEmail)
      if (user) {
        const notification = {
          id: `notif_${Date.now()}_${user.id}`,
          userId: user.id,
          type: "result" as const,
          title: `🎉 You won ${w.rank === 1 ? "1st" : w.rank === 2 ? "2nd" : "3rd"} place!`,
          message: `Congratulations! Your submission "${submission.title}" won ${w.rank === 1 ? "1st" : w.rank === 2 ? "2nd" : "3rd"} place in ${hackathon.title}`,
          link: `/hackathons/${id}`,
          read: false,
          createdAt: Date.now(),
        }
        notifications.push(notification)
      }
    }
  }

  return NextResponse.json({ winners: newWinners }, { status: 201 })
}

// GET: Get winners for a hackathon
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const hackathonWinners = winnersList
    .filter((w) => w.hackathonId === id)
    .map((w) => {
      const submission = submissions.find((s) => s.id === w.submissionId)
      return {
        ...w,
        submission,
      }
    })

  return NextResponse.json({ winners: hackathonWinners })
}
