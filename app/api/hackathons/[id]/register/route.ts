import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id },
    })

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    // Check if registration is open
    const now = new Date()
    if (now > hackathon.registrationDeadline) {
      return NextResponse.json({ error: "Registration is closed" }, { status: 400 })
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        hackathonId_userId: {
          hackathonId: id,
          userId: session.userId,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "Already registered" }, { status: 400 })
    }

    const body = await request.json()
    const mode = body.mode === "team" ? "team" : "individual"
    const consent = !!body.consent
    const teamName = body.teamName as string | undefined
    const memberEmails: string[] = Array.isArray(body.memberEmails) ? body.memberEmails : []
    const formData = body.formData || {}

    if (!consent) {
      return NextResponse.json({ error: "Consent is required" }, { status: 400 })
    }

    let teamId: string | undefined

    if (mode === "team") {
      if (!teamName) {
        return NextResponse.json({ error: "Team name is required for team registrations" }, { status: 400 })
      }

      // Create team
      const team = await prisma.team.create({
        data: {
          hackathonId: id,
          name: teamName,
          leaderId: session.userId,
          leaderEmail: session.userEmail,
        },
      })

      teamId = team.id

      // Add team leader as member
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: session.userId,
          email: session.userEmail,
          status: "leader",
        },
      })

      // Create invitations for other members
      if (memberEmails.length > 0) {
        await Promise.all(
          memberEmails.map(async (email) => {
            // Check if user exists
            const user = await prisma.user.findUnique({
              where: { email },
            })

            if (user) {
              await prisma.teamMember.create({
                data: {
                  teamId: team.id,
                  userId: user.id,
                  email: user.email,
                  status: "invited",
                },
              })
            }
          })
        )
      }
    }

    // Create registration with student information
    const registration = await prisma.registration.create({
      data: {
        hackathonId: id,
        userId: session.userId,
        userEmail: session.userEmail,
        mode,
        teamId,
        status: "pending",
        consent,
        fullName: formData.fullName,
        phone: formData.phone,
        university: formData.university,
        enrollmentNumber: formData.enrollmentNumber,
        branch: formData.branch,
        year: formData.year,
        skills: formData.skills,
        experience: formData.experience,
        githubProfile: formData.githubProfile,
        linkedinProfile: formData.linkedinProfile,
        portfolioUrl: formData.portfolioUrl,
        projectIdea: formData.projectIdea,
        motivation: formData.motivation,
        formData: JSON.stringify(formData),
      },
    })

    // Update hackathon participant count
    await prisma.hackathon.update({
      where: { id },
      data: {
        participants: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      teamId,
      teamName: teamName,
      message: "Successfully registered for the hackathon",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
}
