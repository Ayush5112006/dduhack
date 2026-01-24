"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/toast-provider"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function RegisterButton({ hackathonId }: { hackathonId: string }) {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const router = useRouter()

  const handleRegister = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()

      if (!res.ok) {
        addToast("error", data.error || "Registration failed")
        return
      }

      addToast("success", "Successfully registered!")
      router.refresh()
    } catch (error) {
      console.error(error)
      addToast("error", "Unable to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleRegister} disabled={loading} className="w-full">
      {loading ? "Registering..." : "Register Now"}
    </Button>
  )
}
