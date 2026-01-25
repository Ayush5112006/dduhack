import "@/app/globals.css"
import type { ReactNode } from "react"

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-screen bg-[#050505] text-slate-50">
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0c0f1a] to-[#050505] text-slate-50">
        {children}
      </div>
    </div>
  )
}
