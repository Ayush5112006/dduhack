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

        // Get all users with mentor role
        const { data: mentors, error: mentorsError } = await supabase
            .from("users")
            .select(`
        id,
        name,
        email,
        user_profiles (
          skills
        )
      `)
            .eq("role", "mentor")

        if (mentorsError) throw mentorsError

        // Get assignment counts for each mentor
        const { data: assignments } = await supabase
            .from("mentor_assignments")
            .select("mentor_id")

        const assignmentCounts = new Map()
        assignments?.forEach((a: { mentor_id: string }) => {
            assignmentCounts.set(a.mentor_id, (assignmentCounts.get(a.mentor_id) || 0) + 1)
        })

        const mentorsList = mentors?.map((mentor: any) => ({
            id: mentor.id,
            name: mentor.name,
            email: mentor.email,
            expertise: mentor.user_profiles?.skills || "General",
            assignedCount: assignmentCounts.get(mentor.id) || 0,
        })) || []

        return NextResponse.json({ mentors: mentorsList })
    } catch (error) {
        console.error("Error fetching mentors:", error)
        return NextResponse.json(
            { error: "Failed to fetch mentors" },
            { status: 500 }
        )
    }
}
