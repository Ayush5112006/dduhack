"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function getUserProfile() {
    const session = await getSession()
    if (!session) {
        return { error: "Unauthorized" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { profile: true }
        })

        return { user, profile: user?.profile || null }
    } catch (error) {
        console.error("Get profile error:", error)
        return { error: "Failed to fetch profile" }
    }
}

export async function updateUserProfile(formData: FormData) {
    const session = await getSession()
    if (!session) {
        return { error: "Unauthorized" }
    }

    const bio = formData.get("bio") as string
    const location = formData.get("location") as string
    const website = formData.get("website") as string
    const github = formData.get("github") as string
    const linkedin = formData.get("linkedin") as string
    const skills = formData.get("skills") as string

    try {
        await prisma.userProfile.upsert({
            where: { userId: session.userId },
            update: {
                bio,
                location,
                website,
                github,
                linkedin,
                skills,
            },
            create: {
                userId: session.userId,
                bio,
                location,
                website,
                github,
                linkedin,
                skills,
            }
        })

        revalidatePath("/dashboard/profile")
        return { success: true }
    } catch (error) {
        console.error("Update profile error:", error)
        return { error: "Failed to update profile" }
    }
}
