"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/toast-provider"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Users, User, LogIn } from "lucide-react"

interface StudentRegistrationFormProps {
  hackathonId: string
  hackathonTitle: string
  isRegistered?: boolean
  disabled?: boolean
  isAuthenticated?: boolean
}

export function StudentRegistrationForm({
  hackathonId,
  hackathonTitle,
  isRegistered = false,
  disabled = false,
  isAuthenticated = false,
}: StudentRegistrationFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"individual" | "team">("individual")
  const { addToast } = useToast()
  const router = useRouter()

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Store the current page to redirect back after login
    if (typeof window !== "undefined") {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname)
    }
    router.push("/auth/login")
  }

  // Check if user clicked register without authentication
  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      handleLoginRedirect()
      return
    }
    setOpen(true)
  }

  // Form state
  const [formData, setFormData] = useState({
    // Student Information
    fullName: "",
    email: "",
    phone: "",
    university: "",
    enrollmentNumber: "",
    branch: "",
    year: "",
    
    // Team Information (if applicable)
    teamName: "",
    teamMembers: [] as { name: string; email: string; enrollmentNumber: string }[],
    
    // Additional Information
    skills: "",
    experience: "",
    githubProfile: "",
    linkedinProfile: "",
    portfolioUrl: "",
    
    // Project Information
    projectIdea: "",
    motivation: "",
    
    // Consent
    consent: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTeamMember = () => {
    if (formData.teamMembers.length < 4) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [
          ...prev.teamMembers,
          { name: "", email: "", enrollmentNumber: "" },
        ],
      }))
    }
  }

  const removeTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }))
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.teamMembers]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, teamMembers: updated }
    })
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      addToast("error", "Please enter your full name")
      return false
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      addToast("error", "Please enter a valid email")
      return false
    }
    if (!formData.phone.trim()) {
      addToast("error", "Please enter your phone number")
      return false
    }
    if (!formData.university.trim()) {
      addToast("error", "Please enter your university name")
      return false
    }
    if (!formData.enrollmentNumber.trim()) {
      addToast("error", "Please enter your enrollment number")
      return false
    }
    if (!formData.branch.trim()) {
      addToast("error", "Please enter your branch")
      return false
    }
    if (!formData.year.trim()) {
      addToast("error", "Please enter your year of study")
      return false
    }
    
    if (mode === "team") {
      if (!formData.teamName.trim()) {
        addToast("error", "Please enter team name")
        return false
      }
      if (formData.teamMembers.length === 0) {
        addToast("error", "Please add at least one team member")
        return false
      }
      for (let i = 0; i < formData.teamMembers.length; i++) {
        const member = formData.teamMembers[i]
        if (!member.name.trim() || !member.email.trim() || !member.enrollmentNumber.trim()) {
          addToast("error", `Please complete all fields for team member ${i + 1}`)
          return false
        }
      }
    }
    
    if (!formData.consent) {
      addToast("error", "Please accept the terms and conditions")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/hackathons/${hackathonId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          consent: formData.consent,
          teamName: mode === "team" ? formData.teamName : undefined,
          memberEmails: mode === "team" 
            ? formData.teamMembers.map(m => m.email) 
            : undefined,
          formData: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            university: formData.university,
            enrollmentNumber: formData.enrollmentNumber,
            branch: formData.branch,
            year: formData.year,
            skills: formData.skills,
            experience: formData.experience,
            githubProfile: formData.githubProfile,
            linkedinProfile: formData.linkedinProfile,
            portfolioUrl: formData.portfolioUrl,
            projectIdea: formData.projectIdea,
            motivation: formData.motivation,
            teamMembers: mode === "team" ? formData.teamMembers : undefined,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // If unauthorized, redirect to login
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

  // Show login button if not authenticated
  if (!isAuthenticated) {
    return (
      <Button onClick={handleLoginRedirect} className="w-full">
        <LogIn className="mr-2 h-4 w-4" />
        Login to Register
      </Button>
    )
  }

  if (isRegistered) {
    return (
      <Button disabled className="w-full">
        Already Registered
      </Button>
    )
  }

  if (disabled) {
    return (
      <Button disabled className="w-full">
        Registration Closed
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Register for Hackathon</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register for {hackathonTitle}</DialogTitle>
          <DialogDescription>
            Fill in your details to register for this hackathon. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Registration Mode */}
          <div className="space-y-3">
            <Label>Registration Type *</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={mode === "individual" ? "default" : "outline"}
                onClick={() => setMode("individual")}
                className="flex-1"
              >
                <User className="mr-2 h-4 w-4" />
                Individual
              </Button>
              <Button
                type="button"
                variant={mode === "team" ? "default" : "outline"}
                onClick={() => setMode("team")}
                className="flex-1"
              >
                <Users className="mr-2 h-4 w-4" />
                Team
              </Button>
            </div>
          </div>

          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Student Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@university.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University *</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                  placeholder="Your University Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollmentNumber">Enrollment Number *</Label>
                <Input
                  id="enrollmentNumber"
                  value={formData.enrollmentNumber}
                  onChange={(e) => handleInputChange("enrollmentNumber", e.target.value)}
                  placeholder="EN12345678"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch/Department *</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => handleInputChange("branch", e.target.value)}
                  placeholder="Computer Science"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year of Study *</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  placeholder="2nd Year"
                  required
                />
              </div>
            </div>
          </div>

          {/* Team Information */}
          {mode === "team" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Team Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  value={formData.teamName}
                  onChange={(e) => handleInputChange("teamName", e.target.value)}
                  placeholder="Code Warriors"
                  required={mode === "team"}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Team Members (Maximum 4)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTeamMember}
                    disabled={formData.teamMembers.length >= 4}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Member
                  </Button>
                </div>

                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Member {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <Input
                        value={member.name}
                        onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                        placeholder="Member Name"
                        required
                      />
                      <Input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                        placeholder="Member Email"
                        required
                      />
                      <Input
                        value={member.enrollmentNumber}
                        onChange={(e) => updateTeamMember(index, "enrollmentNumber", e.target.value)}
                        placeholder="Enrollment Number"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills & Experience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Skills & Experience</h3>
            
            <div className="space-y-2">
              <Label htmlFor="skills">Technical Skills</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                placeholder="e.g., JavaScript, Python, React, Node.js"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Hackathon/Project Experience</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                placeholder="Describe your previous hackathon or project experience"
                rows={3}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Profiles (Optional)</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="githubProfile">GitHub Profile</Label>
                <Input
                  id="githubProfile"
                  value={formData.githubProfile}
                  onChange={(e) => handleInputChange("githubProfile", e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                <Input
                  id="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={(e) => handleInputChange("linkedinProfile", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="portfolioUrl">Portfolio Website</Label>
                <Input
                  id="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Project Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Information (Optional)</h3>
            
            <div className="space-y-2">
              <Label htmlFor="projectIdea">Project Idea</Label>
              <Textarea
                id="projectIdea"
                value={formData.projectIdea}
                onChange={(e) => handleInputChange("projectIdea", e.target.value)}
                placeholder="Briefly describe your project idea for this hackathon"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">Why do you want to participate?</Label>
              <Textarea
                id="motivation"
                value={formData.motivation}
                onChange={(e) => handleInputChange("motivation", e.target.value)}
                placeholder="Tell us your motivation for joining this hackathon"
                rows={3}
              />
            </div>
          </div>

          {/* Consent */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={formData.consent}
              onCheckedChange={(checked) => handleInputChange("consent", checked)}
              required
            />
            <Label
              htmlFor="consent"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I agree to the terms and conditions and confirm that all information provided is accurate. I understand that providing false information may result in disqualification. *
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Submitting..." : "Submit Registration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
