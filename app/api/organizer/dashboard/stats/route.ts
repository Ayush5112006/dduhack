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

        // Get total registrations
        const { count: totalRegistrations } = await supabase
            .from("registrations")
            .select("*", { count: "exact", head: true })
            .in("hackathon_id", hackathonIds)

        // Get team registrations
        const { count: teamsRegistered } = await supabase
            .from("teams")
            .select("*", { count: "exact", head: true })
            .in("hackathon_id", hackathonIds)

        // Get individual participants (registrations without team)
        const { count: individualParticipants } = await supabase
            .from("registrations")
            .select("*", { count: "exact", head: true })
            .in("hackathon_id", hackathonIds)
            .is("team_id", null)

        // Get assigned mentors count
        const { count: assignedMentors } = await supabase
            .from("mentor_assignments")
            .select("mentor_id", { count: "exact", head: true })
            .in("hackathon_id", hackathonIds)

        // Get submissions
        const { count: submissionsReceived } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .in("hackathon_id", hackathonIds)

        // Get active hackathons
        const { count: activeHackathons } = await supabase
            .from("hackathons")
            .select("*", { count: "exact", head: true })
            .eq("owner_id", userId)
            .eq("status", "active")

        // Get registration trend (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: registrationData } = await supabase
            .from("registrations")
            .select("created_at")
            .in("hackathon_id", hackathonIds)
            .gte("created_at", sevenDaysAgo.toISOString())

        // Group by date
        const registrationTrend = registrationData?.reduce((acc: any[], reg: { created_at: string }) => {
            const date = new Date(reg.created_at).toLocaleDateString()
            const existing = acc.find(item => item.date === date)
            if (existing) {
                existing.count++
            } else {
                acc.push({ date, count: 1 })
            }
            return acc
        }, []) || []

        // Get domain distribution
        const { data: registrations } = await supabase
            .from("registrations")
            .select("skills")
            .in("hackathon_id", hackathonIds)

        const domainDistribution: Record<string, number> = {}
        registrations?.forEach((reg: { skills?: string | null }) => {
            if (reg.skills) {
                const skills = reg.skills.split(",")
                skills.forEach((skill: string) => {
                    const trimmed = skill.trim()
                    if (trimmed) {
                        domainDistribution[trimmed] = (domainDistribution[trimmed] || 0) + 1
                    }
                })
            }
        })

        const domainDistributionArray = Object.entries(domainDistribution)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)

        return NextResponse.json({
            stats: {
                totalRegistrations: totalRegistrations || 0,
                teamsRegistered: teamsRegistered || 0,
                individualParticipants: individualParticipants || 0,
                assignedMentors: assignedMentors || 0,
                submissionsReceived: submissionsReceived || 0,
                activeHackathons: activeHackathons || 0,
            },
            registrationTrend,
            domainDistribution: domainDistributionArray,
        })
    } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        )
    }
}
