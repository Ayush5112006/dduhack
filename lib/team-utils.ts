/**
 * Team Management Utilities
 * Handles team validation, permissions, and constraints
 */

import { prisma } from "@/lib/prisma"

/**
 * Validate team size against hackathon limits
 */
export const validateTeamSize = async (
  teamId: string,
  hackathonId: string
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { minTeamSize: true, maxTeamSize: true },
    })

    if (!hackathon) {
      return { valid: false, error: "Hackathon not found" }
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        members: {
          where: { status: "joined" },
        },
      },
    })

    if (!team) {
      return { valid: false, error: "Team not found" }
    }

    const memberCount = team.members.length
    const { minTeamSize, maxTeamSize } = hackathon

    if (memberCount < minTeamSize) {
      return {
        valid: false,
        error: `Team must have at least ${minTeamSize} members (current: ${memberCount})`,
      }
    }

    if (memberCount > maxTeamSize) {
      return {
        valid: false,
        error: `Team cannot have more than ${maxTeamSize} members (current: ${memberCount})`,
      }
    }

    return { valid: true }
  } catch (error) {
    console.error("Team size validation error:", error)
    return { valid: false, error: "Failed to validate team size" }
  }
}

/**
 * Check if user is already in a team for this hackathon
 */
export const isUserInTeam = async (
  userId: string,
  hackathonId: string
): Promise<{ inTeam: boolean; teamId?: string }> => {
  try {
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId,
        team: { hackathonId },
        status: "joined",
      },
      select: { teamId: true },
    })

    if (existingMembership) {
      return { inTeam: true, teamId: existingMembership.teamId }
    }

    return { inTeam: false }
  } catch (error) {
    console.error("Team membership check error:", error)
    return { inTeam: false }
  }
}

/**
 * Check user's role in a team
 */
export const getUserTeamRole = async (
  userId: string,
  teamId: string
): Promise<"leader" | "member" | null> => {
  try {
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId },
      },
      select: { role: true },
    })

    return (membership?.role as "leader" | "member") || null
  } catch (error) {
    console.error("Team role check error:", error)
    return null
  }
}

/**
 * Check if user can submit for team
 */
export const canUserSubmitForTeam = async (
  userId: string,
  teamId: string
): Promise<{ canSubmit: boolean; error?: string }> => {
  try {
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
      select: { status: true, role: true },
    })

    if (!membership) {
      return { canSubmit: false, error: "User is not a member of this team" }
    }

    if (membership.status !== "joined") {
      return { canSubmit: false, error: "User has not joined this team yet" }
    }

    return { canSubmit: true }
  } catch (error) {
    console.error("Team submission check error:", error)
    return { canSubmit: false, error: "Failed to check team submission rights" }
  }
}

/**
 * Check if user can manage team (is leader)
 */
export const canUserManageTeam = async (
  userId: string,
  teamId: string
): Promise<boolean> => {
  try {
    const role = await getUserTeamRole(userId, teamId)
    return role === "leader"
  } catch (error) {
    console.error("Team management check error:", error)
    return false
  }
}

/**
 * Check if user can add members to team
 */
export const canUserAddMembers = async (
  userId: string,
  teamId: string
): Promise<{ canAdd: boolean; error?: string }> => {
  // Only team leader can add members
  const isLeader = await canUserManageTeam(userId, teamId)

  if (!isLeader) {
    return { canAdd: false, error: "Only team leader can add members" }
  }

  return { canAdd: true }
}

/**
 * Get team with members and their roles
 */
export const getTeamDetails = async (teamId: string) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return team
  } catch (error) {
    console.error("Get team details error:", error)
    return null
  }
}

/**
 * Get team members with specific status
 */
export const getTeamMembersByStatus = async (
  teamId: string,
  status: "joined" | "invited" | "declined"
) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: { teamId, status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return members
  } catch (error) {
    console.error("Get team members error:", error)
    return []
  }
}

/**
 * Check if team can accept more members
 */
export const canTeamAddMoreMembers = async (
  teamId: string,
  hackathonId: string
): Promise<{ canAdd: boolean; error?: string }> => {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { maxTeamSize: true },
    })

    if (!hackathon) {
      return { canAdd: false, error: "Hackathon not found" }
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        members: {
          where: { status: "joined" },
        },
      },
    })

    if (!team) {
      return { canAdd: false, error: "Team not found" }
    }

    const currentSize = team.members.length
    const maxSize = hackathon.maxTeamSize

    if (currentSize >= maxSize) {
      return { canAdd: false, error: `Team has reached maximum size (${maxSize})` }
    }

    return { canAdd: true }
  } catch (error) {
    console.error("Team capacity check error:", error)
    return { canAdd: false, error: "Failed to check team capacity" }
  }
}

/**
 * Validate team submission eligibility
 */
export const validateTeamSubmissionEligibility = async (
  teamId: string,
  hackathonId: string
): Promise<{ eligible: boolean; error?: string }> => {
  // Check team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { hackathonId: true },
  })

  if (!team || team.hackathonId !== hackathonId) {
    return { eligible: false, error: "Team does not belong to this hackathon" }
  }

  // Check team size
  const sizeValidation = await validateTeamSize(teamId, hackathonId)
  if (!sizeValidation.valid) {
    return { eligible: false, error: sizeValidation.error }
  }

  // Check all members are joined (not invited/pending)
  const joinedMembers = await getTeamMembersByStatus(teamId, "joined")
  const hackatho = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    select: { minTeamSize: true },
  })

  if (joinedMembers.length < (hackatho?.minTeamSize || 2)) {
    return {
      eligible: false,
      error: `Team must have at least ${hackatho?.minTeamSize || 2} confirmed members to submit`,
    }
  }

  return { eligible: true }
}

/**
 * Get valid team submission mode for hackathon
 */
export const getTeamSubmissionMode = async (
  hackathonId: string
): Promise<{
  allowTeams: boolean
  allowIndividual: boolean
  forceTeams: boolean
  forceIndividual: boolean
}> => {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: {
        allowTeams: true,
        allowSoloSubmission: true,
      },
    })

    if (!hackathon) {
      return {
        allowTeams: true,
        allowIndividual: false,
        forceTeams: true,
        forceIndividual: false,
      }
    }

    return {
      allowTeams: hackathon.allowTeams,
      allowIndividual: hackathon.allowSoloSubmission,
      forceTeams: hackathon.allowTeams && !hackathon.allowSoloSubmission,
      forceIndividual: !hackathon.allowTeams && hackathon.allowSoloSubmission,
    }
  } catch (error) {
    console.error("Get submission mode error:", error)
    return {
      allowTeams: true,
      allowIndividual: false,
      forceTeams: true,
      forceIndividual: false,
    }
  }
}
