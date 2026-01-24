import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { scores, submissions, ensureUser } from "@/lib/data"

// GET: Get scores for a submission
export async function GET(request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const submission = submissions.find((s) => s.id === submissionId)
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 })
  }

  const submissionScores = scores.filter((s) => s.submissionId === submissionId)

  return NextResponse.json({ scores: submissionScores })
}

// POST: Submit score for a submission
export async function POST(request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params
  const session = await getSession()
  if (!session || session.userRole !== "judge") {
    return NextResponse.json({ error: "Only judges can submit scores" }, { status: 403 })
  }

  ensureUser(session)

  const submission = submissions.find((s) => s.id === submissionId)
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 })
  }

  const body = await request.json()
  const { innovation, technical, design, impact, presentation, feedback } = body

  if (!innovation || !technical || !design || !impact || !presentation) {
    return NextResponse.json({ error: "All scores required (1-10)" }, { status: 400 })
  }

  // Check if judge already scored this submission
  const existing = scores.find(
    (s) => s.submissionId === submissionId && s.judgeId === session.userId
  )
  if (existing) {
    return NextResponse.json({ error: "Already scored this submission" }, { status: 400 })
  }

  const total = innovation + technical + design + impact + presentation

  const score = {
    id: `score_${Date.now()}`,
    submissionId,
    judgeId: session.userId!,
    hackathonId: submission.hackathonId,
    innovation,
    technical,
    design,
    impact,
    presentation,
    total,
    feedback,
    createdAt: Date.now(),
  }

  scores.push(score)

  // Update submission average score
  const submissionScores = scores.filter((s) => s.submissionId === submissionId)
  const avgTotal = submissionScores.reduce((sum, s) => sum + s.total, 0) / submissionScores.length
  submission.score = Math.round(avgTotal)

  return NextResponse.json({ score }, { status: 201 })
}
