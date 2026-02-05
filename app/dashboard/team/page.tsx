import { getActiveHackathons, getUserTeam } from "@/app/actions/team"
import { TeamManager } from "@/components/teams/team-manager"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function TeamDashboardPage() {
    const session = await getSession()
    if (!session) {
        redirect("/auth/login")
    }

    const team = await getUserTeam()
    const activeHackathons = await getActiveHackathons()

    // Serialize team data to avoid Date object warnings
    const serializedTeam = team ? {
        ...team,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
        hackathon: team.hackathon,
        members: team.members.map(m => ({
            ...m,
            createdAt: m.createdAt.toISOString()
        }))
    } : null

    return (
        <TeamManager
            initialTeam={serializedTeam}
            activeHackathons={activeHackathons.map(h => ({ id: h.id, title: h.title }))}
        />
    )
}

