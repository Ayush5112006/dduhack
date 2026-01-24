import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formatted = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      registrations: user._count.registrations,
      submissions: user._count.submissions,
    }))

    return NextResponse.json({ users: formatted })
  } catch (error) {
    console.error("Failed to fetch users", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
