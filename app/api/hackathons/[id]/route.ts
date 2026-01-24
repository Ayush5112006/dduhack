import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { hackathons, problemStatements, submissions, registrations, findHackathonById } from "@/lib/data"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const hackathon = findHackathonById(id)
  if (!hackathon) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({
    hackathon,
    problemStatements: problemStatements.filter((p) => p.hackathonId === hackathon.id),
    submissions: submissions.filter((s) => s.hackathonId === hackathon.id),
    registrations: registrations.filter((r) => r.hackathonId === hackathon.id),
  })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const hackathon = findHackathonById(id)
    if (!hackathon) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const isOwner = hackathon.ownerId === session.userId
    const isAdmin = session.userRole === "admin"
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    if (body.status) hackathon.status = body.status
    if (body.title) hackathon.title = body.title
    if (body.description !== undefined) hackathon.description = body.description
    if (body.prizeAmount !== undefined) {
      hackathon.prizeAmount = Number(body.prizeAmount)
      hackathon.prize = `$${Number(body.prizeAmount).toLocaleString()}`
    }
    if (body.registrationDeadline) hackathon.registrationDeadline = body.registrationDeadline
    if (body.tags) hackathon.tags = Array.isArray(body.tags) ? body.tags : hackathon.tags

    return NextResponse.json({ success: true, hackathon })
  } catch (error) {
    console.error("Update hackathon error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
