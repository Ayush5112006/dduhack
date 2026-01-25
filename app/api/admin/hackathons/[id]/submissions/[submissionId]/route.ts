import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: hackathonId, submissionId } = await params
    const body = await request.json()
    const { status, score, feedback } = body

    // Verify submission exists and belongs to hackathon
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission || submission.hackathonId !== hackathonId) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    // Update submission
    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status,
        score,
        feedback,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update submission:", error)
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: hackathonId, submissionId } = await params

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission || submission.hackathonId !== hackathonId) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    // Check if user is the owner or admin
    if (session.userId !== submission.userId && session.userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Failed to fetch submission:", error)
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    )
  }
}
