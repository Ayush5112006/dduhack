"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

interface RegistrationFormData {
  // 1. Participant Basic Details
  fullName: string
  profilePhoto?: File
  gender?: string
  dateOfBirth?: string
  email: string
  mobileNumber: string
  alternateNumber?: string

  // 2. Education Details
  collegeName: string
  degree: string
  branch: string
  yearOfStudy: string
  studentId?: string

  // 3. Technical Information
  primarySkills: string[]
  otherSkills?: string
  programmingLanguages: string
  experienceLevel: string
  githubProfile?: string
  linkedinProfile?: string
  portfolio?: string

  // 4. Team Details
  participationType: "solo" | "team"
  teamName?: string
  teamLeaderName?: string
  teamLeaderEmail?: string
  teamLeaderPhone?: string
  teamMemberCount?: number
  teamMembers?: Array<{
    name: string
    email: string
    college: string
  }>

  // 5. Project Information
  hasIdea: boolean
  problemDomain?: string
  ideaDescription?: string

  // 6. Hackathon Logistics
  tshirtSize: string
  foodPreference: string
  accommodationRequired: boolean
  laptopRequired: boolean

  // 7. Consent & Agreements
  agreeToRules: boolean
  allowPhotosVideo: boolean
  confirmInfo: boolean

  // 8. Optional Extra
  heardAbout?: string
  previousExperience?: string
  joinReason?: string
  resume?: File
}

interface MultiStepRegistrationFormProps {
  hackathonId: string
  hackathonTitle: string
  onSubmit: (data: RegistrationFormData) => Promise<void>
}

const SKILLS = [
  "Web Development",
  "App Development",
  "AI/ML",
  "Data Science",
  "Cybersecurity",
  "UI/UX",
  "Blockchain",
  "IoT",
  "Game Dev",
]

const DEGREES = ["B.Tech", "BCA", "MCA", "Diploma", "B.Sc", "M.Sc", "Other"]
const YEARS = ["1st", "2nd", "3rd", "Final", "Passout"]
const PROBLEM_DOMAINS = ["Health", "Education", "FinTech", "Environment", "Smart Cities", "Open Innovation"]
const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"]
const FOOD_PREFS = ["Veg", "Non-Veg", "Vegan"]

