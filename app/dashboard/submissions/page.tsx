"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { UserSubmissionDashboard } from "@/components/submissions/user-submission-dashboard"

export default function SubmissionsPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <UserSubmissionDashboard />
        </div>
      </div>
    </div>
  )
}

