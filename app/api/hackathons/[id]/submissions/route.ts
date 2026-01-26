import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { isSubmissionLocked } from "@/lib/submission-utils"
import {
  validateTeamSubmissionEligibility,
  isUserInTeam,
  canUserSubmitForTeam,
  getTeamSubmissionMode,
} from "@/lib/team-utils"
import { sendSubmissionReceived } from "@/lib/email"

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

// Allowed file types
const ALLOWED_EXTENSIONS = [".zip", ".rar", ".pdf", ".jpg", ".jpeg", ".png", ".gif"]

async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), "public", "submissions")
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (error) {
    console.error("Failed to create upload directory:", error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: hackathonId } = await params

    // Verify hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
    })

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    // Check if hackathon submission deadline has passed
    const now = new Date()
    if (hackathon.endDate && now > hackathon.endDate) {
      return NextResponse.json(
        { error: "Submission deadline has passed for this hackathon" },
        { status: 403 }
      )
    }

    // Verify user is registered
    const registration = await prisma.registration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId: session.userId,
        },
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: "You must be registered for this hackathon to submit" },
        { status: 403 }
      )
    }

    // Check submission mode (teams vs individual)
    const submissionMode = await getTeamSubmissionMode(hackathonId)

    // Parse form data
    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const technologiesUsed = JSON.parse(formData.get("technologiesUsed") as string || "[]")
    const gitHubLink = formData.get("gitHubLink") as string
    const liveLink = formData.get("liveLink") as string
    const deploymentLink = formData.get("deploymentLink") as string
    const video = formData.get("video") as string
    const documentation = formData.get("documentation") as string
    const teamContributions = formData.get("teamContributions") as string
    const additionalNotes = formData.get("additionalNotes") as string
    const files = formData.getAll("files") as File[]
    const teamId = formData.get("teamId") as string | null

    // Validate team submission eligibility
    if (teamId) {
      // User is trying to submit as team
      if (!submissionMode.allowTeams) {
        return NextResponse.json(
          { error: "Team submissions are not allowed for this hackathon" },
          { status: 400 }
        )
      }

      // Check if user can submit for this team
      const canSubmit = await canUserSubmitForTeam(session.userId, teamId)
      if (!canSubmit.canSubmit) {
        return NextResponse.json(
          { error: canSubmit.error || "Cannot submit for this team" },
          { status: 403 }
        )
      }

      // Check team submission eligibility
      const teamEligible = await validateTeamSubmissionEligibility(teamId, hackathonId)
      if (!teamEligible.eligible) {
        return NextResponse.json(
          { error: teamEligible.error || "Team is not eligible to submit" },
          { status: 400 }
        )
      }
    } else {
      // User is trying to submit individually
      if (!submissionMode.allowIndividual) {
        return NextResponse.json(
          { error: "This hackathon requires team submissions" },
          { status: 400 }
        )
      }

      // Check if user is already in a team for this hackathon
      const userTeam = await isUserInTeam(session.userId, hackathonId)
      if (userTeam.inTeam) {
        return NextResponse.json(
          { error: "You must submit as part of your team. Cannot submit individually." },
          { status: 400 }
        )
      }
    }

    // Validation
    if (!title || !description || technologiesUsed.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!gitHubLink && !liveLink) {
      return NextResponse.json(
        { error: "Provide at least GitHub or Live link" },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    await ensureUploadDir()

    // Process file uploads
    const uploadedFiles: string[] = []
    let totalFileSize = 0

    for (const file of files) {
      const buffer = await file.arrayBuffer()
      totalFileSize += buffer.byteLength

      if (totalFileSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Total file size exceeds 100MB limit" },
          { status: 400 }
        )
      }

      // Check file extension
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `File type ${ext} not allowed` },
          { status: 400 }
        )
      }

      // Generate unique filename
      const filename = `${uuidv4()}${ext}`
      const filepath = join(process.cwd(), "public", "submissions", filename)

      try {
        await writeFile(filepath, new Uint8Array(buffer))
        uploadedFiles.push(`/submissions/${filename}`)
      } catch (error) {
        console.error("File upload error:", error)
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 }
        )
      }
    }

    // Check if user already submitted for this hackathon
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        hackathonId,
        userId: session.userId,
      },
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted for this hackathon" },
        { status: 409 }
      )
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        userId: session.userId,
        hackathonId,
        teamId: teamId || undefined,
        title,
        description,
        techStack: JSON.stringify(technologiesUsed),
        github: gitHubLink,
        demo: liveLink,
        video,
        files: JSON.stringify(uploadedFiles),
        status: "submitted",
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        hackathon: {
          select: { title: true, owner: { select: { email: true, name: true } } },
        },
      },
    })

    // Send email notifications
    try {
      if (submission.user && submission.hackathon) {
        // Send confirmation email to submitter
        await sendSubmissionReceived(submission.user.email, {
          name: submission.user.name,
          hackathonName: submission.hackathon.title,
          projectTitle: title,
          submissionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/submissions/${submission.id}`,
        })

        // Send notification email to organizer
        if (submission.hackathon.owner) {
          const organizerEmail = submission.hackathon.owner.email
          const organizerName = submission.hackathon.owner.name
          await sendSubmissionReceived(organizerEmail, {
            name: organizerName,
            hackathonName: submission.hackathon.title,
            projectTitle: title,
            submissionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/organizer/dashboard/submissions/${submission.id}`,
          })
        }
      }
    } catch (emailError) {
      console.error("Failed to send submission emails:", emailError)
      // Don't fail the submission if email fails
    }

    // Update registration status
    await prisma.registration.update({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId: session.userId,
        },
      },
      data: {
        status: "submitted",
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error("Submission creation error:", error)
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    )
  }
}

// GET user's submissions for a hackathon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: hackathonId } = await params

    const submission = await prisma.submission.findFirst({
      where: {
        hackathonId,
        userId: session.userId,
      },
    })

    if (!submission) {
      return NextResponse.json({ error: "No submission found" }, { status: 404 })
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error("Submission fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    )
  }
}
