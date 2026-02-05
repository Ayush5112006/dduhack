import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabaseAdmin } from "@/lib/supabase"

const supabase = supabaseAdmin


export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.userRole !== "organizer") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { studentId, mentorId, hackathonId } = body

        if (!studentId || !mentorId || !hackathonId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Verify the hackathon belongs to the organizer
        const { data: hackathon } = await supabase
            .from("hackathons")
            .select("owner_id")
            .eq("id", hackathonId)
            .single()

        if (!hackathon || hackathon.owner_id !== session.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Create or update mentor assignment
        const { error: assignError } = await supabase
            .from("mentor_assignments")
            .upsert({
                hackathon_id: hackathonId,
                student_id: studentId,
                mentor_id: mentorId,
                assigned_at: new Date().toISOString(),
            })

        if (assignError) throw assignError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error assigning mentor:", error)
        return NextResponse.json(
            { error: "Failed to assign mentor" },
            { status: 500 }
        )
    }
}
