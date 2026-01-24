import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { hackathons, judgeAssignments, users, ensureUser } from "@/lib/data"

// GET: List judges assigned to hackathon
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hackathon = hackathons.find((h) => h.id === id)
  if (!hackathon) {
    return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
  }

  // Only organizer/admin can view judges
  if (session.userRole !== "admin" && session.userRole !== "organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (session.userRole === "organizer" && hackathon.ownerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const assigned = judgeAssignments
    .filter((ja) => ja.hackathonId === id)
    .map((ja) => {
      const judge = users.find((u) => u.id === ja.judgeId)
      return {
        ...ja,
        judgeName: judge?.name,
      }
    })

  return NextResponse.json({ judges: assigned })
}

// POST: Assign a judge to hackathon
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

  // Only organizer (owner) or admin can assign judges
  if (session.userRole !== "admin" && (session.userRole !== "organizer" || hackathon.ownerId !== session.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { judgeEmail } = body

  if (!judgeEmail) {
    return NextResponse.json({ error: "judgeEmail required" }, { status: 400 })
  }

  const judge = users.find((u) => u.email === judgeEmail && u.role === "judge")
  if (!judge) {
    return NextResponse.json({ error: "Judge not found or user is not a judge" }, { status: 404 })
  }

  // Check if already assigned
  const existing = judgeAssignments.find(
    (ja) => ja.hackathonId === id && ja.judgeId === judge.id
  )
  if (existing) {
    return NextResponse.json({ error: "Judge already assigned" }, { status: 400 })
  }

  const assignment = {
    id: `ja_${Date.now()}`,
    hackathonId: id,
    judgeId: judge.id,
    judgeEmail: judge.email,
    assignedAt: Date.now(),
  }

  judgeAssignments.push(assignment)

  return NextResponse.json({ assignment }, { status: 201 })
}
