import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { submissions, hackathons, problemStatements } from "@/lib/data"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const mine = submissions.filter((s) => s.userId === session.userId)
  return NextResponse.json({
    submissions: mine.map((s) => ({
      ...s,
      hackathon: hackathons.find((h) => h.id === s.hackathonId) || null,
      problem: s.psId ? problemStatements.find((p) => p.id === s.psId) || null : null,
    })),
  })
}
