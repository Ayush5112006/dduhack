"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createHackathon(formData: FormData) {
    const session = await getSession()
    if (!session || session.userRole !== "organizer") {
        return { error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const startDate = new Date(formData.get("startDate") as string)
    const endDate = new Date(formData.get("endDate") as string)
    const registrationDeadline = new Date(formData.get("registrationDeadline") as string)
    const mode = formData.get("mode") as string
    const difficulty = formData.get("difficulty") as string
    const category = formData.get("category") as string
    const prizeAmount = Number(formData.get("prizeAmount")) || 0

    if (!title || !startDate || !endDate) {
        return { error: "Missing required fields" }
    }

    try {
        const hackathon = await prisma.hackathon.create({
            data: {
                title,
                description,
                startDate,
                endDate,
                registrationDeadline,
                mode,
                difficulty,
                category,
                prizeAmount,
                ownerId: session.userId,
                organizer: session.userName || "Organizer",
                status: "upcoming"
            }
        })

        revalidatePath("/organizer/dashboard/hackathons")
        return { success: true, hackathonId: hackathon.id }
    } catch (error) {
        console.error("Create hackathon error:", error)
        return { error: "Failed to create hackathon" }
    }
}

export async function getOrganizerHackathons() {
    const session = await getSession()
    if (!session || session.userRole !== "organizer") {
        return { error: "Unauthorized" }
    }

    try {
        const hackathons = await prisma.hackathon.findMany({
            where: { ownerId: session.userId },
            include: {
                _count: {
                    select: {
                        registrations: true,
                        submissions: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return { hackathons }
    } catch (error) {
        console.error("Fetch organizer hackathons error:", error)
        return { error: "Failed to fetch hackathons" }
    }
}
