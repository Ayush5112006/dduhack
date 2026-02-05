// Smart Registration Modal Types

export type RegistrationType = "individual" | "team"
export type TeamSetupType = "join" | "create"
export type MemberStatus = "invited" | "joined" | "pending"
export type RegistrationStatus = "pending" | "approved" | "rejected"
export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert"
export type TeamMemberRole = "leader" | "member"

export interface Hackathon {
    id: string
    title: string
    description?: string
    startDate?: Date
    endDate?: Date
    maxTeamSize?: number
    registrationDeadline?: Date
    status?: "upcoming" | "ongoing" | "completed"
}

export interface User {
    id: string
    name: string
    email: string
    skills?: string[]
    experienceLevel?: ExperienceLevel
    github?: string
    linkedin?: string
    bio?: string
    avatar?: string
}

export interface TeamMember {
    id?: string
    userId?: string
    email: string
    name?: string
    role?: TeamMemberRole
    status: MemberStatus
    joinedAt?: Date
    invitedAt?: Date
    user?: User
}

export interface Team {
    id: string
    name: string
    code: string
    hackathonId: string
    leaderId: string
    description?: string
    domain?: string
    techStack?: string[]
    projectIdea?: string
    createdAt: Date
    updatedAt: Date
    members: TeamMember[]
    hackathon?: Hackathon
    leader?: User
}

export interface UserProfile {
    name: string
    email: string
    skills: string[]
    experienceLevel: ExperienceLevel
    github: string
    linkedin: string
    bio?: string
}

export interface IndividualRegistrationData {
    type: "individual"
    userId: string
    hackathonId: string
    profile: UserProfile
    motivation: string
    domain: string
    techStack: string[]
}

export interface TeamRegistrationData {
    type: "team"
    teamId: string
    hackathonId: string
    domain: string
    techStack: string[]
    projectIdea?: string
}

export type RegistrationData = IndividualRegistrationData | TeamRegistrationData

export interface Registration {
    id: string
    type: RegistrationType
    userId?: string
    teamId?: string
    hackathonId: string
    domain: string
    techStack: string[]
    motivation?: string
    projectIdea?: string
    status: RegistrationStatus
    createdAt: Date
    updatedAt: Date
    user?: User
    team?: Team
    hackathon?: Hackathon
}

export interface SmartRegistrationModalProps {
    open: boolean
    onClose: () => void
    hackathon: Hackathon
    currentUser: User
}

export interface SmartTip {
    icon: any // Lucide icon component
    text: string
}

// API Response Types

export interface ApiResponse<T = any> {
    success?: boolean
    error?: string
    data?: T
}

export interface CreateRegistrationResponse extends ApiResponse {
    registration?: Registration
}

export interface CheckTeamResponse extends ApiResponse {
    team?: Team
}

export interface CreateTeamResponse extends ApiResponse {
    team?: Team
}

export interface JoinTeamResponse extends ApiResponse {
    member?: TeamMember
}

export interface InviteMemberResponse extends ApiResponse {
    member?: TeamMember
}

export interface GetRegistrationsResponse extends ApiResponse {
    registrations?: Registration[]
}

// Form State Types

export interface RegistrationFormState {
    step: number
    registrationType: RegistrationType | null
    teamSetupType: TeamSetupType | null
    loading: boolean
    error: string | null
}

export interface IndividualFormState {
    profile: UserProfile
    motivation: string
    preferredDomain: string
    selectedTools: string[]
    agreedToRules: boolean
}

export interface TeamFormState {
    teamCode: string
    teamName: string
    teamData: Team | null
    teamMembers: TeamMember[]
    newMemberEmail: string
    teamDomain: string
    teamTechStack: string[]
    projectIdea: string
    agreedToRules: boolean
}

// Constants

export const DOMAINS = [
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
] as const

export const TECH_STACK = [
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
] as const

export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Expert",
]

export type Domain = typeof DOMAINS[number]
export type TechStack = typeof TECH_STACK[number]
