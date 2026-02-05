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
            .select("id")
            .eq("owner_id", userId)

        if (hackathonsError) throw hackathonsError

        const hackathonIds = hackathons?.map((h: { id: string }) => h.id) || []

        // Get all students (participants) for organizer's hackathons
        const { data: registrations, error: registrationsError } = await supabase
            .from("registrations")
            .select(`
        id,
        user_id,
        hackathon_id,
        team_id,
        skills,
        users (
          id,
          name,
          email
        ),
        teams (
          name
        ),
        hackathons (
          id,
          title,
          category
        )
      `)
            .in("hackathon_id", hackathonIds)
            .eq("status", "approved")

        if (registrationsError) throw registrationsError

        // Get mentor assignments
        const { data: assignments } = await supabase
            .from("mentor_assignments")
            .select(`
        student_id,
        mentor_id,
        hackathon_id,
        users!mentor_assignments_mentor_id_fkey (
          id,
          name,
          email
        )
      `)
            .in("hackathon_id", hackathonIds)

        const assignmentsMap = new Map()
        assignments?.forEach((a: any) => {
            assignmentsMap.set(`${a.hackathon_id}-${a.student_id}`, {
                id: a.users?.id,
                name: a.users?.name,
                email: a.users?.email,
            })
        })

        const students = registrations?.map((reg: any) => ({
            id: reg.user_id,
            name: reg.users?.name || "Unknown",
            email: reg.users?.email || "",
            teamName: reg.teams?.name,
            skills: reg.skills || "",
            domain: reg.hackathons?.category || "General",
            hackathonId: reg.hackathon_id,
            hackathonTitle: reg.hackathons?.title || "",
            assignedMentor: assignmentsMap.get(`${reg.hackathon_id}-${reg.user_id}`),
        })) || []

        return NextResponse.json({ students })
    } catch (error) {
        console.error("Error fetching students:", error)
        return NextResponse.json(
            { error: "Failed to fetch students" },
            { status: 500 }
        )
    }
}
