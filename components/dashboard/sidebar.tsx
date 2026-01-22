"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Trophy,
  Bell,
  Settings,
  User,
  LogOut,
  Calendar,
  FileText,
  Award,
} from "lucide-react"

const participantLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Hackathons", href: "/dashboard/hackathons", icon: Trophy },
  { name: "Submissions", href: "/dashboard/submissions", icon: FileText },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const organizerLinks = [
  { name: "Overview", href: "/organizer/dashboard", icon: LayoutDashboard },
  { name: "My Hackathons", href: "/organizer/dashboard/hackathons", icon: Trophy },
  { name: "Participants", href: "/organizer/dashboard/participants", icon: User },
  { name: "Submissions", href: "/organizer/dashboard/submissions", icon: FileText },
  { name: "Schedule", href: "/organizer/dashboard/schedule", icon: Calendar },
  { name: "Settings", href: "/organizer/dashboard/settings", icon: Settings },
]

const adminLinks = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Approvals", href: "/admin/dashboard/approvals", icon: FileText },
  { name: "Users", href: "/admin/dashboard/users", icon: User },
  { name: "Hackathons", href: "/admin/dashboard/hackathons", icon: Trophy },
  { name: "Reports", href: "/admin/dashboard/reports", icon: Bell },
  { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
]

type DashboardType = "participant" | "organizer" | "admin"

export function DashboardSidebar({ type }: { type: DashboardType }) {
  const pathname = usePathname()
  
  const links = type === "participant" 
    ? participantLinks 
    : type === "organizer" 
    ? organizerLinks 
    : adminLinks

  const title = type === "participant" 
    ? "Dashboard" 
    : type === "organizer" 
    ? "Organizer" 
    : "Admin"

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-xl font-bold text-foreground">HackHub</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              JD
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="truncate text-xs text-muted-foreground">john@example.com</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
