"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/toast-provider"
import { Search, Filter, Check, X, Eye, Mail, Users, User } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Participant {
  id: string
  name: string
  email: string
  type: "individual" | "team"
  teamName?: string
  teamMembers?: string[]
  skills?: string
  status: "pending" | "approved" | "rejected"
  hackathonTitle: string
  registeredAt: string
}

export default function ParticipantsPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchParticipants()
  }, [])

  useEffect(() => {
    filterParticipants()
  }, [searchQuery, typeFilter, statusFilter, participants])

  const fetchParticipants = async () => {
    try {
      const response = await fetch("/api/organizer/participants")
      if (!response.ok) throw new Error("Failed to fetch participants")

      const data = await response.json()
      setParticipants(data.participants || [])
    } catch (error) {
      console.error("Error fetching participants:", error)
      addToast("error", "Failed to load participants")
    } finally {
      setLoading(false)
    }
  }

  const filterParticipants = () => {
    let filtered = [...participants]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(p => p.type === typeFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    setFilteredParticipants(filtered)
  }

  const updateParticipantStatus = async (participantId: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/organizer/participants/${participantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      addToast("success", `Participant ${status}`)
      fetchParticipants()
    } catch (error) {
      console.error("Error updating participant status:", error)
      addToast("error", "Failed to update status")
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      approved: "bg-green-500/20 text-green-400 border-green-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  const getTypeBadge = (type: string) => {
    return type === "team"
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white/5 rounded-xl"></div>
        <div className="h-96 bg-white/5 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participants Management</h1>
          <p className="text-gray-400 mt-1">Review and manage participant registrations</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <Users className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium">{participants.length} Total</span>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Registered Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Team/Skills</TableHead>
                  <TableHead>Hackathon</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No participants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParticipants.map((participant) => (
                    <TableRow key={participant.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{participant.name}</div>
                          <div className="text-sm text-gray-400">{participant.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadge(participant.type)}>
                          {participant.type === "team" ? (
                            <Users className="w-3 h-3 mr-1" />
                          ) : (
                            <User className="w-3 h-3 mr-1" />
                          )}
                          {participant.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {participant.type === "team" ? (
                            <div>
                              <div className="font-medium text-white">{participant.teamName}</div>
                              <div className="text-gray-400">{participant.teamMembers?.length || 0} members</div>
                            </div>
                          ) : (
                            <div className="text-gray-400">{participant.skills || "No skills listed"}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-300">
                        {participant.hackathonTitle}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(participant.status)}>
                          {participant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedParticipant(participant)
                              setShowDetails(true)
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {participant.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateParticipantStatus(participant.id, "approved")}
                                className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateParticipantStatus(participant.id, "rejected")}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Participant Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle>Participant Details</DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-white font-medium">{selectedParticipant.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white font-medium">{selectedParticipant.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Type</label>
                  <Badge className={getTypeBadge(selectedParticipant.type)}>
                    {selectedParticipant.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <Badge className={getStatusBadge(selectedParticipant.status)}>
                    {selectedParticipant.status}
                  </Badge>
                </div>
                {selectedParticipant.type === "team" && (
                  <>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-400">Team Name</label>
                      <p className="text-white font-medium">{selectedParticipant.teamName}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-400">Team Members</label>
                      <div className="mt-2 space-y-1">
                        {selectedParticipant.teamMembers?.map((member, idx) => (
                          <p key={idx} className="text-white">• {member}</p>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {selectedParticipant.skills && (
                  <div className="col-span-2">
                    <label className="text-sm text-gray-400">Skills</label>
                    <p className="text-white">{selectedParticipant.skills}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm text-gray-400">Hackathon</label>
                  <p className="text-white font-medium">{selectedParticipant.hackathonTitle}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
