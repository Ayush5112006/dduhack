"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function getUsers(query: string = "", page: number = 1, limit: number = 20) {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
        return { error: "Unauthorized" }
    }

    const offset = (page - 1) * limit

    try {
        const where: any = {}
        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ]
        }

        const users = await prisma.user.findMany({
            where,
            include: {
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

        const total = await prisma.user.count({ where })

        return {
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUsers: total
        }
    } catch (error) {
        console.error("Fetch users error:", error)
        return { error: "Failed to fetch users" }
    }
}

export async function updateUserRole(userId: string, newRole: string) {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        })
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        console.error("Update role error:", error)
        return { error: "Failed to update role" }
    }
}
