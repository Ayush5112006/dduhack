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
        const { studentId, hackathonId } = body

        if (!studentId || !hackathonId) {
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

        // Delete mentor assignment
        const { error: deleteError } = await supabase
            .from("mentor_assignments")
            .delete()
            .eq("hackathon_id", hackathonId)
            .eq("student_id", studentId)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error unassigning mentor:", error)
        return NextResponse.json(
            { error: "Failed to unassign mentor" },
            { status: 500 }
        )
    }
}
