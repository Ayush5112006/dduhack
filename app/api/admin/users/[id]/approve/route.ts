import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params

    const user = await prisma.user.update({
      where: { id },
      data: { status: "active" },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Failed to approve user", error)
    return NextResponse.json({ error: "Failed to approve user" }, { status: 500 })
  }
}
