import { getAdminHackathons } from "@/app/actions/admin-hackathon"
import { HackathonsTable } from "./hackathons-table"

export const metadata = {
    title: "Manage Hackathons | HackHub Admin",
}

export default async function AdminHackathonsPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string, page?: string }>
}) {
    const { q, page } = await searchParams
    const query = q || ""
    const currentPage = Number(page) || 1

    const { hackathons, totalPages, error } = await getAdminHackathons(query, currentPage)

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hackathon Management</h1>
                <p className="text-muted-foreground">Monitor and manage all hackathons on the platform.</p>
            </div>

            <HackathonsTable
                hackathons={hackathons || []}
                totalPages={totalPages || 0}
                currentPage={currentPage}
                searchQuery={query}
            />
        </div>
    )
}
