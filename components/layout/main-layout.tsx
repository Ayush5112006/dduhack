"use client"

import { ReactNode } from "react"
import { AppSidebar, MobileSidebar } from "./app-sidebar"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSession } from "@/components/session-provider"

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const { isAuthenticated, user, logout } = useSession()
    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <AppSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64 transition-all duration-300 ease-in-out w-full">
                {/* Mobile Header / Top Bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/40 bg-background/60 backdrop-blur-xl px-4 lg:px-6 justify-between transition-all">
                    <div className="flex items-center gap-2 lg:hidden">
                        <MobileSidebar />
                        <Link href="/" className="flex items-center gap-2">
                            <span className="font-bold text-lg tracking-tight">HackHub</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-end lg:justify-between">
                        <div className="hidden lg:flex relative max-w-md w-full ml-4">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search hackathons..."
                                className="w-full bg-secondary/50 pl-9 border-0 text-sm focus-visible:ring-1"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-sm font-medium leading-none">{user.userName}</span>
                                        <span className="text-xs text-muted-foreground">{user.userRole}</span>
                                    </div>
                                    <Button onClick={logout} variant="ghost" size="sm" className="h-8 w-8 px-0">
                                        <LogOut className="h-4 w-4" />
                                        <span className="sr-only">Log out</span>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground">
                                        <Link href="/auth/login">
                                            Log in
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href="/auth/register">Sign up</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
