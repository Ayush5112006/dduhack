"use client"

import { useCallback } from "react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
}

let toastId = 0
const toastListeners = new Set<(toasts: Toast[]) => void>()
let toasts: Toast[] = []

export function useToast() {
  const addToast = useCallback(
    (type: "success" | "error" | "warning" | "info", message: string, duration = 3000) => {
      const id = String(toastId++)
      const newToast = { id, message, type }
      toasts = [...toasts, newToast]
      toastListeners.forEach((listener) => listener(toasts))

      if (duration > 0) {
        setTimeout(() => {
          toasts = toasts.filter((t) => t.id !== id)
          toastListeners.forEach((listener) => listener(toasts))
        }, duration)
      }

      return id
    },
    []
  )

  return { addToast }
}
