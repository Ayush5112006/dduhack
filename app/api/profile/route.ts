import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"

// GET: Get current user's profile
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get database client for user's role
  const db = getPrismaClient(session.userRole)

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { profile: true, registrations: true, submissions: true, certificates: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Ensure profile exists (but don't auto-create stats here)
  const profile = user.profile || {
    bio: null,
    location: null,
    website: null,
    github: null,
    linkedin: null,
    twitter: null,
    skills: null,
    interests: null,
    avatar: user.avatar || null,
    totalHackathons: user.registrations.length,
    totalSubmissions: user.submissions.length,
    wins: user.certificates.filter((c) => c.type === "winner").length,
  }

  return NextResponse.json({
    profile,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}

// PUT: Update user profile
export async function PUT(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get database client for user's role
  const db = getPrismaClient(session.userRole)

  const body = await request.json()
  const { bio, location, website, github, linkedin, twitter, skills, interests, avatar } = body

  // Upsert profile
  const profile = await db.userProfile.upsert({
    where: { userId: session.userId },
    update: {
      bio,
      location,
      website,
      github,
      linkedin,
      twitter,
      skills: skills ? JSON.stringify(skills) : null,
      interests: interests ? JSON.stringify(interests) : null,
      avatar,
    },
    create: {
      userId: session.userId,
      bio,
      location,
      website,
      github,
      linkedin,
      twitter,
      skills: skills ? JSON.stringify(skills) : null,
      interests: interests ? JSON.stringify(interests) : null,
      avatar,
    },
  })

  // Also store avatar on user for easy access elsewhere
  if (avatar !== undefined) {
    await db.user.update({ where: { id: session.userId }, data: { avatar } })
  }

  return NextResponse.json({ profile })
}
