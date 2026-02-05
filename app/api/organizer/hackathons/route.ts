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

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["organizer", "admin"].includes(session.userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const db = getPrismaClient(session.userRole as "organizer" | "admin")
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.toLowerCase().trim()
  const categoryFilter = searchParams.get("category")?.toLowerCase()
  const statusFilter = searchParams.get("status")?.toLowerCase()

  try {
    const hackathons = await db.hackathon.findMany({
      where: {
        ownerId: session.userId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { registrations: true, submissions: true, teams: true } },
      },
    })

    const hydrated = hackathons
      .map(serializeHackathon)
      .filter((h) => {
        const matchesSearch = q
          ? h.title.toLowerCase().includes(q) || h.category.toLowerCase().includes(q)
          : true
        const matchesStatus = statusFilter ? h.status === statusFilter : true
        const matchesCategory = categoryFilter ? h.category.toLowerCase() === categoryFilter : true
        return matchesSearch && matchesStatus && matchesCategory
      })

    return NextResponse.json({ hackathons: hydrated }, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch organizer hackathons", error)
    return NextResponse.json({ error: "Failed to fetch hackathons" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!["organizer", "admin"].includes(session.userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const db = getPrismaClient(session.userRole as "organizer" | "admin")
  let body: unknown
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = hackathonInputSchema.safeParse(body)

  if (!parsed.success) {
    const errors = parsed.error.flatten()
    const errorMessage = errors.formErrors[0] || Object.values(errors.fieldErrors).flat()[0] || "Validation failed"
    return NextResponse.json({ error: errorMessage }, { status: 400 })
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
    const created = await db.hackathon.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        mode: data.mode,
        difficulty: data.difficulty,
        prize: data.prize || (data.prizeAmount ? `$${data.prizeAmount.toLocaleString('en-US')}` : null),
        prizeAmount: data.prizeAmount ?? 0,
        location: data.location || null,
        startDate,
        endDate,
        registrationDeadline,
        organizer: session.userName,
        ownerId: session.userId,
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

    return NextResponse.json({ hackathon: serializeHackathon(created) }, { status: 201 })
  } catch (error) {
    console.error("Failed to create hackathon", error)
    return NextResponse.json({ error: "Failed to create hackathon" }, { status: 500 })
  }
}
