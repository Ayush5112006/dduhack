'use client'

import React from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { SessionProvider } from '@/components/session-provider'
import { ToastProvider } from '@/components/toast-provider'
import { MainLayout } from '@/components/layout/main-layout'

interface RootLayoutClientProps {
  children: React.ReactNode
}

/**
 * Client-side layout wrapper component
 * Wraps all client-side providers and maintains proper React boundaries
 * 
 * This component ensures that all client-side context providers
 * (ErrorBoundary, SessionProvider, ToastProvider) are instantiated
 * on the client side only, preventing HMR module factory errors.
 */
export function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ToastProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </ToastProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}
