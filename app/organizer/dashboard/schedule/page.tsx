"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar, Clock } from "lucide-react"

const scheduleEvents: Array<{
  id: string
  title: string
  time: string
  date: string
  status: string
  description: string
}> = []

export default function SchedulePage() {
  const completedEvents = scheduleEvents.filter((e) => e.status === "Completed").length
  const currentEvent = scheduleEvents.filter((e) => e.status === "Current").length
  const upcomingEvents = scheduleEvents.filter((e) => e.status === "Upcoming").length

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage hackathon timeline and events
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground mt-2">{completedEvents}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current</p>
                <p className="text-3xl font-bold text-primary mt-2">{currentEvent}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-3xl font-bold text-foreground mt-2">{upcomingEvents}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hackathon</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium text-foreground">
                      {event.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.time}
                    </TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.status === "Completed"
                            ? "secondary"
                            : event.status === "Current"
                            ? "default"
                            : "outline"
                        }
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
