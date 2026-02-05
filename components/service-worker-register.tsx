"use client"

import { useEffect } from "react"

/**
 * Registers a service worker for offline caching and faster reloads.
 * No-op during SSR and when service workers are unsupported.
 */
/**
 * Registers a service worker for offline caching and faster reloads.
 * No-op during SSR, development, and when service workers are unsupported.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    // Disable service worker in development to prevent cache errors
    if (process.env.NODE_ENV === "development") return
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    
    const swUrl = "/service-worker.js"
    navigator.serviceWorker.register(swUrl, { scope: "/" }).catch(() => {})
  }, [])

  return null
}
