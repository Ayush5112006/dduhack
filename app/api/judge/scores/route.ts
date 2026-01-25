import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const scoreSchema = z.object({
  submissionId: z.string().min(1),
  innovation: z.number().min(1).max(10),
  technical: z.number().min(1).max(10),
  design: z.number().min(1).max(10),
  impact: z.number().min(1).max(10),
  presentation: z.number().min(1).max(10),
  feedback: z.string().optional(),
})

// GET: Get assigned submissions for judge
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get("hackathonId")

    // Verify judge is assigned
    const assignment = hackathonId
      ? await prisma.judgeAssignment.findUnique({
          where: {
            hackathonId_judgeId: { hackathonId, judgeId: session.userId },
          },
        })
      : null

    if (hackathonId && !assignment) {
      return NextResponse.json({ error: "Not assigned as judge for this hackathon" }, { status: 403 })
    }

    const submissions = await prisma.submission.findMany({
      where: hackathonId ? { hackathonId } : {},
      include: {
        user: { select: { name: true, email: true } },
        team: { select: { name: true } },
        hackathon: { select: { title: true } },
        scores: {
          where: { judgeId: session.userId },
          select: {
            id: true,
            innovation: true,
            technical: true,
            design: true,
            impact: true,
            presentation: true,
            total: true,
            feedback: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(
      {
        submissions: submissions.map((sub) => ({
          ...sub,
          myScore: sub.scores[0] || null,
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to fetch submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

// POST: Submit score
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = scoreSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const { submissionId, innovation, technical, design, impact, presentation, feedback } =
      validation.data

    // Verify submission exists
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { hackathonId: true },
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Verify judge is assigned
    const assignment = await prisma.judgeAssignment.findUnique({
      where: {
        hackathonId_judgeId: {
          hackathonId: submission.hackathonId,
          judgeId: session.userId,
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Not authorized to score" }, { status: 403 })
    }

    // Calculate average
    const total = (innovation + technical + design + impact + presentation) / 5

    // Upsert score
    const score = await prisma.score.upsert({
      where: {
        submissionId_judgeId: { submissionId, judgeId: session.userId },
      },
      create: {
        submissionId,
        judgeId: session.userId,
        hackathonId: submission.hackathonId,
        innovation,
        technical,
        design,
        impact,
        presentation,
        total,
        feedback: feedback || null,
      },
      update: {
        innovation,
        technical,
        design,
        impact,
        presentation,
        total,
        feedback: feedback || null,
      },
    })

    return NextResponse.json({ success: true, score }, { status: 200 })
  } catch (error) {
    console.error("Scoring error:", error)
    return NextResponse.json({ error: "Failed to submit score" }, { status: 500 })
  }
}
