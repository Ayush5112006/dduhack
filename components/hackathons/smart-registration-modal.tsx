"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Zap,
    Users,
    User,
    Mail,
    Github,
    Linkedin,
    Lightbulb,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    X,
    UserPlus,
    Code,
    Target,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface SmartRegistrationModalProps {
    open: boolean
    onClose: () => void
    hackathon: {
        id: string
        title: string
        maxTeamSize?: number
    }
    currentUser: {
        id: string
        name: string
        email: string
        skills?: string[]
        github?: string
        linkedin?: string
    }
}

type RegistrationType = "individual" | "team" | null
type TeamSetupType = "join" | "create" | null

interface TeamMember {
    email: string
    status: "invited" | "joined" | "pending"
    name?: string
}

const DOMAINS = [
    "Artificial Intelligence",
    "Web Development",
    "Cloud Computing",
    "Cybersecurity",
    "Mobile Development",
    "Blockchain",
    "IoT",
    "Data Science",
    "DevOps",
    "Game Development",
]

const TECH_STACK = [
    "React",
    "Node.js",
    "Python",
    "Java",
    "TypeScript",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "TensorFlow",
    "PyTorch",
    "Flutter",
    "React Native",
]

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"]

const PROGRAMMING_LANGUAGES = [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "TypeScript",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Dart",
    "R",
    "MATLAB",
    "Scala",
    "Perl",
    "Shell/Bash",
]


