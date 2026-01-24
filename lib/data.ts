export type HackathonStatus = "upcoming" | "live" | "closed" | "past"

export type Hackathon = {
  id: string
  title: string
  organizer: string
  banner: string
  prize: string
  prizeAmount: number
  mode: "Online" | "Offline" | "Hybrid"
  location: string
  registrationDeadline: string
  startDate: string
  endDate: string
  category: string
  participants: number
  tags: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  isFree: boolean
  featured: boolean
  description: string
  eligibility: string
  status: HackathonStatus
  ownerId?: string
}

export type TeamMember = {
  userId: string
  email: string
  status: "leader" | "invited" | "joined" | "declined"
}

export type Team = {
  id: string
  hackathonId: string
  name: string
  leaderId: string
  leaderEmail: string
  members: TeamMember[]
  locked: boolean
  createdAt: number
}

export type Registration = {
  id: string
  hackathonId: string
  userId: string
  userEmail: string
  mode: "individual" | "team"
  teamId?: string
  status: "pending" | "approved" | "rejected"
  consent: boolean
  formData: Record<string, unknown>
  createdAt: number
}

export type ProblemStatement = {
  id: string
  hackathonId: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  prize?: string
  resources?: string
  dataset?: string
}

export type SubmissionStatus = "draft" | "submitted" | "late"

export type Submission = {
  id: string
  hackathonId: string
  teamId?: string
  userId?: string
  userEmail?: string
  psId?: string
  title: string
  description: string
  github?: string
  demo?: string
  video?: string
  files?: string[]
  techStack?: string[]
  status: SubmissionStatus
  createdAt: number
  updatedAt: number
  score?: number
  feedback?: string
}

export type UserRole = "participant" | "organizer" | "admin"

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: "active" | "suspended" | "pending"
}

export type JudgeAssignment = {
  id: string
  hackathonId: string
  judgeId: string
  judgeEmail: string
  assignedAt: number
}

export type Score = {
  id: string
  submissionId: string
  judgeId: string
  hackathonId: string
  innovation: number // 1-10
  technical: number // 1-10
  design: number // 1-10
  impact: number // 1-10
  presentation: number // 1-10
  total: number // auto-calculated
  feedback?: string
  createdAt: number
}

export type Winner = {
  id: string
  hackathonId: string
  submissionId: string
  rank: number // 1, 2, 3
  prize?: string
  announcedAt: number
}

export type Notification = {
  id: string
  userId: string
  type: "registration" | "deadline" | "result" | "invitation" | "announcement"
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: number
}

export type Certificate = {
  id: string
  userId: string
  userName: string
  userEmail: string
  hackathonId: string
  hackathonTitle: string
  type: "participation" | "winner" | "runner-up" | "completion"
  rank?: number
  issuedAt: number
  verificationCode: string
}

export type UserProfile = {
  userId: string
  bio?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  twitter?: string
  skills?: string[]
  interests?: string[]
  avatar?: string
  totalHackathons: number
  totalSubmissions: number
  wins: number
  updatedAt: number
}

export const hackathons: Hackathon[] = [
  {
    id: "ai-summit",
    title: "Global AI Innovation Summit",
    organizer: "OpenAI Labs",
    banner: "/placeholder.svg",
    prize: "$25,000",
    prizeAmount: 25000,
    mode: "Hybrid",
    location: "San Francisco + Remote",
    registrationDeadline: "2026-03-20",
    startDate: "2026-03-25",
    endDate: "2026-03-27",
    category: "AI",
    participants: 3200,
    tags: ["AI", "ML", "LLM", "Data"],
    difficulty: "Advanced",
    isFree: true,
    featured: true,
    description: "Build production-ready AI apps using cutting-edge foundation models, agents, and retrieval.",
    eligibility: "Open for all",
    status: "upcoming",
    ownerId: "org_1",
  },
  {
    id: "web-crafters",
    title: "Web Crafters Championship",
    organizer: "Vercel + Cloudflare",
    banner: "/placeholder.svg",
    prize: "$15,000",
    prizeAmount: 15000,
    mode: "Online",
    location: "Global",
    registrationDeadline: "2026-02-10",
    startDate: "2026-02-15",
    endDate: "2026-02-17",
    category: "Web",
    participants: 5400,
    tags: ["Next.js", "Edge", "Performance", "UI/UX"],
    difficulty: "Intermediate",
    isFree: true,
    featured: true,
    description: "Ship blazing-fast web experiences with edge rendering, streaming, and AI UX.",
    eligibility: "Open for all",
    status: "live",
    ownerId: "org_2",
  },
  {
    id: "blockwave",
    title: "BlockWave Hack",
    organizer: "Polygon Labs",
    banner: "/placeholder.svg",
    prize: "$30,000",
    prizeAmount: 30000,
    mode: "Hybrid",
    location: "Bangalore + Remote",
    registrationDeadline: "2026-01-30",
    startDate: "2026-02-05",
    endDate: "2026-02-07",
    category: "Blockchain",
    participants: 2100,
    tags: ["DeFi", "Wallet", "Infra", "ZK"],
    difficulty: "Advanced",
    isFree: false,
    featured: false,
    description: "Build next-gen decentralized apps with real-world utility and zk-powered privacy.",
    eligibility: "Open for all",
    status: "upcoming",
    ownerId: "org_1",
  },
  {
    id: "app-sprint",
    title: "Mobile App Sprint",
    organizer: "Google Developer Groups",
    banner: "/placeholder.svg",
    prize: "$12,000",
    prizeAmount: 12000,
    mode: "Offline",
    location: "Berlin, Germany",
    registrationDeadline: "2026-01-15",
    startDate: "2026-01-20",
    endDate: "2026-01-21",
    category: "Mobile",
    participants: 1100,
    tags: ["Android", "Flutter", "UI", "Accessibility"],
    difficulty: "Beginner",
    isFree: true,
    featured: false,
    description: "Prototype mobile experiences with great UX, offline-first behavior, and accessibility.",
    eligibility: "Students and professionals",
    status: "live",
    ownerId: "org_3",
  },
  {
    id: "cyber-shield",
    title: "Cyber Shield Challenge",
    organizer: "Trail of Bits",
    banner: "/placeholder.svg",
    prize: "$18,000",
    prizeAmount: 18000,
    mode: "Online",
    location: "Global",
    registrationDeadline: "2025-12-01",
    startDate: "2025-12-05",
    endDate: "2025-12-07",
    category: "Security",
    participants: 2400,
    tags: ["Security", "CTF", "AppSec", "Cloud"],
    difficulty: "Intermediate",
    isFree: true,
    featured: false,
    description: "Solve modern security challenges across web, cloud, and binaries with hands-on labs.",
    eligibility: "Open for all",
    status: "closed",
    ownerId: "org_4",
  },
  {
    id: "health-hack",
    title: "HealthTech Builders",
    organizer: "Mayo Clinic",
    banner: "/placeholder.svg",
    prize: "$20,000",
    prizeAmount: 20000,
    mode: "Hybrid",
    location: "Boston + Remote",
    registrationDeadline: "2025-10-01",
    startDate: "2025-10-10",
    endDate: "2025-10-12",
    category: "AI",
    participants: 1700,
    tags: ["Healthcare", "AI", "Data", "Privacy"],
    difficulty: "Intermediate",
    isFree: false,
    featured: false,
    description: "Build privacy-first healthcare solutions with AI diagnostics and clinical workflows.",
    eligibility: "Health students and professionals",
    status: "past",
    ownerId: "org_5",
  },
]

