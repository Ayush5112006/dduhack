"use client"

import { useEffect } from "react"

/**
 * Registers a service worker for offline caching and faster reloads.
 * No-op during SSR and when service workers are unsupported.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    const swUrl = "/service-worker.js"
    navigator.serviceWorker.register(swUrl, { scope: "/" }).catch(() => {})
  }, [])

  return null
}