export function SmartRegistrationModal({
    open,
    onClose,
    hackathon,
    currentUser,
}: SmartRegistrationModalProps) {
    const { addToast } = useToast()
    const router = useRouter()

    // State Management
    const [step, setStep] = useState(1)
    const [registrationType, setRegistrationType] = useState<RegistrationType>(null)
    const [teamSetupType, setTeamSetupType] = useState<TeamSetupType>(null)
    const [loading, setLoading] = useState(false)

    // Individual Registration State
    const [profile, setProfile] = useState({
        name: currentUser.name,
        email: currentUser.email,
        skills: currentUser.skills || [],
        experienceLevel: "Intermediate",
        github: currentUser.github || "",
        linkedin: currentUser.linkedin || "",
    })
    const [motivation, setMotivation] = useState("")
    const [preferredDomain, setPreferredDomain] = useState("")
    const [selectedTools, setSelectedTools] = useState<string[]>([])

    // Project & Links State (New Step)
    const [githubRepo, setGithubRepo] = useState("")
    const [programmingLanguages, setProgrammingLanguages] = useState<string[]>([])

    // Team Registration State
    const [teamCode, setTeamCode] = useState("")
    const [teamName, setTeamName] = useState("")
    const [teamData, setTeamData] = useState<any>(null)
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { email: currentUser.email, status: "joined", name: currentUser.name },
    ])
    const [newMemberEmail, setNewMemberEmail] = useState("")
    const [teamDomain, setTeamDomain] = useState("")
    const [teamTechStack, setTeamTechStack] = useState<string[]>([])
    const [projectIdea, setProjectIdea] = useState("")

    // Agreement
    const [agreedToRules, setAgreedToRules] = useState(false)

    // Calculate Progress
    const getProgress = () => {
        // Step 1 is always the selection step
        if (step === 1) {
            // If a type is selected, show partial progress
            if (registrationType === "individual") {
                return 20 // 1/5 steps = 20%
            } else if (registrationType === "team") {
                return 16.67 // 1/6 steps
            }
            return 0 // No selection yet
        }

        // For subsequent steps
        if (registrationType === "individual") {
            const totalSteps = 5 // Added project links step
            return (step / totalSteps) * 100
        } else if (registrationType === "team") {
            const totalSteps = 6 // Added project links step
            return (step / totalSteps) * 100
        }

        // Fallback (shouldn't reach here)
        return (step / 6) * 100
    }

    // Smart Tips based on current step
    const getSmartTips = () => {
        if (step === 1) {
            return [
                { icon: Users, text: "Team registrations have 20% higher acceptance rates" },
                { icon: Zap, text: "Individual registrations are processed faster" },
            ]
        }

        if (registrationType === "individual") {
            if (step === 2) {
                return [
                    { icon: Github, text: "Connect GitHub/LinkedIn to boost your profile" },
                    { icon: Target, text: "Complete all fields for faster approval" },
                ]
            }
            if (step === 3) {
                return [
                    { icon: Lightbulb, text: "Be specific about your motivation" },
                    { icon: Code, text: "Highlight relevant skills for this domain" },
                ]
            }
        }

        if (registrationType === "team") {
            if (step === 2) {
                return [
                    { icon: Users, text: "Teams with 3-4 members perform better" },
                    { icon: Sparkles, text: "Create a unique team name to stand out" },
                ]
            }
            if (step === 3) {
                return [
                    { icon: UserPlus, text: "Add team members to strengthen composition" },
                    { icon: Shield, text: "Balanced teams with diverse skills have better chances" },
                ]
            }
            if (step === 4) {
                return [
                    { icon: Target, text: "Choose a domain that matches team expertise" },
                    { icon: Code, text: "Select tech stack your team is comfortable with" },
                ]
            }
        }

        return [{ icon: Sparkles, text: "Review all details before submitting" }]
    }

    // Handle Team Code Check
    const handleCheckTeamCode = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/teams/check?code=${teamCode}`)
            const data = await response.json()

            if (response.ok) {
                if (data.team.members.length >= (hackathon.maxTeamSize || 4)) {
                    addToast("error", "This team is already full")
                } else {
                    setTeamData(data.team)
                    addToast("success", "Team found!")
                }
            } else {
                addToast("error", data.error || "Team not found")
            }
        } catch (error) {
            addToast("error", "Failed to check team code")
        } finally {
            setLoading(false)
        }
    }

    // Handle Create Team
    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            addToast("error", "Please enter a team name")
            return
        }

        setLoading(true)
        try {
            const response = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: teamName,
                    hackathonId: hackathon.id,
                    leaderId: currentUser.id,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setTeamData(data.team)
                addToast("success", "Team created successfully!")
                setStep(3)
            } else {
                addToast("error", data.error || "Failed to create team")
            }
        } catch (error) {
            addToast("error", "Failed to create team")
        } finally {
            setLoading(false)
        }
    }

    // Handle Join Team
    const handleJoinTeam = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/teams/${teamData.id}/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser.id }),
            })

            if (response.ok) {
                addToast("success", "Joined team successfully!")
                setStep(3)
            } else {
                const data = await response.json()
                addToast("error", data.error || "Failed to join team")
            }
        } catch (error) {
            addToast("error", "Failed to join team")
        } finally {
            setLoading(false)
        }
    }

    // Handle Invite Team Member
    const handleInviteMember = async () => {
        const trimmedEmail = newMemberEmail.trim().toLowerCase()

        // Validate email is not empty
        if (!trimmedEmail) {
            addToast("error", "Please enter an email address")
            return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedEmail)) {
            addToast("error", "Please enter a valid email address")
            return
        }

        // Check if team is full
        if (teamMembers.length >= (hackathon.maxTeamSize || 4)) {
            addToast("error", "Team is full")
            return
        }

        // Check if trying to invite yourself
        if (trimmedEmail === currentUser.email.toLowerCase()) {
            addToast("error", "You are already in the team as the leader")
            return
        }

        // Check if member already exists (case-insensitive)
        if (teamMembers.some((m) => m.email.toLowerCase() === trimmedEmail)) {
            addToast("error", "This member has already been invited")
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/teams/${teamData.id}/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmedEmail }),
            })

            if (response.ok) {
                setTeamMembers([...teamMembers, { email: trimmedEmail, status: "invited" }])
                setNewMemberEmail("")
                addToast("success", "Invitation sent!")
            } else {
                const data = await response.json()
                addToast("error", data.error || "Failed to send invitation")
            }
        } catch (error) {
            addToast("error", "Failed to send invitation")
        } finally {
            setLoading(false)
        }
    }

    // Handle Remove Team Member
    const handleRemoveMember = (email: string) => {
        if (email === currentUser.email) {
            addToast("error", "Cannot remove team leader")
            return
        }
        setTeamMembers(teamMembers.filter((m) => m.email !== email))
        addToast("success", "Member removed")
    }

    // Handle Final Submission
    const handleSubmit = async () => {
        if (!agreedToRules) {
            addToast("error", "Please agree to the hackathon rules")
            return
        }

        setLoading(true)
        try {
            const payload =
                registrationType === "individual"
                    ? {
                        type: "individual",
                        userId: currentUser.id,
                        hackathonId: hackathon.id,
                        profile,
                        motivation,
                        domain: preferredDomain,
                        techStack: selectedTools,
                    }
                    : {
                        type: "team",
                        teamId: teamData.id,
                        hackathonId: hackathon.id,
                        domain: teamDomain,
                        techStack: teamTechStack,
                        projectIdea,
                    }

            const response = await fetch("/api/registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                addToast("success", "Registration submitted successfully!")
                onClose()
                router.refresh()
            } else {
                const data = await response.json()
                addToast("error", data.error || "Failed to submit registration")
            }
        } catch (error) {
            addToast("error", "Failed to submit registration")
        } finally {
            setLoading(false)
        }
    }

    // Handle Next Step
    const handleNext = () => {
        if (step === 1 && !registrationType) {
            addToast("error", "Please select a registration type")
            return
        }

        if (registrationType === "team" && step === 2 && !teamSetupType) {
            addToast("error", "Please choose to join or create a team")
            return
        }

        setStep(step + 1)
    }

    // Handle Previous Step
    const handlePrevious = () => {
        setStep(step - 1)
    }

    // Toggle Tool Selection
    const toggleTool = (tool: string) => {
        if (selectedTools.includes(tool)) {
            setSelectedTools(selectedTools.filter((t) => t !== tool))
        } else {
            setSelectedTools([...selectedTools, tool])
        }
    }

    // Toggle Team Tech Stack
    const toggleTeamTech = (tech: string) => {
        if (teamTechStack.includes(tech)) {
            setTeamTechStack(teamTechStack.filter((t) => t !== tech))
        } else {
            setTeamTechStack([...teamTechStack, tech])
        }
    }

    // Add Skill
    const addSkill = (skill: string) => {
        if (skill && !profile.skills.includes(skill)) {
            setProfile({ ...profile, skills: [...profile.skills, skill] })
        }
    }

    // Remove Skill
    const removeSkill = (skill: string) => {
        setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-background via-background to-primary/5">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            Smart Registration for {hackathon.title}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Complete registration with intelligent suggestions and guidance
                        </p>
                    </DialogHeader>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Registration Progress</span>
                            <span className="text-xs font-bold text-primary">{Math.round(getProgress())}%</span>
                        </div>
                        <Progress value={getProgress()} className="h-2" />
                    </div>
                </div>

                <div className="flex gap-6 p-6">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        {/* STEP 1 - Choose Registration Type */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">🧩 STEP 1 — Choose Registration Type</h3>
                                    <p className="text-sm text-muted-foreground">Select how you want to participate</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Individual Card */}
                                    <button
                                        onClick={() => setRegistrationType("individual")}
                                        className={`p-6 rounded-xl border-2 transition-all text-left ${registrationType === "individual"
                                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-3 rounded-lg bg-primary/20">
                                                <Zap className="h-6 w-6 text-primary" />
                                            </div>
                                            <h4 className="text-lg font-semibold">Individual</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Register solo for the hackathon</p>
                                    </button>

                                    {/* Team Card */}
                                    <button
                                        onClick={() => setRegistrationType("team")}
                                        className={`p-6 rounded-xl border-2 transition-all text-left ${registrationType === "team"
                                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                            : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-3 rounded-lg bg-primary/20">
                                                <Users className="h-6 w-6 text-primary" />
                                            </div>
                                            <h4 className="text-lg font-semibold">Team</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Register with a team (2–{hackathon.maxTeamSize || 4} members)
                                        </p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* INDIVIDUAL FLOW */}
                        {registrationType === "individual" && (
                            <>
                                {/* STEP 2 - Confirm Profile */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">👤 STEP 2 — Confirm Profile</h3>
                                            <p className="text-sm text-muted-foreground">Review and update your information</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Name</Label>
                                                    <Input
                                                        value={profile.name}
                                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Email</Label>
                                                    <Input value={profile.email} disabled className="mt-1 bg-muted" />
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Experience Level</Label>
                                                <Select
                                                    value={profile.experienceLevel}
                                                    onValueChange={(value) => setProfile({ ...profile, experienceLevel: value })}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EXPERIENCE_LEVELS.map((level) => (
                                                            <SelectItem key={level} value={level}>
                                                                {level}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Skills</Label>
                                                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                                    {profile.skills.map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="gap-1">
                                                            {skill}
                                                            <X
                                                                className="h-3 w-3 cursor-pointer"
                                                                onClick={() => removeSkill(skill)}
                                                            />
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder="Add a skill and press Enter"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            addSkill(e.currentTarget.value)
                                                            e.currentTarget.value = ""
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="flex items-center gap-2">
                                                        <Github className="h-4 w-4" />
                                                        GitHub
                                                    </Label>
                                                    <Input
                                                        value={profile.github}
                                                        onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                                                        placeholder="github.com/username"
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="flex items-center gap-2">
                                                        <Linkedin className="h-4 w-4" />
                                                        LinkedIn
                                                    </Label>
                                                    <Input
                                                        value={profile.linkedin}
                                                        onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                                                        placeholder="linkedin.com/in/username"
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3 - Motivation & Skills */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">💡 STEP 3 — Motivation & Skills</h3>
                                            <p className="text-sm text-muted-foreground">Tell us about your interests</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label>Why do you want to join this hackathon?</Label>
                                                <Textarea
                                                    value={motivation}
                                                    onChange={(e) => setMotivation(e.target.value)}
                                                    placeholder="Share your motivation..."
                                                    className="mt-1 min-h-[100px]"
                                                />
                                            </div>

                                            <div>
                                                <Label>Preferred Domain</Label>
                                                <Select value={preferredDomain} onValueChange={setPreferredDomain}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select a domain" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DOMAINS.map((domain) => (
                                                            <SelectItem key={domain} value={domain}>
                                                                {domain}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Tools You Know</Label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {TECH_STACK.map((tool) => (
                                                        <Badge
                                                            key={tool}
                                                            variant={selectedTools.includes(tool) ? "default" : "outline"}
                                                            className="cursor-pointer"
                                                            onClick={() => toggleTool(tool)}
                                                        >
                                                            {tool}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4 - Review & Submit */}
                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">✅ STEP 4 — Review & Submit</h3>
                                            <p className="text-sm text-muted-foreground">Confirm your registration details</p>
                                        </div>

                                        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Registration Type</h4>
                                                <p className="font-medium">Individual</p>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Profile</h4>
                                                <p className="text-sm">{profile.name} • {profile.email}</p>
                                                <p className="text-sm text-muted-foreground">{profile.experienceLevel}</p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {profile.skills.map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Domain & Tools</h4>
                                                <p className="text-sm">{preferredDomain}</p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {selectedTools.map((tool) => (
                                                        <Badge key={tool} variant="outline" className="text-xs">
                                                            {tool}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Motivation</h4>
                                                <p className="text-sm">{motivation}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Checkbox
                                                id="rules"
                                                checked={agreedToRules}
                                                onCheckedChange={(checked) => setAgreedToRules(checked as boolean)}
                                            />
                                            <label htmlFor="rules" className="text-sm cursor-pointer">
                                                I agree to the hackathon rules and code of conduct
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* TEAM FLOW */}
                        {registrationType === "team" && (
                            <>
                                {/* STEP 2 - Team Setup */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">👥 STEP 2 — Team Setup</h3>
                                            <p className="text-sm text-muted-foreground">Join existing team or create new</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Join Existing Team */}
                                            <div
                                                className={`p-6 rounded-xl border-2 ${teamSetupType === "join" ? "border-primary bg-primary/5" : "border-border"
                                                    }`}
                                            >
                                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                                    <Users className="h-5 w-5" />
                                                    Join Existing Team
                                                </h4>

                                                <div className="space-y-3">
                                                    <Input
                                                        placeholder="Enter Team Code"
                                                        value={teamCode}
                                                        onChange={(e) => {
                                                            setTeamCode(e.target.value)
                                                            setTeamSetupType("join")
                                                        }}
                                                    />
                                                    <Button
                                                        onClick={handleCheckTeamCode}
                                                        disabled={!teamCode || loading}
                                                        variant="secondary"
                                                        className="w-full"
                                                    >
                                                        Check Team
                                                    </Button>

                                                    {teamData && teamSetupType === "join" && (
                                                        <div className="p-3 rounded-lg bg-background border border-border mt-3">
                                                            <p className="font-medium text-sm">{teamData.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {teamData.members.length}/{hackathon.maxTeamSize || 4} members
                                                            </p>
                                                            <Button onClick={handleJoinTeam} className="w-full mt-3" size="sm">
                                                                Join Team
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Create New Team */}
                                            <div
                                                className={`p-6 rounded-xl border-2 ${teamSetupType === "create" ? "border-primary bg-primary/5" : "border-border"
                                                    }`}
                                            >
                                                <h4 className="font-semibold mb-4 flex items-center gap-2">
                                                    <UserPlus className="h-5 w-5" />
                                                    Create New Team
                                                </h4>

                                                <div className="space-y-3">
                                                    <Input
                                                        placeholder="Enter Team Name"
                                                        value={teamName}
                                                        onChange={(e) => {
                                                            setTeamName(e.target.value)
                                                            setTeamSetupType("create")
                                                        }}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Team Leader: {currentUser.name} (You)
                                                    </p>
                                                    <Button
                                                        onClick={handleCreateTeam}
                                                        disabled={!teamName || loading}
                                                        className="w-full"
                                                    >
                                                        Create Team & Continue
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3 - Add Team Members */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">👥 STEP 3 — Add Team Members</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Invite members to join {teamData?.name || "your team"}
                                            </p>
                                        </div>

                                        <div className="p-6 rounded-xl border border-border bg-card">
                                            <h4 className="font-semibold mb-4">
                                                Team Members ({teamMembers.length}/{hackathon.maxTeamSize || 4})
                                            </h4>

                                            <div className="space-y-3 mb-4">
                                                {teamMembers.map((member, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <User className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{member.name || member.email}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {member.email === currentUser.email ? "Team Leader" : member.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={
                                                                    member.status === "joined"
                                                                        ? "default"
                                                                        : member.status === "invited"
                                                                            ? "secondary"
                                                                            : "outline"
                                                                }
                                                            >
                                                                {member.status === "joined" && <CheckCircle className="h-3 w-3 mr-1" />}
                                                                {member.status === "invited" && <Clock className="h-3 w-3 mr-1" />}
                                                                {member.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                                                {member.status}
                                                            </Badge>
                                                            {member.email !== currentUser.email && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleRemoveMember(member.email)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {teamMembers.length < (hackathon.maxTeamSize || 4) && (
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Enter member email"
                                                        value={newMemberEmail}
                                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                                        type="email"
                                                    />
                                                    <Button onClick={handleInviteMember} disabled={loading}>
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Invite
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4 - Team Details */}
                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">🎯 STEP 4 — Team Details</h3>
                                            <p className="text-sm text-muted-foreground">Define your team's focus and expertise</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label>Team Primary Domain</Label>
                                                <Select value={teamDomain} onValueChange={setTeamDomain}>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select primary domain" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DOMAINS.map((domain) => (
                                                            <SelectItem key={domain} value={domain}>
                                                                {domain}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Tech Stack</Label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {TECH_STACK.map((tech) => (
                                                        <Badge
                                                            key={tech}
                                                            variant={teamTechStack.includes(tech) ? "default" : "outline"}
                                                            className="cursor-pointer"
                                                            onClick={() => toggleTeamTech(tech)}
                                                        >
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Project Idea (Optional)</Label>
                                                <Textarea
                                                    value={projectIdea}
                                                    onChange={(e) => setProjectIdea(e.target.value)}
                                                    placeholder="Brief description of what your team plans to build..."
                                                    className="mt-1 min-h-[100px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 5 - Review & Submit */}
                                {step === 5 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-1">✅ STEP 5 — Review & Submit</h3>
                                            <p className="text-sm text-muted-foreground">Confirm your team registration</p>
                                        </div>

                                        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Registration Type</h4>
                                                <p className="font-medium">Team</p>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Team Name</h4>
                                                <p className="font-medium">{teamData?.name}</p>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Team Members</h4>
                                                <div className="space-y-2">
                                                    {teamMembers.map((member, index) => (
                                                        <div key={index} className="flex items-center justify-between text-sm">
                                                            <span>{member.name || member.email}</span>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {member.status}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Domain & Tech Stack</h4>
                                                <p className="text-sm mb-2">{teamDomain}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {teamTechStack.map((tech) => (
                                                        <Badge key={tech} variant="outline" className="text-xs">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {projectIdea && (
                                                <div>
                                                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Project Idea</h4>
                                                    <p className="text-sm">{projectIdea}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Checkbox
                                                id="team-rules"
                                                checked={agreedToRules}
                                                onCheckedChange={(checked) => setAgreedToRules(checked as boolean)}
                                            />
                                            <label htmlFor="team-rules" className="text-sm cursor-pointer">
                                                All team members agree to the hackathon rules and code of conduct
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Smart Tips Sidebar */}
                    <div className="w-80 space-y-4">
                        <div className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-blue-500/10 sticky top-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold">Smart Tips</h4>
                            </div>
                            <div className="space-y-3">
                                {getSmartTips().map((tip, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <tip.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-muted-foreground">{tip.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border p-6 flex justify-between">
                    <Button variant="outline" onClick={step === 1 ? onClose : handlePrevious}>
                        {step === 1 ? "Cancel" : <><ArrowLeft className="h-4 w-4 mr-2" />Previous</>}
                    </Button>

                    {((registrationType === "individual" && step < 4) ||
                        (registrationType === "team" && step < 5)) && (
                            <Button onClick={handleNext} disabled={!registrationType && step === 1}>
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}

                    {((registrationType === "individual" && step === 4) ||
                        (registrationType === "team" && step === 5)) && (
                            <Button onClick={handleSubmit} disabled={!agreedToRules || loading}>
                                {loading ? "Submitting..." : "Submit Registration"}
                                <CheckCircle className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
