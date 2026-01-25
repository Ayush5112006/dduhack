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
    const { locked, lockedReason } = body

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

    // Update submission lock status
    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        locked,
        lockedAt: locked ? new Date() : null,
        lockedReason: locked ? lockedReason || "Locked by administrator" : null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update submission lock:", error)
    return NextResponse.json(
      { error: "Failed to update submission lock" },
      { status: 500 }
    )
  }
}
