import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// Validation schema for registration
const registrationSchema = z.object({
  hackathonId: z.string().min(1),
  mode: z.enum(["individual", "team"]),
  teamName: z.string().min(2).optional(),
  memberEmails: z.array(z.string().email()).optional(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  university: z.string().optional(),
  enrollmentNumber: z.string().optional(),
  branch: z.string().optional(),
  year: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  githubProfile: z.string().url().optional(),
  linkedinProfile: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  projectIdea: z.string().optional(),
  motivation: z.string().optional(),
  consent: z.boolean(),
})

export type RegistrationInput = z.infer<typeof registrationSchema>

// GET: Get user's registrations
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const registrations = await prisma.registration.findMany({
      where: { userId: session.userId },
      include: {
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
            registrationDeadline: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            leaderEmail: true,
            members: {
              select: {
                user: { select: { name: true, email: true } },
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ registrations }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

// POST: Create new registration
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = registrationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { hackathonId, mode, teamName, memberEmails, consent, ...profileData } = validation.data

    // Verify hackathon exists
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { registrationDeadline: true, status: true },
    })

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    // Check registration deadline
    if (new Date() > hackathon.registrationDeadline) {
      return NextResponse.json({ error: "Registration closed for this hackathon" }, { status: 400 })
    }

    // Prevent duplicate registration
    const existing = await prisma.registration.findUnique({
      where: {
        hackathonId_userId: { hackathonId, userId: session.userId },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Already registered for this hackathon" }, { status: 400 })
    }

    // Validate consent
    if (!consent) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 })
    }

    let teamId: string | undefined

    // Handle team registration
    if (mode === "team") {
      if (!teamName) {
        return NextResponse.json({ error: "Team name required for team registration" }, { status: 400 })
      }

      // Create team
      const team = await prisma.team.create({
        data: {
          hackathonId,
          name: teamName,
          leaderId: session.userId,
          leaderEmail: session.userEmail,
          locked: false,
        },
      })

      teamId = team.id

      // Invite team members if provided
      if (memberEmails && memberEmails.length > 0) {
        const validEmails = memberEmails.filter((e) => e !== session.userEmail)

        for (const email of validEmails) {
          const member = await prisma.user.findUnique({ where: { email } })

          if (member) {
            await prisma.teamMember.create({
              data: {
                teamId,
                userId: member.id,
                email,
                status: "invited",
              },
            })
          }
        }
      }
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        userId: session.userId,
        hackathonId,
        userEmail: session.userEmail,
        mode,
        teamId,
        status: "approved",
        consent,
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone || null,
        university: profileData.university || null,
        enrollmentNumber: profileData.enrollmentNumber || null,
        branch: profileData.branch || null,
        year: profileData.year || null,
        skills: profileData.skills || null,
        experience: profileData.experience || null,
        githubProfile: profileData.githubProfile || null,
        linkedinProfile: profileData.linkedinProfile || null,
        portfolioUrl: profileData.portfolioUrl || null,
        projectIdea: profileData.projectIdea || null,
        motivation: profileData.motivation || null,
      },
      include: {
        hackathon: true,
        team: true,
      },
    })

    // Update hackathon participant count
    await prisma.hackathon.update({
      where: { id: hackathonId },
      data: { participants: { increment: 1 } },
    })

    return NextResponse.json(
      {
        success: true,
        registration: {
          id: registration.id,
          hackathonId: registration.hackathonId,
          mode: registration.mode,
          teamId: registration.teamId,
          status: registration.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