export const categories = ["AI", "Blockchain", "Web", "Mobile", "Security", "IoT"]

export const winners = []

export const sponsors = []

export const teams: Team[] = []

export const registrations: Registration[] = []

export const problemStatements: ProblemStatement[] = [
  {
    id: "ps-ai-1",
    hackathonId: "ai-summit",
    title: "Agentic customer support",
    description: "Build an agent that resolves support tickets with tool use and LLM reasoning.",
    difficulty: "Hard",
    prize: "$5,000",
    resources: "Any public LLM APIs",
  },
  {
    id: "ps-web-1",
    hackathonId: "web-crafters",
    title: "Edge-first storefront",
    description: "Create a blazing fast e-commerce storefront with edge rendering and streaming UI.",
    difficulty: "Medium",
    prize: "$3,000",
  },
]

export const submissions: Submission[] = []

export const judgeAssignments: JudgeAssignment[] = []

export const scores: Score[] = []

export const winnersList: Winner[] = []

export const notifications: Notification[] = []

export const certificates: Certificate[] = []

export const userProfiles: UserProfile[] = []

// Helper function to create notifications
export function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    read: false,
    createdAt: Date.now(),
  }
  notifications.push(newNotification)
  return newNotification
}

export const users: User[] = [
  { id: "user_demo", name: "Demo User", email: "demo@example.com", role: "participant", status: "active" },
  { id: "judge_1", name: "Dr. Sarah Chen", email: "judge1@example.com", role: "judge", status: "active" },
  { id: "judge_2", name: "Prof. Mark Johnson", email: "judge2@example.com", role: "judge", status: "active" },
  { id: "org_1", name: "OpenAI Labs", email: "org1@example.com", role: "organizer", status: "active" },
  { id: "org_2", name: "Vercel Org", email: "org2@example.com", role: "organizer", status: "pending" },
  { id: "org_3", name: "GDG Berlin", email: "org3@example.com", role: "organizer", status: "active" },
  { id: "org_4", name: "Trail of Bits", email: "org4@example.com", role: "organizer", status: "active" },
  { id: "org_5", name: "Mayo Clinic", email: "org5@example.com", role: "organizer", status: "active" },
  { id: "admin_1", name: "Platform Admin", email: "admin@example.com", role: "admin", status: "active" },
]

export function findHackathonById(id: string) {
  return hackathons.find((h) => h.id === id) || null
}

export function isRegistrationOpen(hackathon: Hackathon) {
  const deadline = new Date(hackathon.registrationDeadline).getTime()
  return Date.now() <= deadline && hackathon.status !== "past" && hackathon.status !== "closed"
}

export function lockTeamIfDeadlinePassed(team: Team, hackathon: Hackathon) {
  if (!team.locked && !isRegistrationOpen(hackathon)) {
    team.locked = true
  }
  return team
}

export function ensureUser(sessionUser: { userId: string; userEmail: string; userName: string; userRole: UserRole }) {
  const existing = users.find((u) => u.id === sessionUser.userId)
  if (existing) return existing
  const newUser: User = {
    id: sessionUser.userId,
    email: sessionUser.userEmail,
    name: sessionUser.userName,
    role: sessionUser.userRole,
    status: "active",
  }
  users.push(newUser)
  return newUser
}

export function findUserByEmail(email: string) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}
