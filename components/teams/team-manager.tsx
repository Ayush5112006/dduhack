"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, LogIn, Hash, Copy, CheckCircle, AlertCircle, MoreVertical, UserMinus, Shield, Mail } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { createTeam, joinTeam } from "@/app/actions/team"

interface TeamManagerProps {
    initialTeam: any // Type this properly if possible, but any is fine for quick iter
    activeHackathons: Array<{ id: string; title: string }>
}

export function TeamManager({ initialTeam, activeHackathons }: TeamManagerProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [team, setTeam] = useState(initialTeam)
    const [joinCode, setJoinCode] = useState("")
    const [createName, setCreateName] = useState("")
    const [selectedHackathon, setSelectedHackathon] = useState<string>("")
    const [loading, setLoading] = useState(false)

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedHackathon) {
            addToast("error", "Please select a hackathon for your team")
            return
        }
        setLoading(true)

        const result = await createTeam(createName, selectedHackathon)

        if (result.error) {
            addToast("error", result.error)
        } else {
            addToast("success", "Team created successfully!")
            setTeam(result.team)
            router.refresh()
        }
        setLoading(false)
    }

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await joinTeam(joinCode)

        if (result.error) {
            addToast("error", result.error)
        } else {
            addToast("success", "Joined team successfully!")
            setTeam(result.team) // Note: result.team might not have full nested structure if not fetched, but usually we refresh
            router.refresh()
        }
        setLoading(false)
    }

    const copyCode = () => {
        if (team?.code) {
            navigator.clipboard.writeText(team.code)
            addToast("success", "Team code copied to clipboard")
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                    My Team
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage your team, invite members, or join an existing squad.
                </p>
            </div>

            {!team ? (
                <div className="grid gap-6 md:grid-cols-2 lg:max-w-4xl mx-auto mt-12">
                    {/* Create Team Card */}
                    <Card className="border-primary/20 bg-primary/5 hover:border-primary/40 transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Create a New Team</CardTitle>
                            <CardDescription>
                                Start a new team and invite your friends to hack with you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Enter Team Name"
                                        value={createName}
                                        onChange={(e) => setCreateName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Hackathon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activeHackathons.length > 0 ? (
                                                activeHackathons.map(h => (
                                                    <SelectItem key={h.id} value={h.id}>{h.title}</SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-muted-foreground">No live hackathons</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full gap-2" size="lg" disabled={loading}>
                                    {loading ? "Creating..." : (
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            Create Team
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Join Team Card */}
                    <Card className="border-muted hover:border-primary/20 transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                                <LogIn className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <CardTitle>Join Existing Team</CardTitle>
                            <CardDescription>
                                Have a team code? Enter it here to join your teammates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleJoinTeam} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Enter 6-digit Team Code"
                                            className="pl-9"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button variant="secondary" className="w-full gap-2" size="lg" disabled={loading}>
                                    {loading ? "Joining..." : "Join Team"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Team Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{team.name}</span>
                                        {team.hackathon && (
                                            <Badge variant="secondary" className="text-xs">
                                                {team.hackathon.title}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 rounded bg-background border border-border font-mono text-sm flex items-center gap-2">
                                            {team.code}
                                            <Button variant="ghost" size="icon" className="h-4 w-4 ml-2" onClick={copyCode}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    Created on {new Date(team.createdAt).toLocaleDateString('en-US')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Team Members
                                </h3>
                                <div className="space-y-3">
                                    {team.members?.map((member: any) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {member.user?.name?.[0] || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{member.user?.name || member.email}</p>
                                                    <p className="text-xs text-muted-foreground">{member.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={member.status === 'accepted' ? 'default' : 'outline'}>
                                                    {member.status || 'Active'}
                                                </Badge>

                                                {/* Member Actions Dropdown */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />

                                                        {member.status !== 'accepted' && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    addToast("info", "Resending invite...")
                                                                    // Add resend invite logic here
                                                                }}
                                                            >
                                                                <Mail className="mr-2 h-4 w-4" />
                                                                Resend Invite
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                addToast("info", "Change role feature coming soon")
                                                                // Add change role logic here
                                                            }}
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            Change Role
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={async () => {
                                                                if (confirm(`Remove ${member.user?.name || member.email} from the team?`)) {
                                                                    try {
                                                                        const response = await fetch(`/api/teams/${team.id}/members/${member.id}`, {
                                                                            method: 'DELETE',
                                                                        })

                                                                        if (response.ok) {
                                                                            addToast("success", "Member removed successfully")
                                                                            router.refresh()
                                                                        } else {
                                                                            const data = await response.json()
                                                                            addToast("error", data.error || "Failed to remove member")
                                                                        }
                                                                    } catch (error) {
                                                                        addToast("error", "Failed to remove member")
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <UserMinus className="mr-2 h-4 w-4" />
                                                            Remove Member
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Stats */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Team Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Members</span>
                                    <span className="font-bold">{team.members?.length || 0}/4</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${((team.members?.length || 0) / 4) * 100}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
