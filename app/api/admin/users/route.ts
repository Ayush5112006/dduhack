export const dynamic = "force-dynamic";

import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { users } from "@/lib/data"

export async function GET() {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ users })
}
