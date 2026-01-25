import { NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"

const hackathonInputSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  mode: z.string().min(1, "Mode is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  prizeAmount: z.number().int().nonnegative().optional(),
  prize: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  registrationDeadline: z.string().min(1, "Registration deadline is required"),
  eligibility: z.string().optional(),
  banner: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  isFree: z.boolean().optional(),
  featured: z.boolean().optional(),
})

function computeStatus(params: { startDate: Date; endDate: Date; registrationDeadline: Date }) {
  const now = new Date()
  if (params.endDate < now) return "past"
  if (params.startDate > now) return "upcoming"
  if (params.registrationDeadline < now) return "closed"
  return "live"
}

function serializeHackathon(h: any) {
  const status = computeStatus({
    startDate: h.startDate,
    endDate: h.endDate,
    registrationDeadline: h.registrationDeadline,
  })

  return {
    id: h.id,
    title: h.title,
    description: h.description || "",
    category: h.category,
    mode: h.mode,
    difficulty: h.difficulty,
    prize: h.prize,
    prizeAmount: h.prizeAmount,
    location: h.location,
    startDate: h.startDate,
    endDate: h.endDate,
    registrationDeadline: h.registrationDeadline,
    eligibility: h.eligibility || "",
    banner: h.banner || "",
    problemStatementPdf: h.problemStatementPdf || "",
    status,
    tags: h.tags ? (Array.isArray(h.tags) ? h.tags : JSON.parse(h.tags)) : [],
    isFree: h.isFree,
    featured: h.featured,
    counts: {
      registrations: h._count?.registrations ?? 0,
      submissions: h._count?.submissions ?? 0,
      teams: h._count?.teams ?? 0,
    },
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.userRole !== "organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const db = getPrismaClient("organizer")

  try {
    const hackathon = await db.hackathon.findFirst({
      where: { id: params.id, ownerId: session.userId },
      include: {
        _count: { select: { registrations: true, submissions: true, teams: true } },
      },
    })

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    return NextResponse.json({ hackathon: serializeHackathon(hackathon) }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch hackathon", error)
    return NextResponse.json({ error: "Failed to fetch hackathon" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.userRole !== "organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const db = getPrismaClient("organizer")
  let body: unknown
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = hackathonInputSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  const registrationDeadline = new Date(data.registrationDeadline)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || Number.isNaN(registrationDeadline.getTime())) {
    return NextResponse.json({ error: "Invalid date values" }, { status: 400 })
  }

  if (registrationDeadline > startDate) {
    return NextResponse.json({ error: "Registration deadline must be on or before start date" }, { status: 400 })
  }

  if (endDate < startDate) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
  }

  try {
    const existing = await db.hackathon.findFirst({ where: { id: params.id, ownerId: session.userId } })
    if (!existing) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    const updated = await db.hackathon.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        mode: data.mode,
        difficulty: data.difficulty,
        prize: data.prize || (data.prizeAmount ? `$${data.prizeAmount.toLocaleString()}` : null),
        prizeAmount: data.prizeAmount ?? 0,
        location: data.location || null,
        startDate,
        endDate,
        registrationDeadline,
        eligibility: data.eligibility || null,
        banner: data.banner || null,
        tags: data.tags?.length ? JSON.stringify(data.tags) : null,
        isFree: data.isFree ?? true,
        featured: data.featured ?? false,
        status: computeStatus({ startDate, endDate, registrationDeadline }),
      },
      include: {
        _count: { select: { registrations: true, submissions: true, teams: true } },
      },
    })

    return NextResponse.json({ hackathon: serializeHackathon(updated) }, { status: 200 })
  } catch (error) {
    console.error("Failed to update hackathon", error)
    return NextResponse.json({ error: "Failed to update hackathon" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.userRole !== "organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const db = getPrismaClient("organizer")

  try {
    const existing = await db.hackathon.findFirst({ where: { id: params.id, ownerId: session.userId } })
    if (!existing) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    await db.hackathon.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Failed to delete hackathon", error)
    return NextResponse.json({ error: "Failed to delete hackathon" }, { status: 500 })
  }
}
