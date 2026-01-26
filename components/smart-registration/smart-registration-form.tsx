"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { LogIn, CheckCircle, AlertCircle, Lightbulb, Users, Zap } from "lucide-react"

interface SmartRegistrationFormProps {
  hackathonId: string
  hackathonTitle: string
  isAuthenticated: boolean
  userProfile?: {
    email: string
    name: string
    phone?: string
    university?: string
    skills?: string[]
    githubProfile?: string
    linkedinProfile?: string
  }
}

interface RegistrationFormData {
  fullName: string
  email: string
  phone: string
  university: string
  enrollmentNumber: string
  branch: string
  year: string
  skills: string[]
  experience: string
  githubProfile: string
  linkedinProfile: string
  portfolioUrl: string
  projectIdea: string
  motivation: string
  teamName?: string
  teamMembers?: Array<{ name: string; email: string }>
  mode: "individual" | "team"
  consent: boolean
}

interface SmartSuggestion {
  type: "skill" | "team" | "field" | "improvement"
  title: string
  description: string
  action?: () => void
  importance: "low" | "medium" | "high"
}

export function SmartRegistrationForm({
  hackathonId,
  hackathonTitle,
  isAuthenticated,
  userProfile,
}: SmartRegistrationFormProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<"mode" | "personal" | "skills" | "team" | "review">("mode")
  const [registeredHackathons, setRegisteredHackathons] = useState<number>(0)

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: userProfile?.name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    university: userProfile?.university || "",
    enrollmentNumber: "",
    branch: "",
    year: "",
    skills: userProfile?.skills || [],
    experience: "",
    githubProfile: userProfile?.githubProfile || "",
    linkedinProfile: userProfile?.linkedinProfile || "",
    portfolioUrl: "",
    projectIdea: "",
    motivation: "",
    mode: "individual",
    consent: false,
  })

  // Calculate smart suggestions
  const suggestions = useMemo((): SmartSuggestion[] => {
    const sugg: SmartSuggestion[] = []

    // Skills suggestion
    if (formData.skills.length === 0 && formData.mode === "individual") {
      sugg.push({
        type: "skill",
        title: "Add Your Skills",
        description: "Specifying your skills helps us match you with the right projects",
        importance: "high",
      })
    }

    // Team suggestion if in team mode
    if (formData.mode === "team" && (!formData.teamMembers || formData.teamMembers.length < 2)) {
      sugg.push({
        type: "team",
        title: "Complete Your Team",
        description: "Add team members to strengthen your team composition",
        importance: "high",
      })
    }

    // GitHub/LinkedIn suggestion
    if (!formData.githubProfile && !formData.linkedinProfile) {
      sugg.push({
        type: "field",
        title: "Connect Your Profiles",
        description: "Adding GitHub/LinkedIn profiles strengthens your hackathon profile",
        importance: "medium",
      })
    }

    // Project idea suggestion
    if (!formData.projectIdea && currentStep === "skills") {
      sugg.push({
        type: "improvement",
        title: "Define Your Project Idea",
        description: "A clear project idea shows commitment and increases chances of winning",
        importance: "high",
      })
    }

    return sugg
  }, [formData, currentStep])

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const fields = [
      formData.fullName,
      formData.email,
      formData.phone,
      formData.university,
      formData.skills.length > 0,
      formData.projectIdea,
      formData.motivation,
      formData.consent,
    ]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  }, [formData])

  const handleLoginRedirect = () => {
    sessionStorage.setItem("redirectAfterLogin", `/hackathons/${hackathonId}`)
    router.push("/auth/login")
  }

  const handleFieldChange = (field: keyof RegistrationFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      handleFieldChange("skills", [...formData.skills, skill])
    }
  }

  const handleRemoveSkill = (skill: string) => {
    handleFieldChange(
      "skills",
      formData.skills.filter((s) => s !== skill)
    )
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case "mode":
        return !!formData.mode
      case "personal":
        return !!(formData.fullName && formData.email && formData.phone && formData.university)
      case "skills":
        return formData.skills.length > 0 && !!formData.projectIdea
      case "team":
        return formData.mode === "individual" || (formData.teamMembers && formData.teamMembers.length > 0) === true
      case "review":
        return formData.consent
      default:
        return false
    }
  }

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      addToast("error", "Please complete all required fields")
      return
    }

    const steps: Array<"mode" | "personal" | "skills" | "team" | "review"> = [
      "mode",
      "personal",
      "skills",
      "team",
      "review",
    ]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handlePreviousStep = () => {
    const steps: Array<"mode" | "personal" | "skills" | "team" | "review"> = [
      "mode",
      "personal",
      "skills",
      "team",
      "review",
    ]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCurrentStep()) {
      addToast("error", "Please complete all required fields")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: formData.mode,
          consent: formData.consent,
          teamName: formData.mode === "team" ? formData.teamName : undefined,
          memberEmails: formData.mode === "team" ? formData.teamMembers?.map((m) => m.email) : undefined,
          formData: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            university: formData.university,
            enrollmentNumber: formData.enrollmentNumber,
            branch: formData.branch,
            year: formData.year,
            skills: formData.skills.join(","),
            experience: formData.experience,
            githubProfile: formData.githubProfile,
            linkedinProfile: formData.linkedinProfile,
            portfolioUrl: formData.portfolioUrl,
            projectIdea: formData.projectIdea,
            motivation: formData.motivation,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          addToast("error", "Please login to register for this hackathon")
          handleLoginRedirect()
          return
        }
        addToast("error", data.error || "Registration failed")
        return
      }

      addToast("success", "Successfully registered for the hackathon!")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Registration error:", error)
      addToast("error", "Unable to register. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Button onClick={handleLoginRedirect} className="w-full">
        <LogIn className="mr-2 h-4 w-4" />
        Login to Register
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Smart Register</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Smart Registration for {hackathonTitle}</DialogTitle>
          <DialogDescription>
            Complete registration with intelligent suggestions and guidance
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          {/* Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile Completion</span>
                <span className="font-semibold">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mode Selection Step */}
              {currentStep === "mode" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Choose Registration Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Card
                        className={`cursor-pointer transition-all ${
                          formData.mode === "individual" ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleFieldChange("mode", "individual")}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4" /> Individual
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Register solo for the hackathon</p>
                        </CardContent>
                      </Card>
                      <Card
                        className={`cursor-pointer transition-all ${
                          formData.mode === "team" ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleFieldChange("mode", "team")}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" /> Team
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">Register with a team (2-4 members)</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Info Step */}
              {currentStep === "personal" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleFieldChange("fullName", e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      placeholder="your@email.com"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      placeholder="+91 9999999999"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="university">University/College *</Label>
                    <Input
                      id="university"
                      value={formData.university}
                      onChange={(e) => handleFieldChange("university", e.target.value)}
                      placeholder="Your institution"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="branch">Branch/Major</Label>
                      <Input
                        id="branch"
                        value={formData.branch}
                        onChange={(e) => handleFieldChange("branch", e.target.value)}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Select value={formData.year} onValueChange={(value: string) => handleFieldChange("year", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">First Year</SelectItem>
                          <SelectItem value="2">Second Year</SelectItem>
                          <SelectItem value="3">Third Year</SelectItem>
                          <SelectItem value="4">Fourth Year</SelectItem>
                          <SelectItem value="postgrad">Post Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills & Project Step */}
              {currentStep === "skills" && (
                <div className="space-y-4">
                  <div>
                    <Label>Your Skills *</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="cursor-pointer">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="skillInput"
                        placeholder="Type a skill and press Add"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            const input = e.currentTarget as HTMLInputElement
                            handleAddSkill(input.value)
                            input.value = ""
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById("skillInput") as HTMLInputElement
                          handleAddSkill(input.value)
                          input.value = ""
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value: string) => handleFieldChange("experience", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="projectIdea">Project Idea *</Label>
                    <Textarea
                      id="projectIdea"
                      value={formData.projectIdea}
                      onChange={(e) => handleFieldChange("projectIdea", e.target.value)}
                      placeholder="Describe your project idea for the hackathon"
                      required
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="motivation">Motivation & Goals</Label>
                    <Textarea
                      id="motivation"
                      value={formData.motivation}
                      onChange={(e) => handleFieldChange("motivation", e.target.value)}
                      placeholder="Why are you participating? What do you hope to achieve?"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Team Management Step */}
              {currentStep === "team" && (
                <div className="space-y-4">
                  {formData.mode === "team" ? (
                    <div>
                      <Label htmlFor="teamName">Team Name</Label>
                      <Input
                        id="teamName"
                        value={formData.teamName || ""}
                        onChange={(e) => handleFieldChange("teamName", e.target.value)}
                        placeholder="Your awesome team name"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-generate</p>
                    </div>
                  ) : (
                    <Card className="bg-muted">
                      <CardContent className="pt-6">
                        <p className="text-sm">You're registered as an individual participant</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Review Step */}
              {currentStep === "review" && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Review Your Registration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground">Name</span>
                          <p className="font-medium">{formData.fullName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email</span>
                          <p className="font-medium">{formData.email}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">University</span>
                          <p className="font-medium">{formData.university}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mode</span>
                          <p className="font-medium capitalize">{formData.mode}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked: boolean) => handleFieldChange("consent", checked)}
                    />
                    <Label htmlFor="consent" className="text-sm cursor-pointer">
                      I agree to the hackathon terms and conditions and understand that my data will be used for
                      event management purposes
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === "mode"}
                >
                  Previous
                </Button>

                {currentStep !== "review" ? (
                  <Button type="button" onClick={handleNextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Complete Registration"}
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Suggestions Sidebar */}
          <div className="col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Smart Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-l-4 ${
                        suggestion.importance === "high"
                          ? "border-l-destructive bg-destructive/5"
                          : "border-l-yellow-500 bg-yellow-500/5"
                      }`}
                    >
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    All looking good!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
