import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { certificates, hackathons, ensureUser, winnersList } from "@/lib/data"

// GET: Get user's certificates
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  ensureUser(session)

  const userCertificates = certificates.filter((c) => c.userId === session.userId)

  return NextResponse.json({ certificates: userCertificates })
}

// POST: Generate certificate for a user
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only organizers and admins can generate certificates
  if (session.userRole !== "organizer" && session.userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  ensureUser(session)

  const body = await request.json()
  const { userId, userName, userEmail, hackathonId, type, rank } = body

  if (!userId || !userName || !userEmail || !hackathonId || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const hackathon = hackathons.find((h) => h.id === hackathonId)
  if (!hackathon) {
    return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
  }

  // Check if certificate already exists
  const existing = certificates.find(
    (c) => c.userId === userId && c.hackathonId === hackathonId && c.type === type
  )
  if (existing) {
    return NextResponse.json({ certificate: existing })
  }

  // Generate verification code
  const verificationCode = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const certificate = {
    id: `cert_${Date.now()}`,
    userId,
    userName,
    userEmail,
    hackathonId,
    hackathonTitle: hackathon.title,
    type,
    rank,
    issuedAt: Date.now(),
    verificationCode,
  }

  certificates.push(certificate)

  return NextResponse.json({ certificate }, { status: 201 })
}
