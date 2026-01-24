"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Trophy,
  FileText,
  AlertTriangle,
  MoreHorizontal,
  Search,
  Loader2,
  Trash2,
  Eye,
} from "lucide-react"
import { useToast } from "@/components/toast-provider"
import Link from "next/link"

type AdminUser = {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  registrations: number
  submissions: number
}

type AdminHackathon = {
  id: string
  title: string
  organizer: string
  status: string
  category: string
  startDate: string
  endDate: string
  prizeAmount: number
  registrations: number
  submissions: number
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [hackathons, setHackathons] = useState<AdminHackathon[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingHackathons, setLoadingHackathons] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { addToast } = useToast()

  useEffect(() => {
    fetchUsers()
    fetchHackathons()
  }, [])

  async function fetchUsers() {
    setLoadingUsers(true)
    try {
      const res = await fetch("/api/admin/users/all")
      const data = await res.json()

      if (!res.ok) {
        addToast("error", data.error || "Failed to load users")
        return
      }

      setUsers(data.users || [])
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to load users")
    } finally {
      setLoadingUsers(false)
    }
  }

  async function fetchHackathons() {
    setLoadingHackathons(true)
    try {
      const res = await fetch("/api/admin/hackathons/all")
      const data = await res.json()

      if (!res.ok) {
        addToast("error", data.error || "Failed to load hackathons")
        return
      }

      setHackathons(data.hackathons || [])
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to load hackathons")
    } finally {
      setLoadingHackathons(false)
    }
  }

  async function deleteHackathon(id: string) {
    if (!confirm("Delete this hackathon? This action cannot be undone.")) return

    try {
      const res = await fetch(`/api/admin/hackathons/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        addToast("error", data.error || "Failed to delete")
        return
      }

      setHackathons(hackathons.filter((h) => h.id !== id))
      addToast("success", "Hackathon deleted")
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to delete hackathon")
    }
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredHackathons = hackathons.filter((h) =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { title: "Total Users", value: users.length, icon: Users },
    { title: "Active Hackathons", value: hackathons.filter((h) => h.status === "live").length, icon: Trophy },
    { title: "Total Hackathons", value: hackathons.length, icon: FileText },
    { title: "Participants", value: users.filter((u) => u.role === "participant").length, icon: Users },
  ]

  const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="admin" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage users, hackathons, and platform settings</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border bg-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-border bg-card">
          <CardHeader>
            <CardTitle>Platform Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="w-full">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="users" className="mt-6">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Activity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={user.status === "active" ? "default" : "secondary"}
                                className={user.status === "active" ? "bg-emerald-500/10 text-emerald-600" : ""}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {user.registrations} regs • {user.submissions} subs
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hackathons" className="mt-6">
                {loadingHackathons ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Loading hackathons...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Organizer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Prize</TableHead>
                          <TableHead>Participants</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHackathons.map((hackathon) => (
                          <TableRow key={hackathon.id}>
                            <TableCell className="font-medium text-foreground">{hackathon.title}</TableCell>
                            <TableCell className="text-muted-foreground">{hackathon.organizer}</TableCell>
                            <TableCell>
                              <Badge
                                variant={hackathon.status === "live" ? "default" : "secondary"}
                                className={hackathon.status === "live" ? "bg-emerald-500/10 text-emerald-600" : ""}
                              >
                                {hackathon.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{hackathon.category}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">${hackathon.prizeAmount.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {hackathon.registrations} regs • {hackathon.submissions} subs
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild className="gap-2">
                                    <Link href={`/hackathons/${hackathon.id}`}>
                                      <Eye className="h-4 w-4" />
                                      View
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteHackathon(hackathon.id)}
                                    className="gap-2 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
