"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/logo"
import {
    Home,
    Trophy,
    LayoutDashboard,
    Menu,
    Settings,
    LogOut,
    User,
    PlusCircle,
    Search,
    FileText,
    Award,
    Bell,
    Calendar,
} from "lucide-react"

import { useEffect, useState } from "react"
import { useSession } from "@/components/session-provider"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AppSidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const { user, isLoading, sessionFetched } = useSession()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // ✅ CRITICAL: If not mounted, return empty div with same className
    // This prevents hydration mismatch because server renders empty, 
    // client also renders empty initially, then content fills in after mount
    // ✅ MOUNT GUARD - Critical for hydration safety
    // During hydration: server and client both return empty div
    // After mount: component renders actual content
    if (!isMounted) {
        return (
            <div
                className={cn("pb-12 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground hidden lg:block w-64 fixed left-0 top-0 overflow-y-auto z-50", className)}
            >
                {/* Empty during hydration, will be filled after mount */}
            </div>
        )
    }

    const isOrganizer = user?.userRole === "organizer"
    const isAdmin = user?.userRole === "admin"
    // If logged in as participant or generally logged in without special role, show participant routes
    // But we need to handle "Public" view as well. 
    // If user is logged in, they likely want their dashboard links.
    const isParticipant = user?.userRole === "participant"

    const participantRoutes = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: pathname === "/dashboard" },
        { label: "My Profile", icon: User, href: "/dashboard/profile", active: pathname.startsWith("/dashboard/profile") },
        { label: "Browse Hackathons", icon: Search, href: "/hackathons", active: pathname === "/hackathons" || pathname.startsWith("/hackathons/") },
        { label: "My Team", icon: User, href: "/dashboard/team", active: pathname.startsWith("/dashboard/team") },
        { label: "Submissions", icon: FileText, href: "/dashboard/submissions", active: pathname.startsWith("/dashboard/submissions") },
        { label: "Notifications", icon: Bell, href: "/dashboard/notifications", active: pathname.startsWith("/dashboard/notifications") },
        { label: "Certificates", icon: Award, href: "/dashboard/certificates", active: pathname.startsWith("/dashboard/certificates") },
    ]

    const organizerRoutes = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/organizer/dashboard", active: pathname === "/organizer/dashboard" },
        { label: "Create Hackathon", icon: PlusCircle, href: "/organizer/hackathons/create", active: pathname.startsWith("/organizer/hackathons/create") },
        { label: "Manage Hackathons", icon: Trophy, href: "/organizer/dashboard/hackathons", active: pathname.startsWith("/organizer/dashboard/hackathons") && !pathname.includes("create") },
        { label: "Participants", icon: User, href: "/organizer/dashboard/participants", active: pathname.startsWith("/organizer/dashboard/participants") },
        { label: "Mentor Assignments", icon: User, href: "/organizer/dashboard/mentors", active: pathname.startsWith("/organizer/dashboard/mentors") },
        { label: "Submissions", icon: FileText, href: "/organizer/dashboard/submissions", active: pathname.startsWith("/organizer/dashboard/submissions") },
        { label: "Settings", icon: Settings, href: "/organizer/dashboard/settings", active: pathname.startsWith("/organizer/dashboard/settings") },
    ]

    const adminRoutes = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard", active: pathname === "/admin/dashboard" },
        { label: "Manage Users", icon: User, href: "/admin/users", active: pathname.startsWith("/admin/users") },
        { label: "Manage Organizers", icon: User, href: "/admin/organizers", active: pathname.startsWith("/admin/organizers") },
        { label: "All Hackathons", icon: Trophy, href: "/admin/hackathons", active: pathname.startsWith("/admin/hackathons") },
        { label: "Problem Statements", icon: FileText, href: "/admin/problems", active: pathname.startsWith("/admin/problems") },
        { label: "Judges Management", icon: User, href: "/admin/judges", active: pathname.startsWith("/admin/judges") },
        { label: "Results & Winners", icon: Award, href: "/admin/results", active: pathname.startsWith("/admin/results") },
        { label: "System Notifications", icon: Bell, href: "/admin/notifications", active: pathname.startsWith("/admin/notifications") },
        { label: "Reports & Analytics", icon: FileText, href: "/admin/reports", active: pathname.startsWith("/admin/reports") },
    ]

    const publicRoutes = [
        { label: "Home", icon: Home, href: "/", active: pathname === "/" },
        { label: "Hackathons", icon: Trophy, href: "/hackathons", active: pathname.startsWith("/hackathons") },
        { label: "Host Hackathon", icon: PlusCircle, href: "/organizer/dashboard", active: pathname.startsWith("/organizer") },
    ]

    // Priority: Admin -> Organizer -> Participant -> Public
    let routes = publicRoutes
    if (isAdmin) {
        routes = adminRoutes
    } else if (isOrganizer) {
        routes = organizerRoutes
    } else if (isParticipant) {
        routes = participantRoutes
    }

    const bottomRoutes = [
        {
            label: "Settings", // Keep settings common
            icon: Settings,
            href: isAdmin ? "/admin/settings" : isOrganizer ? "/organizer/dashboard/settings" : isParticipant ? "/dashboard/settings" : "/settings",
            active: pathname.endsWith("/settings"),
        },
    ]

    const sidebarContent = (
        <div className="space-y-4 py-4">
            <div className="px-3 py-2">
                <div className="mb-8 px-4 flex items-center gap-2">
                    <Logo />
                </div>
                {(isOrganizer || isParticipant) && (
                    <div className="px-4 mb-4">
                        <Button variant="outline" size="sm" asChild className="w-full justify-start text-xs h-8 border-sidebar-border/50 bg-sidebar-accent/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                            <Link href="/">
                                <Home className="mr-2 h-3.5 w-3.5" />
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                )}
                <div className="space-y-1">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-sidebar-foreground/70 uppercase">
                        {isOrganizer ? "Organizer" : isParticipant ? "Dashboard" : "Discover"}
                    </h2>
                    {routes.map((route) => (
                        <Button
                            key={route.href}
                            variant={route.active ? "secondary" : "ghost"}
                            asChild
                            className={cn(
                                "w-full justify-start font-medium mb-1 transition-all duration-200",
                                route.active
                                    ? "bg-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary rounded-l-none"
                                    : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                            )}
                        >
                            <Link href={route.href}>
                                <route.icon className={cn("mr-3 h-5 w-5", route.active ? "text-sidebar-primary" : "text-sidebar-foreground/60")} />
                                {route.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>

            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-sidebar-foreground/70 uppercase">
                    Account
                </h2>
                <div className="space-y-1">
                    {bottomRoutes.map((route) => (
                        <Button
                            key={route.href}
                            variant={route.active ? "secondary" : "ghost"}
                            asChild
                            className={cn(
                                "w-full justify-start font-medium mb-1 transition-all duration-200",
                                route.active
                                    ? "bg-sidebar-primary/10 text-sidebar-primary border-l-2 border-sidebar-primary rounded-l-none"
                                    : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                            )}
                        >
                            <Link href={route.href}>
                                <route.icon className={cn("mr-3 h-5 w-5", route.active ? "text-sidebar-primary" : "text-sidebar-foreground/60")} />
                                {route.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )

    const sidebarSkeleton = (
        <div className="space-y-4 py-4">
            <div className="px-3 py-2">
                <div className="mb-8 px-4 flex items-center gap-2">
                    <Logo />
                </div>
                <div className="space-y-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-9 w-full bg-sidebar-accent/50 rounded mb-1 animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div
            className={cn("pb-12 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground hidden lg:block w-64 fixed left-0 top-0 overflow-y-auto z-50", className)}
            suppressHydrationWarning
        >
            {sidebarContent}
        </div>
    )
}

export function MobileSidebar() {
    const pathname = usePathname();

    // Check if we are on a page where the sidebar should be active logic if needed

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" className="lg:hidden p-2">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <AppSidebar className="block w-full h-full static border-r-0" />
            </SheetContent>
        </Sheet>
    )
}
