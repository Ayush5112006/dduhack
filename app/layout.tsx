import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import { PerformanceMonitor } from '@/components/performance-monitor'
import { RootLayoutClient } from '@/components/root-layout-client'
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
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased overflow-x-hidden`} suppressHydrationWarning>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
        <ServiceWorkerRegister />
        <PerformanceMonitor />
        <Analytics />
      </body>
    </html>
  )
}
