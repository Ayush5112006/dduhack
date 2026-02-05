import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get("code")

        if (!code) {
            return NextResponse.json({ error: "Team code is required" }, { status: 400 })
        }

        const team = await prisma.team.findUnique({
            where: { code },
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
                hackathon: {
                    select: {
                        id: true,
                        title: true,
                        maxTeamSize: true,
                    },
                },
            },
        })

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 })
        }

        return NextResponse.json({ team })
    } catch (error) {
        console.error("Check team error:", error)
        return NextResponse.json({ error: "Failed to check team" }, { status: 500 })
    }
}
