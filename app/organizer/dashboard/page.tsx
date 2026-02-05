"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Flag, UserCheck, TrendingUp, Calendar } from "lucide-react"
import { useToast } from "@/components/toast-provider"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"

interface DashboardStats {
  totalRegistrations: number
  teamsRegistered: number
  individualParticipants: number
  assignedMentors: number
  submissionsReceived: number
  activeHackathons: number
}

interface RegistrationTrend {
  date: string
  count: number
}

interface DomainDistribution {
  name: string
  value: number
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export default function OrganizerDashboardPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    teamsRegistered: 0,
    individualParticipants: 0,
    assignedMentors: 0,
    submissionsReceived: 0,
    activeHackathons: 0,
  })
  const [registrationTrend, setRegistrationTrend] = useState<RegistrationTrend[]>([])
  const [domainDistribution, setDomainDistribution] = useState<DomainDistribution[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/organizer/dashboard/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")

      const data = await response.json()
      setStats(data.stats)
      setRegistrationTrend(data.registrationTrend || [])
      setDomainDistribution(data.domainDistribution || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      addToast("error", "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Total Registrations",
      value: stats.totalRegistrations,
      icon: Users,
      change: "+12% from last month",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      label: "Teams Registered",
      value: stats.teamsRegistered,
      icon: Users,
      change: `${stats.individualParticipants} individual`,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      label: "Assigned Mentors",
      value: stats.assignedMentors,
      icon: UserCheck,
      change: "Active mentorship",
      gradient: "from-orange-500 to-red-500"
    },
    {
      label: "Submissions Received",
      value: stats.submissionsReceived,
      icon: Flag,
      change: "Pending review",
      gradient: "from-green-500 to-emerald-500"
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white/5 rounded-xl"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Organizer Dashboard</h1>
          <p className="text-blue-100 text-lg">Manage your hackathons and track performance</p>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Trophy className="w-64 h-64" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Registrations Over Time */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Registrations Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registrationTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No registration data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Domain Distribution */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              Domain Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {domainDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={domainDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {domainDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No domain data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/organizer/hackathons/create"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-500/50 transition-all group"
            >
              <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <Trophy className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Create Hackathon</h3>
                <p className="text-sm text-gray-400">Start a new event</p>
              </div>
            </a>

            <a
              href="/organizer/dashboard/participants"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all group"
            >
              <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Manage Participants</h3>
                <p className="text-sm text-gray-400">Review registrations</p>
              </div>
            </a>

            <a
              href="/organizer/dashboard/mentors"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 hover:border-orange-500/50 transition-all group"
            >
              <div className="p-3 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                <UserCheck className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Assign Mentors</h3>
                <p className="text-sm text-gray-400">Connect students with mentors</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
