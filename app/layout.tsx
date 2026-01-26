import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ToastProvider } from '@/components/toast-provider'
import { SessionProvider } from '@/components/session-provider'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import { PerformanceMonitor } from '@/components/performance-monitor'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

const _geist = Geist({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-geist'
});
const _geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-geist-mono'
});

export const metadata: Metadata = {
  title: 'HackHub - Find Your Next Hackathon',
  description: 'Discover and participate in the best hackathons worldwide. Build, learn, and win amazing prizes.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased overflow-x-hidden`}>
        <ErrorBoundary>
          <SessionProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </SessionProvider>
        </ErrorBoundary>
        <ServiceWorkerRegister />
        <PerformanceMonitor />
        <Analytics />
      </body>
    </html>
  )
}
