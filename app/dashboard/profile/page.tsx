"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Trophy, Award, FileText, MapPin, Globe, Github, Linkedin, Twitter, Edit2, Save, X } from "lucide-react"
import { useToast } from "@/components/toast-provider"

type Profile = {
  avatar?: string
  bio?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  twitter?: string
  skills?: string[]
  interests?: string[]
  totalHackathons: number
  totalSubmissions: number
  wins: number
}

type User = {
  name: string
  email: string
  role: string
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<Partial<Profile>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setUser(data.user)
        setFormData(data.profile)
      }
    } catch (error) {
      console.error("Failed to load profile", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2_000_000) {
      addToast("error", "Image must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatar: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setIsEditing(false)
        addToast("success", "Profile updated successfully!")
      } else {
        addToast("error", "Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to save profile", error)
      addToast("error", "Failed to update profile")
    }
  }

  const handleCancel = () => {
    setFormData(profile || {})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar type="participant" />
        <main className="ml-64 p-8">
          <div className="text-center py-12">Loading profile...</div>
        </main>
      </div>
    )
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar type="participant" />
        <main className="ml-64 p-8">
          <div className="text-center py-12">Profile not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="px-4 py-6 lg:ml-64 lg:p-8 max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your profile information
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Profile Image</Label>
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary overflow-hidden">
                          {formData.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={formData.avatar} alt="avatar preview" className="h-full w-full object-cover" />
                          ) : (
                            (user.name || user.email).charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Input type="file" accept="image/*" onChange={handleAvatarFile} />
                          <p className="text-xs text-muted-foreground">JPEG/PNG under 2MB. Stored as a data URL.</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <Label>Bio</Label>
                        <textarea
                          name="bio"
                          value={formData.bio || ""}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-md border border-border bg-background p-2 text-foreground"
                          rows={4}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="location"
                            value={formData.location || ""}
                            onChange={handleInputChange}
                            className="pl-9"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="website"
                            value={formData.website || ""}
                            onChange={handleInputChange}
                            className="pl-9"
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>GitHub</Label>
                        <div className="relative">
                          <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="github"
                            value={formData.github || ""}
                            onChange={handleInputChange}
                            className="pl-9"
                            placeholder="github.com/username"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>LinkedIn</Label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="linkedin"
                            value={formData.linkedin || ""}
                            onChange={handleInputChange}
                            className="pl-9"
                            placeholder="linkedin.com/in/username"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Twitter</Label>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="twitter"
                            value={formData.twitter || ""}
                            onChange={handleInputChange}
                            className="pl-9"
                            placeholder="twitter.com/username"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="gap-2">
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary overflow-hidden">
                        {profile.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatar} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          (user.name || user.email).charAt(0).toUpperCase()
                        )}
                      </div>
                      <h3 className="font-semibold mb-2">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <Badge className="mt-2" variant="secondary">{user.role}</Badge>
                    </div>
                    {profile.bio && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">{profile.bio}</p>
                      </div>
                    )}
                    <div className="pt-4 border-t space-y-2">
                      {profile.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.website}
                          </a>
                        </div>
                      )}
                      {profile.github && (
                        <div className="flex items-center gap-2 text-sm">
                          <Github className="h-4 w-4 text-muted-foreground" />
                          <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.github}
                          </a>
                        </div>
                      )}
                      {profile.linkedin && (
                        <div className="flex items-center gap-2 text-sm">
                          <Linkedin className="h-4 w-4 text-muted-foreground" />
                          <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.linkedin}
                          </a>
                        </div>
                      )}
                      {profile.twitter && (
                        <div className="flex items-center gap-2 text-sm">
                          <Twitter className="h-4 w-4 text-muted-foreground" />
                          <a href={`https://${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.twitter}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.totalHackathons}</div>
                  <div className="text-sm text-muted-foreground">Hackathons Participated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.totalSubmissions}</div>
                  <div className="text-sm text-muted-foreground">Projects Submitted</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{profile.wins}</div>
                  <div className="text-sm text-muted-foreground">Wins</div>
                </div>
              </CardContent>
            </Card>

            {profile.skills && profile.skills.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
