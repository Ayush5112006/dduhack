"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar, Users, Trophy, CheckCircle, XCircle } from "lucide-react"
import { updateHackathonStatus } from "@/app/actions/admin-hackathon"
import { useToast } from "@/hooks/use-toast"

interface Hackathon {
    id: string
    title: string
    status: string
    startDate: Date
    endDate: Date
    participants: number
    owner: {
        name: string
        email: string
    }
    _count: {
        registrations: number
        submissions: number
    }
}

interface HackathonsTableProps {
    hackathons: Hackathon[]
    totalPages: number
    currentPage: number
    searchQuery: string
}

export function HackathonsTable({ hackathons, totalPages, currentPage, searchQuery }: HackathonsTableProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [query, setQuery] = useState(searchQuery)
    const [isPending, startTransition] = useTransition()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/admin/hackathons?q=${query}`)
    }

    const handleStatusUpdate = async (id: string, status: string) => {
        const result = await updateHackathonStatus(id, status)
        if (result.success) {
            addToast("success", "Hackathon status updated")
            router.refresh()
        } else {
            addToast("error", result.error || "Update failed")
        }
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Input
                        placeholder="Search hackathons..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={isPending}>Search</Button>
            </form>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Organizer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead>Dates</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hackathons.map((h) => (
                            <TableRow key={h.id}>
                                <TableCell className="font-medium">{h.title}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{h.owner.name}</span>
                                        <span className="text-xs text-muted-foreground">{h.owner.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={h.status === 'live' ? 'default' : h.status === 'upcoming' ? 'secondary' : 'outline'}>
                                        {h.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{h._count.registrations}</TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {new Date(h.startDate).toLocaleDateString('en-US')}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(h.id, "live")}>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Set Live
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(h.id, "upcoming")}>
                                                <Calendar className="mr-2 h-4 w-4" /> Set Upcoming
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusUpdate(h.id, "ended")}>
                                                <XCircle className="mr-2 h-4 w-4" /> End Event
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
