"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SmartRegistrationModal } from "@/components/hackathons/smart-registration-modal"
import { Sparkles } from "lucide-react"

export default function RegisterDemoPage() {
    const [modalOpen, setModalOpen] = useState(false)

    // Mock data - replace with actual data from your API
    const mockHackathon = {
        id: "cmkqnx6f000bp1hgh3lk3cm2",
        title: "Cloud & DevOps Challenge",
        maxTeamSize: 4,
    }

    const mockCurrentUser = {
        id: "user123",
        name: "Ayush Thummar",
        email: "ayush@example.com",
        skills: ["React", "Node.js", "Python"],
        github: "github.com/ayush",
        linkedin: "linkedin.com/in/ayush",
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
            <div className="text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                        Smart Registration Demo
                    </h1>
                    <p className="text-muted-foreground">
                        Experience the intelligent hackathon registration flow
                    </p>
                </div>

                <Button
                    onClick={() => setModalOpen(true)}
                    size="lg"
                    className="gap-2 text-lg px-8 py-6"
                >
                    <Sparkles className="h-5 w-5" />
                    Open Smart Registration
                </Button>

                <div className="mt-8 p-6 rounded-xl border border-border bg-card max-w-md mx-auto text-left">
                    <h3 className="font-semibold mb-3">Features Included:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>✅ Individual & Team Registration</li>
                        <li>✅ Multi-step Progress Tracking</li>
                        <li>✅ Smart Tips & Guidance</li>
                        <li>✅ Team Creation & Joining</li>
                        <li>✅ Member Invitation System</li>
                        <li>✅ Profile Management</li>
                        <li>✅ Domain & Tech Stack Selection</li>
                        <li>✅ Validation & Error Handling</li>
                    </ul>
                </div>

                <SmartRegistrationModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    hackathon={mockHackathon}
                    currentUser={mockCurrentUser}
                />
            </div>
        </div>
    )
}
