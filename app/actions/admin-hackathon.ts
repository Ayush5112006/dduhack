"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function getAdminHackathons(query: string = "", page: number = 1, limit: number = 20) {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
        return { error: "Unauthorized" }
    }

    const offset = (page - 1) * limit

    try {
        const where: any = {}
        if (query) {
            where.title = { contains: query, mode: 'insensitive' }
        }

        const hackathons = await prisma.hackathon.findMany({
            where,
            include: {
                owner: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: {
                        registrations: true,
                        submissions: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        })

        const total = await prisma.hackathon.count({ where })

        return {
            hackathons,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalHackathons: total
        }
    } catch (error) {
        console.error("Fetch hackathons error:", error)
        return { error: "Failed to fetch hackathons" }
    }
}

export async function updateHackathonStatus(hackathonId: string, status: string) {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.hackathon.update({
            where: { id: hackathonId },
            data: { status }
        })
        revalidatePath("/admin/hackathons")
        return { success: true }
    } catch (error) {
        console.error("Update status error:", error)
        return { error: "Failed to update status" }
    }
}
