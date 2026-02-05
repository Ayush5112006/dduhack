import { getUsers } from "@/app/actions/admin-user"
import { UsersTable } from "./users-table"

export const metadata = {
    title: "Manage Users | HackHub Admin",
}

export default async function AdminUsersPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string, page?: string }>
}) {
    const { q, page } = await searchParams
    const query = q || ""
    const currentPage = Number(page) || 1

    const { users, totalPages, error } = await getUsers(query, currentPage)

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">View and manage all users on the platform.</p>
            </div>

            <UsersTable
                users={users || []}
                totalPages={totalPages || 0}
                currentPage={currentPage}
                searchQuery={query}
            />
        </div>
    )
}
