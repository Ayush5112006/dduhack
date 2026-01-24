import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "hackathon_session"
const SESSION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export interface Session {
  userId: string
  userEmail: string
  userName: string
  userRole: "participant" | "organizer" | "admin"
  loginTime: number
  expiresAt: number
}

export async function createSession(userData: Omit<Session, "loginTime" | "expiresAt">) {
  const cookieStore = await cookies()
  
  const session: Session = {
    ...userData,
    loginTime: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRY,
  }

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY / 1000,
    path: "/",
  })

  return session
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value)

    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      await destroySession()
      return null
    }

    return session
  } catch (error) {
    console.error("Failed to parse session:", error)
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function updateSession(updates: Partial<Omit<Session, "loginTime" | "expiresAt">>) {
  const session = await getSession()
  if (!session) return null

  const updatedSession: Session = {
    ...session,
    ...updates,
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(updatedSession), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY / 1000,
    path: "/",
  })

  return updatedSession
}
