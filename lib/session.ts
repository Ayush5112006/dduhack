import crypto from "crypto"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

const SESSION_COOKIE_NAME = "hackathon_session"
const SESSION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export interface Session {
  token: string
  userId: string
  userEmail: string
  userName: string
  userRole: "participant" | "organizer" | "admin" | "judge"
  loginTime: number
  expiresAt: number
}

function getCookieStore() {
  return cookies()
}

function serializeCookiePayload(payload: Omit<Session, "loginTime">) {
  return JSON.stringify(payload)
}

function parseCookiePayload(value: string | undefined): { token: string; expiresAt: number } | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (parsed?.token && parsed?.expiresAt) {
      return { token: parsed.token, expiresAt: parsed.expiresAt }
    }
  } catch (error) {
    // fallback if cookie is plain token string
    if (typeof value === "string") {
      return { token: value, expiresAt: Date.now() + SESSION_EXPIRY }
    }
  }
  return null
}

async function readTokenFromCookie(): Promise<{ token: string; expiresAt: number } | null> {
  const cookieStore = await getCookieStore()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
  return parseCookiePayload(cookie)
}

async function setTokenCookie(session: Omit<Session, "loginTime">) {
  const cookieStore = await getCookieStore()
  cookieStore.set(SESSION_COOKIE_NAME, serializeCookiePayload(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.floor((session.expiresAt - Date.now()) / 1000),
    path: "/",
  })
}

async function clearTokenCookie() {
  const cookieStore = await getCookieStore()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function createSession(userData: Omit<Session, "token" | "loginTime" | "expiresAt">) {
  const token = crypto.randomUUID()
  const expiresAt = Date.now() + SESSION_EXPIRY

  await prisma.session.create({
    data: {
      token,
      userId: userData.userId,
      expiresAt: new Date(expiresAt),
    },
  })

  const session: Session = {
    token,
    ...userData,
    loginTime: Date.now(),
    expiresAt,
  }

  await setTokenCookie({
    token,
    userId: session.userId,
    userEmail: session.userEmail,
    userName: session.userName,
    userRole: session.userRole,
    expiresAt: session.expiresAt,
  })

  return session
}

export async function getSession(): Promise<Session | null> {
  const cookiePayload = await readTokenFromCookie()
  if (!cookiePayload) return null

  const sessionRecord = await prisma.session.findUnique({
    where: { token: cookiePayload.token },
    include: { user: true },
  })

  if (!sessionRecord || !sessionRecord.user) {
    await clearTokenCookie()
    return null
  }

  if (sessionRecord.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { token: sessionRecord.token } }).catch(() => {})
    await clearTokenCookie()
    return null
  }

  return {
    token: sessionRecord.token,
    userId: sessionRecord.userId,
    userEmail: sessionRecord.user.email,
    userName: sessionRecord.user.name,
    userRole: sessionRecord.user.role as Session["userRole"],
    loginTime: sessionRecord.createdAt.getTime(),
    expiresAt: sessionRecord.expiresAt.getTime(),
  }
}

export async function destroySession(token?: string) {
  const cookiePayload = await readTokenFromCookie()
  const resolvedToken = token || cookiePayload?.token
  if (resolvedToken) {
    await prisma.session.delete({ where: { token: resolvedToken } }).catch(() => {})
  }
  await clearTokenCookie()
}

// Kept for API compatibility; currently returns the latest session snapshot
export async function updateSession() {
  const session = await getSession()
  return session
}
