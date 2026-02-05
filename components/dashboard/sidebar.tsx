"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
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
  Menu,
  UserPlus,
  UserCircle,
  TrendingUp,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

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
  { name: "Profile", href: "/organizer/dashboard/profile", icon: User },
  { name: "Settings", href: "/organizer/dashboard/settings", icon: Settings },
]

const adminLinks = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "All Hackathons", href: "/admin/dashboard/all-hackathons", icon: Trophy },
  { name: "Activities", href: "/admin/dashboard/activities", icon: TrendingUp },
  { name: "Approvals", href: "/admin/dashboard/approvals", icon: FileText },
  { name: "Users", href: "/admin/dashboard/users", icon: User },
  { name: "Add Member", href: "/admin/dashboard/add-member", icon: UserPlus },
  { name: "Hackathons", href: "/admin/dashboard/hackathons", icon: Calendar },
  { name: "Reports", href: "/admin/dashboard/reports", icon: Bell },
  { name: "Profile", href: "/admin/dashboard/profile", icon: UserCircle },
  { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
]

const judgeLinks = [
  { name: "Overview", href: "/judge/dashboard", icon: LayoutDashboard },
  { name: "Assigned Hackathons", href: "/judge/hackathons", icon: Trophy },
  { name: "Submissions", href: "/judge/submissions", icon: FileText },
  { name: "My Evaluations", href: "/judge/evaluations", icon: Award },
  { name: "Notifications", href: "/judge/notifications", icon: Bell },
  { name: "Profile", href: "/judge/profile", icon: User },
]

type DashboardType = "participant" | "organizer" | "admin"

export function DashboardSidebar({ type }: { type: DashboardType }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useSession()

  // Fetch user data only once on mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }
    fetchUserData()
  }, [])
  
  const handleLogout = async () => {
    await logout()
    router.push("/auth/login")
  }
  
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

  // Get user initials safely
  const getUserInitials = () => {
    const name = userData?.user?.name
    const email = userData?.user?.email
    if (name) {
      return name.charAt(0).toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const NavLinks = () => (
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
            onClick={() => setMobileOpen(false)}
          >
            <link.icon className="h-4 w-4" />
            {link.name}
          </Link>
        )
      })}
    </nav>
  )

  const UserBlock = () => (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2" suppressHydrationWarning>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary overflow-hidden">
        {userData?.profile?.avatar ? (
          <Image
            src={userData.profile.avatar}
            alt={userData?.user?.name || "avatar"}
            fill
            sizes="36px"
            className="object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          getUserInitials()
        )}
      </div>
      <div className="flex-1 truncate">
        <p className="text-sm font-medium text-foreground">{userData?.user?.name || 'User'}</p>
        <p className="truncate text-xs text-muted-foreground">{userData?.user?.email || ''}</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header with menu toggle */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-sm px-3 sm:px-4 py-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Logo />
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu" className="border-0 bg-secondary/50 hover:bg-secondary">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-r border-border/50">
            <div className="border-b border-border/50 px-6 py-4 bg-secondary/30">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Logo showText={false} size={28} />
                  <span>{title}</span>
                </SheetTitle>
              </SheetHeader>
            </div>
            <div className="h-full overflow-y-auto px-4 py-5 space-y-6">
              <div>
                <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</p>
                <NavLinks />
              </div>
              <div className="border-t border-border/50 pt-4 space-y-2">
                <UserBlock />
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border/50 bg-card/95 backdrop-blur-sm lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-border/50 px-6">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <NavLinks />
          </div>

          <div className="border-t border-border/50 p-4 space-y-2">
            <UserBlock />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