export function MultiStepRegistrationForm({
  hackathonId,
  hackathonTitle,
  onSubmit,
}: MultiStepRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: "",
    email: "",
    mobileNumber: "",
    collegeName: "",
    degree: "",
    branch: "",
    yearOfStudy: "",
    primarySkills: [],
    programmingLanguages: "",
    experienceLevel: "Intermediate",
    participationType: "solo",
    hasIdea: false,
    tshirtSize: "M",
    foodPreference: "Veg",
    accommodationRequired: false,
    laptopRequired: false,
    agreeToRules: false,
    allowPhotosVideo: false,
    confirmInfo: false,
  })

  const steps = [
    { title: "Basic Details", description: "Your personal information" },
    { title: "Education", description: "Academic background" },
    { title: "Technical Info", description: "Skills and experience" },
    { title: "Team Details", description: "Participation mode and team info" },
    { title: "Project Ideas", description: "Your project information" },
    { title: "Logistics", description: "T-shirt, food, accommodation" },
    { title: "Consent", description: "Agreements and confirmations" },
    { title: "Additional", description: "Extra information" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      primarySkills: prev.primarySkills.includes(skill)
        ? prev.primarySkills.filter(s => s !== skill)
        : [...prev.primarySkills, skill],
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file,
      }))
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  index < currentStep
                    ? "bg-emerald-500 text-white"
                    : index === currentStep
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    index < currentStep ? "bg-emerald-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">{steps[currentStep].title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{steps[currentStep].description}</p>
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Basic Details */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="profilePhoto">Profile Photo (optional)</Label>
                <Input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "profilePhoto")}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender (optional)</Label>
                  <Select value={formData.gender || ""} onValueChange={(value) => handleSelectChange("gender", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth (optional)</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="alternateNumber">Alternate Number (optional)</Label>
                  <Input
                    id="alternateNumber"
                    name="alternateNumber"
                    value={formData.alternateNumber || ""}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="collegeName">College / University Name *</Label>
                <Input
                  id="collegeName"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  placeholder="Enter college name"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree *</Label>
                  <Select value={formData.degree} onValueChange={(value) => handleSelectChange("degree", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREES.map(degree => (
                        <SelectItem key={degree} value={degree}>
                          {degree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="branch">Branch / Stream *</Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Science"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearOfStudy">Year of Study *</Label>
                  <Select value={formData.yearOfStudy} onValueChange={(value) => handleSelectChange("yearOfStudy", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(year => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="studentId">Student ID / Enrollment (optional)</Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    value={formData.studentId || ""}
                    onChange={handleInputChange}
                    placeholder="Your student ID"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Technical Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Primary Skills *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {SKILLS.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={formData.primarySkills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label htmlFor={skill} className="cursor-pointer">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="otherSkills">Other Skills (optional)</Label>
                <Input
                  id="otherSkills"
                  name="otherSkills"
                  value={formData.otherSkills || ""}
                  onChange={handleInputChange}
                  placeholder="List other skills"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="programmingLanguages">Programming Languages Known *</Label>
                <Input
                  id="programmingLanguages"
                  name="programmingLanguages"
                  value={formData.programmingLanguages}
                  onChange={handleInputChange}
                  placeholder="e.g., Python, JavaScript, Java"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="experienceLevel">Experience Level *</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => handleSelectChange("experienceLevel", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="githubProfile">GitHub Profile (optional)</Label>
                <Input
                  id="githubProfile"
                  name="githubProfile"
                  value={formData.githubProfile || ""}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="linkedinProfile">LinkedIn Profile (optional)</Label>
                <Input
                  id="linkedinProfile"
                  name="linkedinProfile"
                  value={formData.linkedinProfile || ""}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="portfolio">Portfolio / Personal Website (optional)</Label>
                <Input
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio || ""}
                  onChange={handleInputChange}
                  placeholder="https://yourportfolio.com"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 4: Team Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Participation Type *</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="solo"
                      checked={formData.participationType === "solo"}
                      onCheckedChange={() => handleSelectChange("participationType", "solo")}
                    />
                    <Label htmlFor="solo" className="cursor-pointer">Solo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="team"
                      checked={formData.participationType === "team"}
                      onCheckedChange={() => handleSelectChange("participationType", "team")}
                    />
                    <Label htmlFor="team" className="cursor-pointer">Team</Label>
                  </div>
                </div>
              </div>

              {formData.participationType === "team" && (
                <>
                  <div>
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      name="teamName"
                      value={formData.teamName || ""}
                      onChange={handleInputChange}
                      placeholder="Enter team name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="teamMemberCount">Number of Team Members *</Label>
                    <Input
                      id="teamMemberCount"
                      name="teamMemberCount"
                      type="number"
                      min="2"
                      max="5"
                      value={formData.teamMemberCount || ""}
                      onChange={handleInputChange}
                      placeholder="2-5"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="teamLeaderName">Team Leader Name *</Label>
                    <Input
                      id="teamLeaderName"
                      name="teamLeaderName"
                      value={formData.teamLeaderName || ""}
                      onChange={handleInputChange}
                      placeholder="Leader's full name"
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teamLeaderEmail">Team Leader Email *</Label>
                      <Input
                        id="teamLeaderEmail"
                        name="teamLeaderEmail"
                        type="email"
                        value={formData.teamLeaderEmail || ""}
                        onChange={handleInputChange}
                        placeholder="leader@email.com"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="teamLeaderPhone">Team Leader Phone *</Label>
                      <Input
                        id="teamLeaderPhone"
                        name="teamLeaderPhone"
                        value={formData.teamLeaderPhone || ""}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Project Ideas */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label>Do you already have an idea? *</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasIdea-yes"
                      checked={formData.hasIdea}
                      onCheckedChange={() => setFormData(prev => ({ ...prev, hasIdea: true }))}
                    />
                    <Label htmlFor="hasIdea-yes" className="cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasIdea-no"
                      checked={!formData.hasIdea}
                      onCheckedChange={() => setFormData(prev => ({ ...prev, hasIdea: false }))}
                    />
                    <Label htmlFor="hasIdea-no" className="cursor-pointer">No</Label>
                  </div>
                </div>
              </div>

              {formData.hasIdea && (
                <>
                  <div>
                    <Label htmlFor="problemDomain">Problem Domain *</Label>
                    <Select value={formData.problemDomain || ""} onValueChange={(value) => handleSelectChange("problemDomain", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROBLEM_DOMAINS.map(domain => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ideaDescription">Idea Description (100-200 words) *</Label>
                    <Textarea
                      id="ideaDescription"
                      name="ideaDescription"
                      value={formData.ideaDescription || ""}
                      onChange={handleInputChange}
                      placeholder="Describe your project idea..."
                      className="mt-2 min-h-24"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 6: Logistics */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tshirtSize">T-shirt Size *</Label>
                  <Select value={formData.tshirtSize} onValueChange={(value) => handleSelectChange("tshirtSize", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {TSHIRT_SIZES.map(size => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="foodPreference">Food Preference *</Label>
                  <Select value={formData.foodPreference} onValueChange={(value) => handleSelectChange("foodPreference", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOOD_PREFS.map(pref => (
                        <SelectItem key={pref} value={pref}>
                          {pref}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accommodationRequired"
                    name="accommodationRequired"
                    checked={formData.accommodationRequired}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, accommodationRequired: checked as boolean }))
                    }
                  />
                  <Label htmlFor="accommodationRequired" className="cursor-pointer">
                    Accommodation Required?
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="laptopRequired"
                    name="laptopRequired"
                    checked={formData.laptopRequired}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, laptopRequired: checked as boolean }))
                    }
                  />
                  <Label htmlFor="laptopRequired" className="cursor-pointer">
                    Laptop Required?
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Consent */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-600">
                  Please review and agree to the following terms before proceeding.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToRules"
                    name="agreeToRules"
                    checked={formData.agreeToRules}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, agreeToRules: checked as boolean }))
                    }
                  />
                  <Label htmlFor="agreeToRules" className="cursor-pointer text-sm leading-relaxed">
                    I agree to the Hackathon Rules & Code of Conduct
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="allowPhotosVideo"
                    name="allowPhotosVideo"
                    checked={formData.allowPhotosVideo}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, allowPhotosVideo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="allowPhotosVideo" className="cursor-pointer text-sm leading-relaxed">
                    I allow organizers to use photos/videos for promotion
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="confirmInfo"
                    name="confirmInfo"
                    checked={formData.confirmInfo}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, confirmInfo: checked as boolean }))
                    }
                  />
                  <Label htmlFor="confirmInfo" className="cursor-pointer text-sm leading-relaxed">
                    I confirm the information provided is correct and complete
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Additional */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="heardAbout">How did you hear about this hackathon? (optional)</Label>
                <Input
                  id="heardAbout"
                  name="heardAbout"
                  value={formData.heardAbout || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Friend, Social Media, University"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="previousExperience">Previous Hackathon Experience? (optional)</Label>
                <Textarea
                  id="previousExperience"
                  name="previousExperience"
                  value={formData.previousExperience || ""}
                  onChange={handleInputChange}
                  placeholder="Describe your previous hackathon experiences..."
                  className="mt-2 min-h-20"
                />
              </div>

              <div>
                <Label htmlFor="joinReason">Why do you want to join? (optional)</Label>
                <Textarea
                  id="joinReason"
                  name="joinReason"
                  value={formData.joinReason || ""}
                  onChange={handleInputChange}
                  placeholder="Tell us why you're interested in this hackathon..."
                  className="mt-2 min-h-20"
                />
              </div>

              <div>
                <Label htmlFor="resume">Resume Upload (PDF, optional)</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "resume")}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={!formData.agreeToRules || !formData.allowPhotosVideo || !formData.confirmInfo || isLoading}
            className="gap-2"
          >
            {isLoading ? "Submitting..." : "Submit Registration"}
            <Check className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
