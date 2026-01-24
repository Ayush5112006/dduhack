import { NextRequest, NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma-multi-db"

export async function GET(req: NextRequest) {
  try {
    const prisma = getPrismaClient("organizer")
    
    // Count total registrations from all hackathons
    const totalParticipants = await prisma.registration.count()
    
    return NextResponse.json({ totalParticipants })
  } catch (error) {
    console.error("Failed to fetch total participants", error)
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 })
  }
}
