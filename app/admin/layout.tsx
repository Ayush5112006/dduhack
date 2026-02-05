import { AppSidebar } from "@/components/layout/app-sidebar"
import { Navbar } from "@/components/layout/navbar"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session || session.userRole !== "admin") {
        redirect("/auth/login")
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AppSidebar />
            <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
                <Navbar />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
