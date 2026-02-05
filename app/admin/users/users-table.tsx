"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Shield, User, Search } from "lucide-react"
import { updateUserRole } from "@/app/actions/admin-user"
import { useToast } from "@/hooks/use-toast"

interface User {
    id: string
    name: string
    email: string
    role: string
    avatar: string | null
    createdAt: Date
    _count: {
        registrations: number
        submissions: number
    }
}

interface UsersTableProps {
    users: User[]
    totalPages: number
    currentPage: number
    searchQuery: string
}

export function UsersTable({ users, totalPages, currentPage, searchQuery }: UsersTableProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [query, setQuery] = useState(searchQuery)
    const [isPending, startTransition] = useTransition()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/admin/users?q=${query}`)
    }

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        const result = await updateUserRole(userId, newRole)
        if (result.success) {
            addToast("success", "User role updated successfully")
        } else {
            addToast("error", result.error || "Failed to update role")
        }
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Searching..." : "Search"}
                </Button>
            </form>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Stats</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar || undefined} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === "admin" ? "default" : user.role === "organizer" ? "secondary" : "outline"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-muted-foreground">
                                        {user._count.registrations} hackathons
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString('en-US')}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, "admin")}>
                                                <Shield className="mr-2 h-4 w-4" /> Make Admin
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, "organizer")}>
                                                <Shield className="mr-2 h-4 w-4" /> Make Organizer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRoleUpdate(user.id, "participant")}>
                                                <User className="mr-2 h-4 w-4" /> Make Participant
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination controls could be added here */}
        </div>
    )
}
