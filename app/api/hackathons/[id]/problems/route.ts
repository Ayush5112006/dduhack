import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { findHackathonById, problemStatements, ProblemStatement } from "@/lib/data"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || (session.userRole !== "organizer" && session.userRole !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const hackathon = findHackathonById(id)
    if (!hackathon) return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    if (hackathon.ownerId && hackathon.ownerId !== session.userId && session.userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, difficulty, prize, resources, dataset } = body
    if (!title || !description || !difficulty) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const ps: ProblemStatement = {
      id: `ps_${Date.now()}`,
      hackathonId: hackathon.id,
      title,
      description,
      difficulty,
      prize,
      resources,
      dataset,
    }

    problemStatements.push(ps)
    return NextResponse.json({ success: true, problemStatement: ps }, { status: 201 })
  } catch (error) {
    console.error("Add problem statement error:", error)
    return NextResponse.json({ error: "Failed to add problem statement" }, { status: 500 })
  }
}
