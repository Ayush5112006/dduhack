import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  techStack: z.array(z.string()).optional(),
  files: z.array(z.string().url()).optional(),
})

const finalizeSchema = z.object({
  action: z.enum(["submit", "save_draft"]),
})

// GET: Get submission details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        team: {
          include: {
            members: { select: { user: { select: { name: true, email: true } } } },
          },
        },
        hackathon: { select: { title: true, endDate: true } },
        scores: {
          include: { judge: { select: { name: true } } },
        },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Verify access
    const isAuthor = submission.userId === session.userId
    const isTeamMember = submission.team?.members.some((m) => m.user.email === session.userEmail)

    if (!isAuthor && !isTeamMember) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    return NextResponse.json({ submission }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch submission:", error)
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 })
  }
}

// PATCH: Update submission (draft mode)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: { team: true },
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Verify authorization
    if (submission.userId !== session.userId && submission.team?.leaderId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Check if still editable
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: submission.hackathonId },
      select: { endDate: true },
    })

    if (!hackathon || new Date() > hackathon.endDate) {
      return NextResponse.json(
        { error: "Submission deadline has passed" },
        { status: 400 }
      )
    }

    // Update submission
    const data: any = {}
    if (validation.data.title) data.title = validation.data.title
    if (validation.data.description !== undefined) data.description = validation.data.description
    if (validation.data.githubUrl) data.github = validation.data.githubUrl
    if (validation.data.demoUrl) data.demo = validation.data.demoUrl
    if (validation.data.videoUrl) data.video = validation.data.videoUrl
    if (validation.data.techStack) data.techStack = JSON.stringify(validation.data.techStack)
    if (validation.data.files) data.files = JSON.stringify(validation.data.files)

    const updated = await prisma.submission.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ success: true, submission: updated }, { status: 200 })
  } catch (error) {
    console.error("Submission update error:", error)
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 })
  }
}

// PUT: Finalize submission
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = finalizeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: { team: true, hackathon: true },
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Verify authorization
    if (submission.userId !== session.userId && submission.team?.leaderId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Validate submission
    if (!submission.title || !submission.github) {
      return NextResponse.json(
        { error: "Submission must have title and GitHub URL" },
        { status: 400 }
      )
    }

    const now = new Date()
    const isLate = now > submission.hackathon.endDate

    const newStatus = validation.data.action === "submit" ? (isLate ? "late" : "submitted") : "draft"

    // Check if late submissions are allowed
    const lateSubmissionWindow = 24 * 60 * 60 * 1000 // 24 hours
    if (
      isLate &&
      now.getTime() - submission.hackathon.endDate.getTime() > lateSubmissionWindow
    ) {
      return NextResponse.json(
        { error: "Late submission window has closed" },
        { status: 400 }
      )
    }

    const updated = await prisma.submission.update({
      where: { id: params.id },
      data: { status: newStatus },
    })

    return NextResponse.json(
      {
        success: true,
        message: `Submission ${newStatus === "late" ? "submitted as late" : newStatus}`,
        submission: updated,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Submission finalize error:", error)
    return NextResponse.json({ error: "Failed to finalize submission" }, { status: 500 })
  }
}
