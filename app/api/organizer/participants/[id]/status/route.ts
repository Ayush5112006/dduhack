import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { supabaseAdmin } from "@/lib/supabase"

const supabase = supabaseAdmin


export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session || session.userRole !== "organizer") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const participantId = params.id
        const body = await req.json()
        const { status } = body

        if (!["approved", "rejected", "pending"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        // Verify the participant belongs to organizer's hackathon
        const { data: registration } = await supabase
            .from("registrations")
            .select(`
        id,
        hackathon_id,
        hackathons (
          owner_id
        )
      `)
            .eq("id", participantId)
            .single()

        if (!registration || registration.hackathons?.owner_id !== session.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Update status
        const { error: updateError } = await supabase
            .from("registrations")
            .update({ status })
            .eq("id", participantId)

        if (updateError) throw updateError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating participant status:", error)
        return NextResponse.json(
            { error: "Failed to update participant status" },
            { status: 500 }
        )
    }
}
