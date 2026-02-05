"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export interface SecureSessionContextType {
  csrfToken: string | null
  isLoading: boolean
  error: string | null
  refreshCSRF: () => Promise<void>
}

const SecureSessionContext = createContext<SecureSessionContextType | undefined>(undefined)

export function SecureSessionProvider({ children }: { children: React.ReactNode }) {
  const [csrfToken, setCSRFToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshCSRF = async () => {
    try {
      const response = await fetch("/api/auth/csrf")
      if (response.ok) {
        const data = await response.json()
        setCSRFToken(data.token)
      }
    } catch (err) {
      setError("Failed to refresh CSRF token")
      console.error(err)
    }
  }

  useEffect(() => {
    // Get initial CSRF token
    const initializeSession = async () => {
      try {
        await refreshCSRF()
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()

    // Refresh CSRF token periodically (every 30 minutes)
    const interval = setInterval(refreshCSRF, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <SecureSessionContext.Provider
      value={{
        csrfToken,
        isLoading,
        error,
        refreshCSRF,
      }}
    >
      {children}
    </SecureSessionContext.Provider>
  )
}

export function useSecureSession() {
  const context = useContext(SecureSessionContext)
  if (!context) {
    throw new Error("useSecureSession must be used within SecureSessionProvider")
  }
  return context
}
