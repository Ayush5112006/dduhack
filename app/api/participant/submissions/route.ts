import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

const submissionSchema = z.object({
  hackathonId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().optional(),
  githubUrl: z.string().url("Invalid GitHub URL"),
  demoUrl: z.string().url("Invalid demo URL").optional(),
  videoUrl: z.string().url("Invalid video URL").optional(),
  techStack: z.array(z.string()).min(1, "At least one technology required"),
  files: z.array(z.string().url()).optional(),
})

export type SubmissionInput = z.infer<typeof submissionSchema>

// GET: Get submissions for user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hackathonId = searchParams.get("hackathonId")

    const where = hackathonId
      ? {
          AND: [
            { hackathonId },
            {
              OR: [{ userId: session.userId }, { team: { members: { some: { userId: session.userId } } } }],
            },
          ],
        }
      : { userId: session.userId }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        hackathon: {
          select: { title: true, endDate: true, startDate: true },
        },
        team: {
          select: { name: true, leader: { select: { name: true } } },
        },
        scores: {
          select: { id: true, total: true, feedback: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ submissions }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

// POST: Create new submission
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = submissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { hackathonId, title, techStack, ...rest } = validation.data

    // Verify hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { endDate: true, status: true },
    })

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    // Check if user is registered
    const registration = await prisma.registration.findUnique({
      where: {
        hackathonId_userId: { hackathonId, userId: session.userId },
      },
      include: { team: true },
    })

    if (!registration) {
      return NextResponse.json({ error: "Not registered for this hackathon" }, { status: 403 })
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        hackathonId,
        userId: registration.mode === "individual" ? session.userId : null,
        teamId: registration.mode === "team" ? registration.teamId : null,
        userEmail: session.userEmail,
        title,
        description: rest.description,
        github: rest.githubUrl,
        demo: rest.demoUrl,
        video: rest.videoUrl,
        techStack: JSON.stringify(techStack),
        files: rest.files ? JSON.stringify(rest.files) : null,
        status: "draft",
      },
      include: {
        hackathon: true,
        user: { select: { name: true, email: true } },
        team: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        submission: {
          id: submission.id,
          title: submission.title,
          status: submission.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Submission creation error:", error)
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
  }
}
