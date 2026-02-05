import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Lazy initialization of supabase admin client to avoid build-time errors
// This ensures the client is only created at runtime when environment variables are available
let _supabaseAdmin: ReturnType<typeof createClient> | null = null

export const getSupabaseAdmin = () => {
    if (!_supabaseAdmin) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error(
                'Missing Supabase environment variables. ' +
                'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
            )
        }

        _supabaseAdmin = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )
    }
    return _supabaseAdmin
}

// Backward compatibility: export as supabaseAdmin (getter)
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
    get: (target, prop) => {
        const admin = getSupabaseAdmin()
        return (admin as any)[prop]
    }
})

// Type definitions for common database tables
export interface User {
    id: string
    email: string
    name: string
    role: string
    phone?: string
    avatar?: string
    bio?: string
    status: string
    created_at: string
    updated_at: string
}

export interface Hackathon {
    id: string
    title: string
    organizer: string
    owner_id: string
    organization_type?: string
    organization_logo?: string
    banner?: string
    description?: string
    eligibility?: string
    problem_statement_pdf?: string
    prize?: string
    prize_amount: number
    mode: string
    location?: string
    category: string
    tags?: string
    difficulty: string
    registration_deadline: string
    start_date: string
    end_date: string
    status: string
    is_free: boolean
    featured: boolean
    participants: number
    allow_teams: boolean
    min_team_size: number
    max_team_size: number
    allow_solo_submission: boolean
    created_at: string
    updated_at: string
}

export interface Registration {
    id: string
    hackathon_id: string
    user_id: string
    user_email: string
    mode: string
    team_id?: string
    status: string
    consent: boolean
    full_name?: string
    phone?: string
    university?: string
    enrollment_number?: string
    branch?: string
    year?: string
    skills?: string
    experience?: string
    github_profile?: string
    linkedin_profile?: string
    portfolio_url?: string
    project_idea?: string
    motivation?: string
    form_data?: string
    created_at: string
    updated_at: string
}

export interface Team {
    id: string
    hackathon_id: string
    name: string
    code: string
    leader_id: string
    leader_email: string
    locked: boolean
    created_at: string
    updated_at: string
}

export interface TeamMember {
    id: string
    team_id: string
    user_id: string
    email: string
    status: string
    role: string
    created_at: string
}

export interface MentorAssignment {
    id: string
    hackathon_id: string
    student_id: string
    mentor_id: string
    assigned_at: string
    created_at: string
    updated_at: string
}

export interface Submission {
    id: string
    hackathon_id: string
    team_id?: string
    user_id?: string
    user_email?: string
    ps_id?: string
    title: string
    description?: string
    github?: string
    demo?: string
    video?: string
    files?: string
    tech_stack?: string
    status: string
    locked: boolean
    locked_at?: string
    locked_reason?: string
    created_at: string
    updated_at: string
}

export interface UserProfile {
    id: string
    user_id: string
    bio?: string
    location?: string
    website?: string
    github?: string
    linkedin?: string
    twitter?: string
    skills?: string
    interests?: string
    avatar?: string
    total_hackathons: number
    total_submissions: number
    wins: number
    created_at: string
    updated_at: string
}
