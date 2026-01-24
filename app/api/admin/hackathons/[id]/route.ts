import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const hackathonId = params.id

  try {
    await prisma.hackathon.delete({
      where: { id: hackathonId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete hackathon", error)
    return NextResponse.json({ error: "Failed to delete hackathon" }, { status: 500 })
  }
}
