import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { registrations, findHackathonById } from "@/lib/data"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const hackathon = findHackathonById(id)
  if (!hackathon) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = hackathon.ownerId === session.userId
  const isAdmin = session.userRole === "admin"
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const list = registrations.filter((r) => r.hackathonId === hackathon.id)
  const format = request.nextUrl.searchParams.get("format")
  if (format === "csv") {
    const header = "id,email,mode,status,createdAt"
    const rows = list.map((r) => `${r.id},${r.userEmail},${r.mode},${r.status},${new Date(r.createdAt).toISOString()}`)
    const csv = [header, ...rows].join("\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=registrations-${hackathon.id}.csv`,
      },
    })
  }

  return NextResponse.json({ registrations: list })
}
