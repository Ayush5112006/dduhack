import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { hackathons, Hackathon, users, ensureUser, UserRole } from "@/lib/data"

export async function GET() {
  try {
    const session = await getSession()
    
    // If organizer, return only their hackathons
    if (session && session.userRole === "organizer") {
      const myHackathons = hackathons.filter(h => h.ownerId === session.userId)
      return NextResponse.json({ hackathons: myHackathons })
    }
    
    // If admin, return all hackathons
    if (session && session.userRole === "admin") {
      return NextResponse.json({ hackathons })
    }
    
    // Otherwise return empty
    return NextResponse.json({ hackathons: [] })
  } catch (error) {
    console.error("Error fetching hackathons:", error)
    return NextResponse.json({ hackathons: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.userRole !== "organizer" && session.userRole !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    ensureUser(session)

    const body = await request.json()
    const requiredFields = ["title", "startDate", "endDate", "registrationDeadline", "mode", "category", "prizeAmount"]
    const missing = requiredFields.filter((f) => !body[f])
    if (missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 })
    }

    const id = `hack_${Date.now()}`
    const newHackathon: Hackathon = {
      id,
      title: body.title,
      organizer: body.organizer || session.userName || "Organizer",
      banner: body.banner || "/placeholder.svg",
      prize: body.prize || `$${Number(body.prizeAmount).toLocaleString()}`,
      prizeAmount: Number(body.prizeAmount) || 0,
      mode: body.mode,
      location: body.location || "Global",
      registrationDeadline: body.registrationDeadline,
      startDate: body.startDate,
      endDate: body.endDate,
      category: body.category,
      participants: 0,
      tags: Array.isArray(body.tags) ? body.tags : [],
      difficulty: body.difficulty || "Intermediate",
      isFree: body.isFree ?? true,
      featured: false,
      description: body.description || "",
      eligibility: body.eligibility || "Open for all",
      status: body.status || "upcoming",
      ownerId: session.userId,
    }

    hackathons.push(newHackathon)

    return NextResponse.json({ success: true, hackathon: newHackathon }, { status: 201 })
  } catch (error) {
    console.error("Create hackathon error:", error)
    return NextResponse.json({ error: "Failed to create hackathon" }, { status: 500 })
  }
}
