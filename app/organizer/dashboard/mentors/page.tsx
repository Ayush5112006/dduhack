"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/toast-provider"
import { Search, UserCheck, Users, Award } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Student {
    id: string
    name: string
    email: string
    teamName?: string
    skills: string
    domain: string
    assignedMentor?: {
        id: string
        name: string
        email: string
    }
    hackathonId: string
    hackathonTitle: string
}

interface Mentor {
    id: string
    name: string
    email: string
    expertise: string
    assignedCount: number
}

export default function MentorAssignmentsPage() {
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [students, setStudents] = useState<Student[]>([])
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [domainFilter, setDomainFilter] = useState<string>("all")
    const [hackathonFilter, setHackathonFilter] = useState<string>("all")
    const [hackathons, setHackathons] = useState<Array<{ id: string; title: string }>>([])

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        filterStudents()
    }, [searchQuery, domainFilter, hackathonFilter, students])

    const fetchData = async () => {
        try {
            // Fetch students
            const studentsRes = await fetch("/api/organizer/mentors/students")
            if (!studentsRes.ok) throw new Error("Failed to fetch students")
            const studentsData = await studentsRes.json()
            setStudents(studentsData.students || [])

            // Fetch mentors
            const mentorsRes = await fetch("/api/organizer/mentors/available")
            if (!mentorsRes.ok) throw new Error("Failed to fetch mentors")
            const mentorsData = await mentorsRes.json()
            setMentors(mentorsData.mentors || [])

            // Fetch hackathons
            const hackathonsRes = await fetch("/api/organizer/hackathons")
            if (!hackathonsRes.ok) throw new Error("Failed to fetch hackathons")
            const hackathonsData = await hackathonsRes.json()
            setHackathons(hackathonsData.hackathons || [])
        } catch (error) {
            console.error("Error fetching data:", error)
            addToast("error", "Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const filterStudents = () => {
        let filtered = [...students]

        if (searchQuery) {
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (domainFilter !== "all") {
            filtered = filtered.filter(s => s.domain === domainFilter)
        }

        if (hackathonFilter !== "all") {
            filtered = filtered.filter(s => s.hackathonId === hackathonFilter)
        }

        setFilteredStudents(filtered)
    }

    const assignMentor = async (studentId: string, mentorId: string, hackathonId: string) => {
        try {
            const response = await fetch("/api/organizer/mentors/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, mentorId, hackathonId }),
            })

            if (!response.ok) throw new Error("Failed to assign mentor")

            addToast("success", "Mentor assigned successfully")
            fetchData()
        } catch (error) {
            console.error("Error assigning mentor:", error)
            addToast("error", "Failed to assign mentor")
        }
    }

    const unassignMentor = async (studentId: string, hackathonId: string) => {
        try {
            const response = await fetch("/api/organizer/mentors/unassign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, hackathonId }),
            })

            if (!response.ok) throw new Error("Failed to unassign mentor")

            addToast("success", "Mentor unassigned successfully")
            fetchData()
        } catch (error) {
            console.error("Error unassigning mentor:", error)
            addToast("error", "Failed to unassign mentor")
        }
    }

    const domains = Array.from(new Set(students.map(s => s.domain).filter(Boolean)))

    const stats = {
        totalStudents: students.length,
        assignedStudents: students.filter(s => s.assignedMentor).length,
        availableMentors: mentors.length,
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mentor Assignments</h1>
                <p className="text-gray-400 mt-1">Assign mentors to registered students</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
                        <p className="text-xs text-gray-400 mt-1">Registered participants</p>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Assigned Mentors</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.assignedStudents}</div>
                        <p className="text-xs text-gray-400 mt-1">
                            {stats.totalStudents - stats.assignedStudents} pending
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Available Mentors</CardTitle>
                        <Award className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{stats.availableMentors}</div>
                        <p className="text-xs text-gray-400 mt-1">Ready to guide</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10"
                            />
                        </div>

                        <Select value={hackathonFilter} onValueChange={setHackathonFilter}>
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Filter by hackathon" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Hackathons</SelectItem>
                                {hackathons.map(h => (
                                    <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={domainFilter} onValueChange={setDomainFilter}>
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Filter by domain" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Domains</SelectItem>
                                {domains.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Students Table */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Student Mentor Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Team Name</TableHead>
                                    <TableHead>Skills</TableHead>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Assigned Mentor</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                            No students found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <TableRow key={student.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-white">{student.name}</div>
                                                    <div className="text-sm text-gray-400">{student.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-300">
                                                {student.teamName || "Individual"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {student.skills.split(",").slice(0, 2).map((skill, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                                                            {skill.trim()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                    {student.domain}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {student.assignedMentor ? (
                                                    <div>
                                                        <div className="font-medium text-white flex items-center gap-2">
                                                            <UserCheck className="w-4 h-4 text-green-400" />
                                                            {student.assignedMentor.name}
                                                        </div>
                                                        <div className="text-sm text-gray-400">{student.assignedMentor.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">Not assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {student.assignedMentor ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => unassignMentor(student.id, student.hackathonId)}
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    >
                                                        Unassign
                                                    </Button>
                                                ) : (
                                                    <Select
                                                        onValueChange={(mentorId) => assignMentor(student.id, mentorId, student.hackathonId)}
                                                    >
                                                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                                                            <SelectValue placeholder="Select mentor" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {mentors.map(mentor => (
                                                                <SelectItem key={mentor.id} value={mentor.id}>
                                                                    <div className="flex flex-col">
                                                                        <span>{mentor.name}</span>
                                                                        <span className="text-xs text-gray-400">{mentor.expertise}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
