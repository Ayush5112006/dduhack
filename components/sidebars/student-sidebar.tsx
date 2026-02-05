"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/components/session-provider"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Trophy,
  Users,
  Award,
  User,
  LogOut,
  Home,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function StudentSidebar() {
  const { user, isLoading, sessionFetched } = useSession()
  const [isMounted, setIsMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // ✅ Mount guard - critical for preventing hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // ✅ Show skeleton while mounting or session loading
  if (!isMounted || !sessionFetched) {
    return <SidebarSkeleton />
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // ✅ Not logged in - show guest sidebar
  if (!user) {
    return (
      <>
        {/* Desktop Guest Sidebar */}
        <div className="hidden lg:flex fixed left-0 top-0 w-64 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-col z-40">
          <div className="p-4 border-b border-sidebar-border">
            <Link href="/" className="text-xl font-bold">
              HackHub
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <SidebarLink
              href="/"
              icon={Home}
              label="Home"
              active={pathname === "/"}
            />
            <SidebarLink
              href="/hackathons"
              icon={Trophy}
              label="Browse Hackathons"
              active={pathname === "/hackathons"}
            />
          </nav>

          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Link
              href="/auth/login"
              className="block w-full text-center p-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="block w-full text-center p-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Guest Sidebar */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link href="/" className="text-xl font-bold">
            HackHub
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
        {mobileOpen && (
          <div className="lg:hidden p-4 space-y-2 border-b border-sidebar-border">
            <Link href="/" className="block p-2 hover:bg-gray-100 rounded">
              Home
            </Link>
            <Link
              href="/hackathons"
              className="block p-2 hover:bg-gray-100 rounded"
            >
              Browse Hackathons
            </Link>
            <Link
              href="/auth/login"
              className="block w-full text-center p-2 bg-blue-600 text-white rounded text-sm"
            >
              Login
            </Link>
          </div>
        )}
      </>
    )
  }

  // ✅ User logged in but not participant - return null (let other sidebar handle)
  if (user.userRole !== "participant") {
    return null
  }

  // ✅ PARTICIPANT LOGGED IN - Show participant sidebar
  return (
    <>
      {/* Desktop Participant Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 w-64 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-col z-40 overflow-y-auto">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/" className="text-xl font-bold">
            HackHub
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <p className="font-medium text-sm">{user.userName}</p>
          <p className="text-xs text-sidebar-foreground/60">Participant</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarLink
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active={pathname === "/dashboard"}
          />
          <SidebarLink
            href="/dashboard/submissions"
            icon={FileText}
            label="My Submissions"
            active={pathname.startsWith("/dashboard/submissions")}
          />
          <SidebarLink
            href="/dashboard/hackathons"
            icon={Trophy}
            label="Enrolled Hacks"
            active={pathname.startsWith("/dashboard/hackathons")}
          />
          <SidebarLink
            href="/dashboard/team"
            icon={Users}
            label="My Team"
            active={pathname.startsWith("/dashboard/team")}
          />
          <SidebarLink
            href="/dashboard/certificates"
            icon={Award}
            label="Certificates"
            active={pathname.startsWith("/dashboard/certificates")}
          />
          <SidebarLink
            href="/dashboard/profile"
            icon={User}
            label="Profile"
            active={pathname === "/dashboard/profile"}
          />
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full text-red-600 hover:bg-red-50 rounded text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Participant Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-sidebar-border">
        <div>
          <p className="font-medium text-sm">{user.userName}</p>
          <p className="text-xs text-gray-600">Participant</p>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Participant Menu */}
      {mobileOpen && (
        <div className="lg:hidden p-4 space-y-1 border-b border-sidebar-border overflow-y-auto max-h-[calc(100vh-140px)]">
          <MobileSidebarLink
            href="/dashboard"
            label="Dashboard"
            active={pathname === "/dashboard"}
            onClick={() => setMobileOpen(false)}
          />
          <MobileSidebarLink
            href="/dashboard/submissions"
            label="My Submissions"
            active={pathname.startsWith("/dashboard/submissions")}
            onClick={() => setMobileOpen(false)}
          />
          <MobileSidebarLink
            href="/dashboard/hackathons"
            label="Enrolled Hacks"
            active={pathname.startsWith("/dashboard/hackathons")}
            onClick={() => setMobileOpen(false)}
          />
          <MobileSidebarLink
            href="/dashboard/team"
            label="My Team"
            active={pathname.startsWith("/dashboard/team")}
            onClick={() => setMobileOpen(false)}
          />
          <MobileSidebarLink
            href="/dashboard/certificates"
            label="Certificates"
            active={pathname.startsWith("/dashboard/certificates")}
            onClick={() => setMobileOpen(false)}
          />
          <MobileSidebarLink
            href="/dashboard/profile"
            label="Profile"
            active={pathname === "/dashboard/profile"}
            onClick={() => setMobileOpen(false)}
          />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-2 text-red-600 hover:bg-red-50 rounded text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </>
  )
}

// ✅ Desktop sidebar link component
function SidebarLink({ href, icon: Icon, label, active }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
        active
          ? "bg-blue-500/20 text-sidebar-foreground font-medium"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-border"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  )
}

// ✅ Mobile sidebar link component
function MobileSidebarLink({ href, label, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block px-3 py-2 rounded text-sm transition-colors",
        active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {label}
    </Link>
  )
}

// ✅ Skeleton loader for loading state
function SidebarSkeleton() {
  return (
    <>
      {/* Desktop skeleton */}
      <div className="hidden lg:flex fixed left-0 top-0 w-64 h-screen border-r border-sidebar-border bg-sidebar flex-col p-4 z-40">
        <div className="h-6 bg-sidebar-border rounded w-24 mb-4 animate-pulse" />
        <div className="h-4 bg-sidebar-border rounded w-32 mb-2 animate-pulse" />
        <div className="h-3 bg-sidebar-border rounded w-20 mb-4 animate-pulse" />
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-8 bg-sidebar-border rounded animate-pulse"
            />
          ))}
        </div>
        <div className="h-10 bg-sidebar-border rounded animate-pulse" />
      </div>

      {/* Mobile skeleton */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="space-y-1 flex-1">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </>
  )
}
