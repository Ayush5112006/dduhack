"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function getUserCertificates() {
    const session = await getSession()
    if (!session) {
        return { error: "Unauthorized" }
    }

    try {
        const certificates = await prisma.certificate.findMany({
            where: { userId: session.userId },
            orderBy: { issuedAt: "desc" }
        })
        return { certificates }
    } catch (error) {
        console.error("Fetch certificates error:", error)
        return { error: "Failed to fetch certificates" }
    }
}

export async function verifyCertificate(code: string) {
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { verificationCode: code },
            include: { user: { select: { name: true } } }
        })
        return { certificate }
    } catch (error) {
        console.error("Verify certificate error:", error)
        return { error: "Failed to verify certificate" }
    }
}

// Temporary: Manually issue a certificate for testing
export async function issueMockCertificate(hackathonId: string) {
    const session = await getSession()
    if (!session) return { error: "Unauthorized" }

    const hackathon = await prisma.hackathon.findUnique({
        where: { id: hackathonId }
    })

    if (!hackathon) return { error: "Hackathon not found" }

    try {
        const certificate = await prisma.certificate.create({
            data: {
                userId: session.userId,
                userName: session.userName || "Participant",
                userEmail: session.userEmail || "",
                hackathonId: hackathon.id,
                hackathonTitle: hackathon.title,
                type: "Participation",
                verificationCode: uuidv4(), // Generate unique code
                verified: true
            }
        })
        revalidatePath("/dashboard/certificates")
        return { success: true, certificate }
    } catch (error) {
        console.error("Issuance error:", error)
        return { error: "Already issued or failed" }
    }
}
