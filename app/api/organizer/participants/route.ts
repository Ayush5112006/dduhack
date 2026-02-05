import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabaseAdmin } from "@/lib/supabase"

const supabase = supabaseAdmin

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.userRole !== "organizer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.userId

    // Get organizer's hackathons
    const { data: hackathons, error: hackathonsError } = await supabase
      .from("hackathons")
      .select("id, title")
      .eq("owner_id", userId)

    if (hackathonsError) throw hackathonsError

    const hackathonIds = hackathons?.map((h: { id: string }) => h.id) || []

    // Get all registrations for organizer's hackathons
    const { data: registrations, error: registrationsError } = await supabase
      .from("registrations")
      .select(`
        id,
        user_id,
        hackathon_id,
        team_id,
        status,
        skills,
        created_at,
        users (
          id,
          name,
          email
        ),
        teams (
          id,
          name,
          team_members (
            users (
              name
            )
          )
        ),
        hackathons (
          title
        )
      `)
      .in("hackathon_id", hackathonIds)
      .order("created_at", { ascending: false })

    if (registrationsError) throw registrationsError

    const participants = registrations?.map((reg: any) => ({
      id: reg.id,
      name: reg.users?.name || "Unknown",
      email: reg.users?.email || "",
      type: reg.team_id ? "team" : "individual",
      teamName: reg.teams?.name,
      teamMembers: reg.teams?.team_members?.map((tm: any) => tm.users?.name).filter(Boolean),
      skills: reg.skills || "",
      status: reg.status,
      hackathonTitle: reg.hackathons?.title || "",
      registeredAt: reg.created_at,
    })) || []

    return NextResponse.json({ participants })
  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    )
  }
}
