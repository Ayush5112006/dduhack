"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileUp, CheckCircle2, AlertCircle, Loader2, Link as LinkIcon, Github } from "lucide-react"
import { isSubmissionLocked } from "@/lib/submission-utils"
import { SubmissionLockStatus } from "./submission-lock-status"

interface SubmissionFormProps {
  hackathonId: string
  hackathonTitle: string
  isAuthenticated: boolean
  isRegistered: boolean
  teamMode?: boolean
  teamName?: string
  teamId?: string
  teamMembers?: number
  minTeamSize?: number
  maxTeamSize?: number
  hackathonEndDate?: Date | string
}

interface SubmissionData {
  title: string
  description: string
  technologiesUsed: string[]
  gitHubLink: string
  liveLink: string
  deploymentLink: string
  video: string
  documentation: string
  teamContributions?: string
  additionalNotes: string
  files: File[]
}

const acceptedFileTypes = {
  "image/*": [".jpeg", ".jpg", ".png", ".gif"],
  "application/pdf": [".pdf"],
  ".zip": [".zip"],
  ".rar": [".rar"],
}

export function SubmissionForm({
  hackathonId,
  hackathonTitle,
  isAuthenticated,
  isRegistered,
  teamMode = false,
  teamName = "",
  teamId = "",
  teamMembers = 0,
  minTeamSize = 2,
  maxTeamSize = 5,
  hackathonEndDate,
}: SubmissionFormProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [teamTooSmall, setTeamTooSmall] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if submission is locked based on deadline
  useEffect(() => {
    if (hackathonEndDate) {
      const now = new Date()
      const endDate = new Date(hackathonEndDate)
      setIsLocked(now > endDate)
    }
  }, [hackathonEndDate, open])

  // Check if team has minimum members
  useEffect(() => {
    if (teamMode && teamMembers > 0) {
      setTeamTooSmall(teamMembers < minTeamSize)
    }
  }, [teamMode, teamMembers, minTeamSize])

  const [formData, setFormData] = useState<SubmissionData>({
    title: "",
    description: "",
    technologiesUsed: [],
    gitHubLink: "",
    liveLink: "",
    deploymentLink: "",
    video: "",
    documentation: "",
    teamContributions: "",
    additionalNotes: "",
    files: [],
  })

  const [currentTech, setCurrentTech] = useState("")

  const handleAddTechnology = (tech: string) => {
    const trimmed = tech.trim()
    if (trimmed && !formData.technologiesUsed.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        technologiesUsed: [...prev.technologiesUsed, trimmed],
      }))
      setCurrentTech("")
    }
  }

  const handleRemoveTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologiesUsed: prev.technologiesUsed.filter((t) => t !== tech),
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    // Check file size limit (100MB total)
    if (totalSize > 100 * 1024 * 1024) {
      addToast("error", "Total file size cannot exceed 100MB")
      return
    }

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }))
  }

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      addToast("error", "Project title is required")
      return false
    }
    if (!formData.description.trim()) {
      addToast("error", "Project description is required")
      return false
    }
    if (formData.technologiesUsed.length === 0) {
      addToast("error", "Add at least one technology")
      return false
    }
    if (!formData.gitHubLink.trim() && !formData.liveLink.trim()) {
      addToast("error", "Provide at least GitHub link or live link")
      return false
    }

    // Team-specific validation
    if (teamMode && teamTooSmall) {
      addToast("error", `Team must have at least ${minTeamSize} members`)
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
    setUploadProgress(0)

    try {
      const formDataWithFiles = new FormData()
      
      // Add form fields
      formDataWithFiles.append("hackathonId", hackathonId)
      if (teamMode && teamId) {
        formDataWithFiles.append("teamId", teamId)
      }
      formDataWithFiles.append("title", formData.title)
      formDataWithFiles.append("description", formData.description)
      formDataWithFiles.append("technologiesUsed", JSON.stringify(formData.technologiesUsed))
      formDataWithFiles.append("gitHubLink", formData.gitHubLink)
      formDataWithFiles.append("liveLink", formData.liveLink)
      formDataWithFiles.append("deploymentLink", formData.deploymentLink)
      formDataWithFiles.append("video", formData.video)
      formDataWithFiles.append("documentation", formData.documentation)
      formDataWithFiles.append("teamContributions", formData.teamContributions || "")
      formDataWithFiles.append("additionalNotes", formData.additionalNotes)

      // Add files
      formData.files.forEach((file) => {
        formDataWithFiles.append("files", file)
      })

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setUploadProgress(percentComplete)
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status === 201 || xhr.status === 200) {
          addToast("success", "Project submitted successfully!")
          setOpen(false)
          setFormData({
            title: "",
            description: "",
            technologiesUsed: [],
            gitHubLink: "",
            liveLink: "",
            deploymentLink: "",
            video: "",
            documentation: "",
            teamContributions: "",
            additionalNotes: "",
            files: [],
          })
          router.refresh()
        } else {
          const error = JSON.parse(xhr.responseText)
          addToast("error", error.error || "Submission failed")
        }
        setLoading(false)
        setUploadProgress(0)
      })

      xhr.addEventListener("error", () => {
        addToast("error", "Upload failed. Please try again.")
        setLoading(false)
        setUploadProgress(0)
      })

      xhr.open("POST", `/api/hackathons/${hackathonId}/submissions`)
      xhr.send(formDataWithFiles)
    } catch (error) {
      console.error("Submission error:", error)
      addToast("error", "Unable to submit. Please try again.")
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Button disabled className="w-full opacity-50">
        <Upload className="mr-2 h-4 w-4" />
        Login to Submit
      </Button>
    )
  }

  if (!isRegistered) {
    return (
      <Button disabled className="w-full opacity-50">
        <Upload className="mr-2 h-4 w-4" />
        Register First to Submit
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={isLocked || teamTooSmall}>
          <Upload className="mr-2 h-4 w-4" />
          {isLocked ? "Submission Deadline Passed" : teamTooSmall ? `Team Needs ${minTeamSize - teamMembers} More Members` : "Submit Project"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Project for {hackathonTitle}</DialogTitle>
          <DialogDescription>
            {teamMode ? `Submit as ${teamName} (${teamMembers}/${maxTeamSize} members)` : "Submit your individual project"}
          </DialogDescription>
        </DialogHeader>

        {isLocked && (
          <SubmissionLockStatus
            locked={true}
            lockedReason="admin"
            deadlineText="This hackathon has reached its submission deadline. No new submissions can be made."
          />
        )}

        {teamMode && teamTooSmall && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900">Team Too Small</h3>
                  <p className="text-sm text-orange-800 mt-1">
                    Your team needs at least {minTeamSize} members to submit. Currently: {teamMembers}/{maxTeamSize}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLocked && !teamTooSmall ? (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div>
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Your awesome project name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project, its features, and how it works"
              rows={5}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Technologies */}
          <div>
            <Label>Technologies Used *</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.technologiesUsed.map((tech) => (
                <Badge key={tech} variant="secondary" className="cursor-pointer">
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnology(tech)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={currentTech}
                onChange={(e) => setCurrentTech(e.target.value)}
                placeholder="e.g., React, Node.js, MongoDB"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTechnology(currentTech)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddTechnology(currentTech)}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Project Links
            </h3>

            <div>
              <Label htmlFor="gitHub" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Repository Link *
              </Label>
              <Input
                id="gitHub"
                type="url"
                value={formData.gitHubLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, gitHubLink: e.target.value }))}
                placeholder="https://github.com/username/project"
              />
            </div>

            <div>
              <Label htmlFor="liveLink">Live Link / Demo</Label>
              <Input
                id="liveLink"
                type="url"
                value={formData.liveLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, liveLink: e.target.value }))}
                placeholder="https://yourproject.com"
              />
            </div>

            <div>
              <Label htmlFor="deployment">Deployment Link</Label>
              <Input
                id="deployment"
                type="url"
                value={formData.deploymentLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, deploymentLink: e.target.value }))}
                placeholder="https://vercel.com/... or similar"
              />
            </div>

            <div>
              <Label htmlFor="video">Video Demo Link</Label>
              <Input
                id="video"
                type="url"
                value={formData.video}
                onChange={(e) => setFormData((prev) => ({ ...prev, video: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label htmlFor="documentation">Documentation Link</Label>
              <Input
                id="documentation"
                type="url"
                value={formData.documentation}
                onChange={(e) => setFormData((prev) => ({ ...prev, documentation: e.target.value }))}
                placeholder="https://docs.yourproject.com"
              />
            </div>
          </div>

          {/* Team Contributions */}
          {teamMode && (
            <div>
              <Label htmlFor="teamContributions">Team Member Contributions</Label>
              <Textarea
                id="teamContributions"
                value={formData.teamContributions}
                onChange={(e) => setFormData((prev) => ({ ...prev, teamContributions: e.target.value }))}
                placeholder="Describe each team member's contribution..."
                rows={3}
              />
            </div>
          )}

          {/* File Upload */}
          <div>
            <Label>Project Files (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">ZIP, RAR, PDF, Images (max 100MB total)</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                accept={Object.values(acceptedFileTypes).flat().join(",")}
                className="hidden"
              />
            </div>

            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                    <span className="truncate">{file.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)}MB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any additional information you'd like to share..."
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Project
                </>
              )}
            </Button>
          </div>
        </form>
        ) : (
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">{teamTooSmall ? "Team Incomplete" : "Submission Closed"}</h3>
            <p className="text-muted-foreground">
              {teamTooSmall 
                ? `Your team needs at least ${minTeamSize} members to submit. Currently: ${teamMembers}/${maxTeamSize}`
                : "This hackathon has reached its submission deadline. No new submissions can be made."}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
