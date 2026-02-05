"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface User {
  userId: string
  userEmail: string
  userName: string
  userRole: "participant" | "organizer" | "admin"
}

interface SessionContextType {
  user: User | null
  isLoading: boolean
  sessionFetched: boolean
  login: (user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionFetched, setSessionFetched] = useState(false)

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const sessionData = await response.json()
          if (sessionData.user) {
            setUser(sessionData.user)
          }
        } else if (response.status !== 401) {
          // Only log unexpected errors
          console.error("Failed to check session:", response.statusText)
        }
      } catch (error) {
        console.error("Failed to check session:", error)
      } finally {
        setIsLoading(false)
        setSessionFetched(true)
      }
    }

    checkSession()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    // Session cookie is set by the server
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Failed to logout:", error)
    } finally {
      setUser(null)
    }
  }

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoading,
        sessionFetched,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
