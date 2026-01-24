"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { HackathonsList } from "@/components/organizer/hackathons-list"

export default function HackathonsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Hackathons</h1>
          <p className="mt-2 text-muted-foreground">
            Create, edit, and manage all your hosted hackathons
          </p>
        </div>
        <HackathonsList />
      </main>
    </div>
  )
}
