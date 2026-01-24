import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import {
  findHackathonById,
  isRegistrationOpen,
  submissions,
  Submission,
  problemStatements,
} from "@/lib/data"
import { broadcast } from "@/app/api/realtime/events/route"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const hackathon = findHackathonById(id)
  if (!hackathon) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = hackathon.ownerId === session.userId
  const isAdmin = session.userRole === "admin"
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json({ submissions: submissions.filter((s) => s.hackathonId === hackathon.id) })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const hackathon = findHackathonById(id)
    if (!hackathon) return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })

    const body = await request.json()
    const {
      title,
      description,
      github,
      demo,
      video,
      techStack,
      files,
      psId,
      status,
    } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const isLate = !isRegistrationOpen(hackathon)
    const submissionStatus = (status as Submission["status"]) || (isLate ? "late" : "submitted")

    if (psId && !problemStatements.find((p) => p.id === psId)) {
      return NextResponse.json({ error: "Problem statement not found" }, { status: 400 })
    }

    const submission: Submission = {
      id: `sub_${Date.now()}`,
      hackathonId: hackathon.id,
      userId: session.userId,
      userEmail: session.userEmail,
      psId,
      title,
      description,
      github,
      demo,
      video,
      files: Array.isArray(files) ? files : [],
      techStack: Array.isArray(techStack) ? techStack : [],
      status: submissionStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    submissions.push(submission)
    
    // Broadcast real-time event
    broadcast('submission:created', {
      submission,
      hackathonId: hackathon.id,
      hackathonTitle: hackathon.title,
      userId: session.userId,
    })
    
    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error("Submission error:", error)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }
}
