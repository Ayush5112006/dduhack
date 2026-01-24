import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    if (!body.status || !["upcoming", "live", "past"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const prisma = getPrismaClient("organizer")

    const hackathon = await prisma.hackathon.update({
      where: { id },
      data: { status: body.status },
    })

    return NextResponse.json({ success: true, hackathon })
  } catch (error) {
    console.error("Update hackathon status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
