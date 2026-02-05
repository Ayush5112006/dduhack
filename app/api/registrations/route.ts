import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// POST - Create a new registration
export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { type, userId, teamId, hackathonId, profile, motivation, domain, techStack, projectIdea } = body

        // Check if user already registered
        const existingRegistration = await prisma.registration.findFirst({
            where: {
                hackathonId,
                OR: [
                    { userId: session.userId },
                    { team: { members: { some: { userId: session.userId } } } },
                ],
            },
        })

        if (existingRegistration) {
            return NextResponse.json(
                { error: "You have already registered for this hackathon" },
                { status: 400 }
            )
        }

        // Create registration
        const registration = await prisma.registration.create({
            data: {
                type,
                userId: type === "individual" ? userId : null,
                teamId: type === "team" ? teamId : null,
                hackathonId,
                domain,
                techStack: techStack || [],
                motivation: motivation || null,
                projectIdea: projectIdea || null,
                status: "pending",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                team: {
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
                },
                hackathon: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        })

        // Update user profile if individual registration
        if (type === "individual" && profile) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    skills: profile.skills,
                    github: profile.github,
                    linkedin: profile.linkedin,
                },
            })
        }

        return NextResponse.json({ registration }, { status: 201 })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Failed to create registration" },
            { status: 500 }
        )
    }
}

// GET - Get user's registrations
export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const hackathonId = searchParams.get("hackathonId")

        const where: any = {
            OR: [
                { userId: session.userId },
                { team: { members: { some: { userId: session.userId } } } },
            ],
        }

        if (hackathonId) {
            where.hackathonId = hackathonId
        }

        const registrations = await prisma.registration.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                team: {
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
                },
                hackathon: {
                    select: {
                        id: true,
                        title: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json({ registrations })
    } catch (error) {
        console.error("Get registrations error:", error)
        return NextResponse.json(
            { error: "Failed to fetch registrations" },
            { status: 500 }
        )
    }
}
