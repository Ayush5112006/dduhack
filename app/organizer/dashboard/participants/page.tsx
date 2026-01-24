"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

const mockParticipants: Array<{
  id: string
  name: string
  email: string
  hackathon: string
  team: string
  joinDate: string
  status: string
}> = []

export default function ParticipantsPage() {
  const searchParams = useSearchParams()
  const hackathonFilter = searchParams.get("hackathon")
  const [searchQuery, setSearchQuery] = useState("")
  const [participants, setParticipants] = useState(mockParticipants)

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesHackathon = !hackathonFilter || p.hackathon.includes(hackathonFilter)
    return matchesSearch && matchesHackathon
  })

  const totalParticipants = participants.length
  const confirmedParticipants = participants.filter((p) => p.status === "Confirmed").length

  const handleExportParticipants = () => {
    const csv = [
      ["Name", "Email", "Hackathon", "Team", "Join Date", "Status"],
      ...filteredParticipants.map(p => [
        p.name, p.email, p.hackathon, p.team, p.joinDate, p.status
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "participants.csv"
    a.click()
    alert("Participants exported successfully!")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Participants</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and track all hackathon participants
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{totalParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{confirmedParticipants}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Participants</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportParticipants}
                disabled={filteredParticipants.length === 0}
              >
                Export CSV
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-secondary pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredParticipants.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No participants found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Hackathon</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium text-foreground">
                        {participant.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {participant.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {participant.hackathon}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{participant.team}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {participant.joinDate}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            participant.status === "Confirmed" ? "default" : "outline"
                          }
                        >
                          {participant.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
