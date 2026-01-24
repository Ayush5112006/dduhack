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
    const pendingUsers = await prisma.user.findMany({
      where: {
        status: "pending",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formatted = pendingUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    }))

    return NextResponse.json({ pendingUsers: formatted })
  } catch (error) {
    console.error("Failed to fetch pending approvals", error)
    return NextResponse.json({ error: "Failed to fetch pending approvals" }, { status: 500 })
  }
}
