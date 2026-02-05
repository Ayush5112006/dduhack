"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ProblemStatementSelector } from "@/components/registration/problem-statement-selector"
import { MultiStepRegistrationForm } from "@/components/registration/multi-step-registration-form"

import { useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"

export default function HackathonRegistrationPage() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const [selectedProblem, setSelectedProblem] = useState(searchParams.get("problemId"))
  const hackathonId = searchParams.get("hackathon") || "bootcamp-hack"

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleProblemSelect = async (formData: any) => {
    try {
      const response = await fetch("/api/participant/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonId,
          participationType: formData.participationType,
          teamName: formData.teamName,
          ...formData,
        }),
      })

      if (response.ok) {
        alert("Registration successful!")
        window.location.href = "/dashboard/hackathons"
      } else {
        const error = await response.json()
        alert(`Registration failed: ${error.error}`)
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("An error occurred during registration")
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-background border-b border-border animate-pulse" />
        <div className="h-12 bg-background border-b border-border animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar handled by MainLayout */}

      {/* Breadcrumb Navigation */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link
              href="/dashboard/hackathons"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Hackathons
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Register</span>
          </nav>
        </div>
      </div>

      <main>
        {!selectedProblem ? (
          <ProblemStatementSelector onSelect={(problem) => setSelectedProblem(problem.id)} />
        ) : (
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <button
                onClick={() => setSelectedProblem(null)}
                className="text-sm text-primary hover:underline mb-4"
              >
                ← Back to Problem Selection
              </button>
              <h1 className="text-3xl font-bold text-foreground">Complete Your Registration</h1>
              <p className="text-muted-foreground mt-2">
                Fill out all required fields to register for this hackathon
              </p>
            </div>
            <MultiStepRegistrationForm
              hackathonId={hackathonId}
              hackathonTitle="Bootcamp Hack"
              onSubmit={handleProblemSelect}
            />
          </div>
        )}
      </main>
    </div>
  )
}
