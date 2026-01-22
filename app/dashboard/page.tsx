import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trophy, FileText, Award, Bell, Calendar, ArrowRight, ExternalLink } from "lucide-react"

const stats = [
  { title: "Registered Hackathons", value: "5", icon: Trophy, change: "+2 this month" },
  { title: "Submissions", value: "3", icon: FileText, change: "1 pending review" },
  { title: "Certificates", value: "2", icon: Award, change: "View all" },
  { title: "Notifications", value: "8", icon: Bell, change: "3 unread" },
]

const myHackathons = [
  {
    id: "1",
    name: "AI Innovation Challenge 2026",
    status: "In Progress",
    deadline: "Feb 22, 2026",
    submission: "Not submitted",
    role: "Participant",
  },
  {
    id: "2",
    name: "Web3 Builders Summit",
    status: "Registered",
    deadline: "Mar 12, 2026",
    submission: "-",
    role: "Team Lead",
  },
  {
    id: "3",
    name: "GreenTech Sustainability Hack",
    status: "Completed",
    deadline: "Mar 7, 2026",
    submission: "Submitted",
    role: "Participant",
  },
]

const notifications = [
  {
    id: "1",
    title: "Submission deadline approaching",
    message: "AI Innovation Challenge deadline is in 2 days",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    title: "New hackathon recommendation",
    message: "Check out HealthTech Revolution based on your interests",
    time: "5 hours ago",
    unread: true,
  },
  {
    id: "3",
    title: "Team invite received",
    message: "Sarah invited you to join Team Quantum",
    time: "1 day ago",
    unread: false,
  },
]

export default function ParticipantDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, John!</h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s an overview of your hackathon activity
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                </div>
                <h3 className="mt-4 text-sm font-medium text-foreground">{stat.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Hackathons</CardTitle>
                <Link href="/dashboard/hackathons">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hackathon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Submission</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myHackathons.map((hackathon) => (
                      <TableRow key={hackathon.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{hackathon.name}</p>
                            <p className="text-xs text-muted-foreground">{hackathon.role}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              hackathon.status === "In Progress"
                                ? "default"
                                : hackathon.status === "Completed"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {hackathon.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{hackathon.deadline}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              hackathon.submission === "Submitted"
                                ? "default"
                                : hackathon.submission === "Not submitted"
                                ? "destructive"
                                : "outline"
                            }
                            className={hackathon.submission === "Submitted" ? "bg-green-500/10 text-green-500" : ""}
                          >
                            {hackathon.submission}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/hackathons/${hackathon.id}`}>
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                <Link href="/dashboard/notifications">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`rounded-lg border border-border p-4 ${
                        notification.unread ? "bg-primary/5" : "bg-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-foreground">
                          {notification.title}
                        </h4>
                        {notification.unread && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 border-border bg-card">
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myHackathons
                    .filter((h) => h.status !== "Completed")
                    .map((hackathon) => (
                      <div key={hackathon.id} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{hackathon.name}</p>
                          <p className="text-xs text-muted-foreground">{hackathon.deadline}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
