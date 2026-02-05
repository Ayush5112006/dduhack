'use client'

import { ErrorBoundary } from '@/components/error-boundary'

interface AuthLayoutClientProps {
  children: React.ReactNode
}

/**
 * Client-side auth layout wrapper
 * Isolates ErrorBoundary (client component) from server layout
 * Prevents "Module factory is not available" errors during HMR
 */
export function AuthLayoutClient({ children }: AuthLayoutClientProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}
