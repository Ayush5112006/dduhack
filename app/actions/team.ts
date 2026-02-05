"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"

export async function getUserTeam() {
    const session = await getSession()
    if (!session) return null

    // Fetch the first team the user is part of (simplification for now)
    // Ideally we return detailed list, but "My Team" usually implies one active team context or a list.
    // Let's return the most recently created/joined team.
    const membership = await prisma.teamMember.findFirst({
        where: { userId: session.userId },
        include: {
            team: {
                include: {
                    members: true,
                    hackathon: { select: { title: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return membership?.team || null
}

export async function getActiveHackathons() {
    return await prisma.hackathon.findMany({
        where: {
            status: "live",
            endDate: { gte: new Date() }
        },
        select: { id: true, title: true }
    })
}

export async function createTeam(teamName: string, hackathonId: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true }
        })

        if (!user || !user.email) return { error: "User email not found" }

        // Generate a unique 6-character code
        const code = nanoid(6).toUpperCase()

        const team = await prisma.team.create({
            data: {
                name: teamName,
                code: code,
                leaderId: session.userId,
                leaderEmail: user.email,
                hackathonId: hackathonId,
                members: {
                    create: {
                        userId: session.userId,
                        email: user.email,
                        role: 'leader',
                        status: 'accepted'
                    }
                },
            }
        })

        revalidatePath("/dashboard/team")
        return { success: true, team }
    } catch (error) {
        console.error("Create team error:", error)
        return { error: "Failed to create team" }
    }
}

export async function joinTeam(code: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true }
        })

        if (!user || !user.email) return { error: "User email not found" }

        const team = await prisma.team.findUnique({
            where: { code },
            include: { members: true }
        })

        if (!team) return { error: "Invalid team code" }

        // Check if user is already in team
        const isMember = team.members.some(m => m.userId === session.userId)
        if (isMember) return { error: "You are already a member of this team" }

        // Check max members (e.g. 4)
        if (team.members.length >= 4) return { error: "Team is full" }

        await prisma.teamMember.create({
            data: {
                teamId: team.id,
                userId: session.userId,
                email: user.email,
                role: 'member',
                status: 'accepted'
            }
        })

        revalidatePath("/dashboard/team")
        return { success: true, team }
    } catch (error) {
        console.error("Join team error:", error)
        return { error: "Failed to join team" }
    }
}
