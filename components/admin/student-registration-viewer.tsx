"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, Download, Search, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Registration {
  id: string
  userEmail: string
  fullName: string | null
  phone: string | null
  university: string | null
  enrollmentNumber: string | null
  branch: string | null
  year: string | null
  mode: string
  status: string
  skills: string | null
  experience: string | null
  githubProfile: string | null
  linkedinProfile: string | null
  portfolioUrl: string | null
  projectIdea: string | null
  motivation: string | null
  createdAt: Date
  team?: {
    name: string
  }
}

interface StudentRegistrationViewerProps {
  registrations: Registration[]
  hackathonTitle: string
}

export function StudentRegistrationViewer({
  registrations,
  hackathonTitle,
}: StudentRegistrationViewerProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [modeFilter, setModeFilter] = useState<string>("all")
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      reg.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      reg.enrollmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
      reg.university?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter
    const matchesMode = modeFilter === "all" || reg.mode === modeFilter

    return matchesSearch && matchesStatus && matchesMode
  })

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "University",
      "Enrollment Number",
      "Branch",
      "Year",
      "Mode",
      "Team Name",
      "Status",
      "Skills",
      "Registration Date",
    ]

    const rows = filteredRegistrations.map((reg) => [
      reg.fullName || "",
      reg.userEmail,
      reg.phone || "",
      reg.university || "",
      reg.enrollmentNumber || "",
      reg.branch || "",
      reg.year || "",
      reg.mode,
      reg.team?.name || "-",
      reg.status,
      reg.skills || "",
      new Date(reg.createdAt).toISOString().split('T')[0],
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${hackathonTitle}-registrations-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, enrollment number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Registrations</p>
          <p className="text-2xl font-bold">{registrations.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Individual</p>
          <p className="text-2xl font-bold">
            {registrations.filter((r) => r.mode === "individual").length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Team</p>
          <p className="text-2xl font-bold">
            {registrations.filter((r) => r.mode === "team").length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold">
            {registrations.filter((r) => r.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Enrollment No.</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              filteredRegistrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">
                    {registration.fullName || "N/A"}
                  </TableCell>
                  <TableCell>{registration.userEmail}</TableCell>
                  <TableCell>{registration.university || "N/A"}</TableCell>
                  <TableCell>{registration.enrollmentNumber || "N/A"}</TableCell>
                  <TableCell>{registration.branch || "N/A"}</TableCell>
                  <TableCell>{registration.year || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant={registration.mode === "team" ? "default" : "secondary"}>
                      {registration.mode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        registration.status === "approved"
                          ? "default"
                          : registration.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {registration.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRegistration(registration)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Registration Details</DialogTitle>
                          <DialogDescription>
                            Complete information for this registration
                          </DialogDescription>
                        </DialogHeader>
                        {selectedRegistration && (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="text-muted-foreground">Full Name</Label>
                                <p className="font-medium">{selectedRegistration.fullName || "N/A"}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <p className="font-medium">{selectedRegistration.userEmail}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="font-medium">{selectedRegistration.phone || "N/A"}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">University</Label>
                                <p className="font-medium">{selectedRegistration.university || "N/A"}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Enrollment Number</Label>
                                <p className="font-medium">
                                  {selectedRegistration.enrollmentNumber || "N/A"}
                                </p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Branch</Label>
                                <p className="font-medium">{selectedRegistration.branch || "N/A"}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Year</Label>
                                <p className="font-medium">{selectedRegistration.year || "N/A"}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Registration Mode</Label>
                                <p className="font-medium capitalize">{selectedRegistration.mode}</p>
                              </div>
                            </div>

                            {selectedRegistration.mode === "team" && selectedRegistration.team && (
                              <div>
                                <Label className="text-muted-foreground">Team Name</Label>
                                <p className="font-medium">{selectedRegistration.team.name}</p>
                              </div>
                            )}

                            <div>
                              <Label className="text-muted-foreground">Skills</Label>
                              <p className="font-medium">{selectedRegistration.skills || "Not specified"}</p>
                            </div>

                            {selectedRegistration.experience && (
                              <div>
                                <Label className="text-muted-foreground">Experience</Label>
                                <p className="font-medium whitespace-pre-wrap">
                                  {selectedRegistration.experience}
                                </p>
                              </div>
                            )}

                            {selectedRegistration.projectIdea && (
                              <div>
                                <Label className="text-muted-foreground">Project Idea</Label>
                                <p className="font-medium whitespace-pre-wrap">
                                  {selectedRegistration.projectIdea}
                                </p>
                              </div>
                            )}

                            {selectedRegistration.motivation && (
                              <div>
                                <Label className="text-muted-foreground">Motivation</Label>
                                <p className="font-medium whitespace-pre-wrap">
                                  {selectedRegistration.motivation}
                                </p>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label className="text-muted-foreground">Social Profiles</Label>
                              <div className="space-y-1">
                                {selectedRegistration.githubProfile && (
                                  <p className="text-sm">
                                    <span className="font-medium">GitHub:</span>{" "}
                                    <a
                                      href={selectedRegistration.githubProfile}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {selectedRegistration.githubProfile}
                                    </a>
                                  </p>
                                )}
                                {selectedRegistration.linkedinProfile && (
                                  <p className="text-sm">
                                    <span className="font-medium">LinkedIn:</span>{" "}
                                    <a
                                      href={selectedRegistration.linkedinProfile}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {selectedRegistration.linkedinProfile}
                                    </a>
                                  </p>
                                )}
                                {selectedRegistration.portfolioUrl && (
                                  <p className="text-sm">
                                    <span className="font-medium">Portfolio:</span>{" "}
                                    <a
                                      href={selectedRegistration.portfolioUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {selectedRegistration.portfolioUrl}
                                    </a>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label className="text-muted-foreground">Registration Date</Label>
                              <p className="font-medium">
                                {new Date(selectedRegistration.createdAt).toISOString().replace('T', ' ').split('.')[0]}
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
