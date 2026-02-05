import { NextRequest, NextResponse } from "next/server"
import { teams } from "@/lib/data"
import { generateMemberPassword, sendTeamInvitationEmail } from "@/lib/team-invitation-email"
import { hash } from "bcryptjs"

// Simulated user database - replace with actual database query
const users: any[] = [] // In production, query from Prisma/MongoDB

export async function POST(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { teamId } = await params
    const team = teams.find((t) => t.id === teamId)

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const body = await request.json()
    const email = body.email?.trim().toLowerCase()
    const memberName = body.name?.trim() || email.split('@')[0]

    // Validate email is provided
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if team is full
    const maxTeamSize = 4
    if (team.members.length >= maxTeamSize) {
      return NextResponse.json({ error: "Team is full" }, { status: 400 })
    }

    // Check if already a team member
    const existingMember = team.members.find((m) => m.email.toLowerCase() === email)
    if (existingMember) {
      return NextResponse.json({ error: "This member has already been invited" }, { status: 400 })
    }

    // ============================================
    // CHECK IF USER ACCOUNT ALREADY EXISTS
    // ============================================

    // In production, replace with: await prisma.user.findUnique({ where: { email } })
    let existingUser = users.find((u) => u.email.toLowerCase() === email)

    let userId: string
    let generatedPassword: string | undefined
    let isExistingUser: boolean

    if (existingUser) {
      // ============================================
      // EXISTING USER - Don't create account or password
      // ============================================
      console.log('✅ User already exists:', existingUser.email)

      userId = existingUser.id
      generatedPassword = undefined // No password for existing users
      isExistingUser = true

    } else {
      // ============================================
      // NEW USER - Create account with generated password
      // ============================================
      console.log('🆕 Creating new user account for:', email)

      // Generate password
      generatedPassword = generateMemberPassword(memberName, email)

      // Hash the password for storage
      const hashedPassword = await hash(generatedPassword, 10)

      // Create new user account
      const newUser = {
        id: `user_${Date.now()}`,
        name: memberName,
        email: email,
        password: hashedPassword,
        role: "participant",
        createdAt: new Date(),
      }

      // Save to database (simulated)
      users.push(newUser)
      userId = newUser.id
      isExistingUser = false

      console.log('✅ New user created:', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        generatedPassword: generatedPassword, // Log for development
      })
    }

    // ============================================
    // ADD MEMBER TO TEAM
    // ============================================
    const newMember = {
      userId: userId,
      email: email,
      name: memberName,
      status: "invited" as const,
      role: "member" as const,
      invitedAt: new Date(),
    }

    team.members.push(newMember)

    // ============================================
    // SEND EMAIL NOTIFICATION
    // ============================================
    const teamLeader = team.members.find((m) => m.role === "leader")
    const teamLeaderName = teamLeader?.name || "Team Leader"
    const hackathonTitle = team.hackathonName || "Hackathon"

    const emailSent = await sendTeamInvitationEmail({
      memberName: memberName,
      memberEmail: email,
      teamName: team.name,
      hackathonTitle: hackathonTitle,
      hackathonId: team.hackathonId || "",
      teamRole: "Team Member",
      generatedPassword: generatedPassword, // Only set for new users
      isExistingUser: isExistingUser, // Flag for email template
      teamLeaderName: teamLeaderName,
      registrationDetails: {
        domain: team.domain,
        techStack: team.techStack,
        projectIdea: team.projectIdea,
      },
    })

    if (!emailSent) {
      console.warn('⚠️ Failed to send invitation email, but member was added to team')
    }

    // ============================================
    // RETURN SUCCESS RESPONSE
    // ============================================
    const successMessage = isExistingUser
      ? "Member added to team! They will receive an email notification."
      : "Invitation sent successfully! The member will receive an email with login credentials."

    return NextResponse.json({
      success: true,
      member: {
        ...newMember,
        emailSent: emailSent,
        isExistingUser: isExistingUser,
      },
      message: successMessage,
      details: {
        userType: isExistingUser ? "existing" : "new",
        passwordGenerated: !isExistingUser,
      }
    })

  } catch (error) {
    console.error("Team invite error:", error)
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 })
  }
}
