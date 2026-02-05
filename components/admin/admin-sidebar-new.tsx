"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Trophy,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Activity,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const mainNavItems: NavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "All Hackathons", href: "/admin/dashboard/all-hackathons", icon: Trophy },
  { label: "Activities", href: "/admin/dashboard/activities", icon: Activity },
  { label: "Approvals", href: "/admin/dashboard/approvals", icon: CheckCircle2 },
  { label: "Users", href: "/admin/dashboard/users", icon: Users },
]

const secondaryNavItems: NavItem[] = [
  { label: "Add Member", href: "/admin/dashboard/add-member", icon: Plus },
  { label: "Hackathons", href: "/admin/dashboard/hackathons", icon: Trophy },
  { label: "Reports", href: "/admin/dashboard/reports", icon: FileText },
  { label: "Profile", href: "/admin/dashboard/profile", icon: Users },
  { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900/80 backdrop-blur-xl hover:bg-slate-800/80 text-cyan-400 border border-cyan-500/20"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-950/95 backdrop-blur-xl border-r border-cyan-500/10 transform transition-transform duration-300 lg:translate-x-0 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="px-6 py-8 border-b border-cyan-500/10">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                HackHub
              </h1>
            </div>
            <p className="text-xs text-slate-400">Admin Panel v1.0</p>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-4 mb-4">
              Navigation
            </p>
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                      : "text-slate-400 hover:bg-slate-900/50 hover:text-cyan-400 border border-transparent hover:border-cyan-500/20"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Secondary Navigation */}
          <nav className="px-4 py-4 space-y-1 border-t border-cyan-500/10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-4 mb-4">
              Management
            </p>
            {secondaryNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:text-cyan-400 hover:bg-slate-900/50"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Profile Section */}
          <div className="border-t border-cyan-500/10 px-4 py-4 space-y-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900/50 border border-cyan-500/10">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Admin</p>
                <p className="text-xs text-slate-400 truncate">admin@hackhub.com</p>
              </div>
            </div>
            <Link href="/" className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center gap-2 bg-slate-900/50 border-cyan-500/20 text-cyan-400 hover:bg-slate-800/50 hover:border-cyan-500/40 hover:text-cyan-300 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
