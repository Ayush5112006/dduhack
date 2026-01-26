"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/toast-provider"
import { useRouter } from "next/navigation"
import { Mail, Users, CheckCircle2, AlertCircle } from "lucide-react"

interface AdvancedRegistrationFormProps {
  hackathonId: string
  hackathonTitle: string
  registrationDeadline: Date
}

export function AdvancedRegistrationForm({
  hackathonId,
  hackathonTitle,
  registrationDeadline,
}: AdvancedRegistrationFormProps) {
  const { addToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"individual" | "team">("individual")
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [consent, setConsent] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    university: "",
    enrollmentNumber: "",
    branch: "",
    year: "",
    skills: "",
    experience: "",
    githubProfile: "",
    linkedinProfile: "",
    portfolioUrl: "",
    projectIdea: "",
    motivation: "",
    teamName: "",
  })

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true)
  const [hoursLeft, setHoursLeft] = useState(0)

  useEffect(() => {
    const now = new Date()
    setIsRegistrationOpen(now < registrationDeadline)
    setHoursLeft(Math.floor((registrationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60)))
  }, [registrationDeadline])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddMember = () => {
    setTeamMembers((prev) => [...prev, ""])
  }

  const handleMemberEmailChange = (index: number, email: string) => {
    const updated = [...teamMembers]
    updated[index] = email
    setTeamMembers(updated)
  }

  const handleRemoveMember = (index: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isRegistrationOpen) {
      addToast("error", "Registration has closed")
      return
    }

    if (!consent) {
      addToast("error", "Please accept the terms and conditions")
      return
    }

    if (mode === "team" && !formData.teamName) {
      addToast("error", "Team name is required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/participant/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hackathonId,
          mode,
          memberEmails: mode === "team" ? teamMembers.filter(Boolean) : undefined,
          ...formData,
          consent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        addToast("error", data.error || "Registration failed")
        return
      }

      addToast("success", `Successfully registered for ${hackathonTitle}!`)
      router.refresh()
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
      addToast("error", "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Register for {hackathonTitle}</CardTitle>
          <CardDescription>
            {isRegistrationOpen ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                Registration closes in {hoursLeft} hours
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                Registration has closed
              </div>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="individual" onValueChange={(v: string) => setMode(v as "individual" | "team")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    <Input
                      id="university"
                      value={formData.university}
                      onChange={(e) => handleInputChange("university", e.target.value)}
                      placeholder="MIT"
                    />
                  </div>
                </div>
              </div>

              {/* Education Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Education</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
                    <Input
                      id="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={(e) => handleInputChange("enrollmentNumber", e.target.value)}
                      placeholder="2021CSE001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      value={formData.branch}
                      onChange={(e) => handleInputChange("branch", e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      placeholder="3rd Year"
                    />
                  </div>
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="space-y-4">
                <h3 className="font-semibold">Skills & Experience</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Technical Skills</Label>
                    <Textarea
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => handleInputChange("skills", e.target.value)}
                      placeholder="React, Node.js, Python, etc."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      placeholder="Describe your experience with hackathons and projects"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="font-semibold">Professional Links</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="githubProfile">GitHub Profile</Label>
                    <Input
                      id="githubProfile"
                      type="url"
                      value={formData.githubProfile}
                      onChange={(e) => handleInputChange("githubProfile", e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                    <Input
                      id="linkedinProfile"
                      type="url"
                      value={formData.linkedinProfile}
                      onChange={(e) => handleInputChange("linkedinProfile", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                    <Input
                      id="portfolioUrl"
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              </div>

              {/* Project Idea & Motivation */}
              <div className="space-y-4">
                <h3 className="font-semibold">Project & Motivation</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectIdea">Project Idea</Label>
                    <Textarea
                      id="projectIdea"
                      value={formData.projectIdea}
                      onChange={(e) => handleInputChange("projectIdea", e.target.value)}
                      placeholder="What do you plan to build?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motivation">Motivation</Label>
                    <Textarea
                      id="motivation"
                      value={formData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                      placeholder="Why are you participating in this hackathon?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Team Information */}
              {mode === "team" && (
                <TabsContent value="team" className="space-y-4">
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Details
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="teamName">Team Name *</Label>
                      <Input
                        id="teamName"
                        value={formData.teamName}
                        onChange={(e) => handleInputChange("teamName", e.target.value)}
                        placeholder="Team Awesome"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Invite Team Members
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddMember}
                        >
                          Add Member
                        </Button>
                      </div>

                      {teamMembers.map((email, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => handleMemberEmailChange(index, e.target.value)}
                            placeholder="teammate@example.com"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}

                      {teamMembers.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                          No team members added yet. You can invite them after registration.
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Consent */}
              <div className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked: boolean) => setConsent(!!checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="consent" className="cursor-pointer text-sm leading-relaxed">
                    I agree to the hackathon terms and conditions and consent to the use of my
                    information for hackathon-related communications.
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isRegistrationOpen || loading || !consent}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete Registration
                  </>
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
