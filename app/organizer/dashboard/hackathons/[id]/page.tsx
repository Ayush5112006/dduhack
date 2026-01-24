"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  Settings,
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
} from "lucide-react"
import { useToast } from "@/components/toast-provider"

export default function HackathonDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const { addToast } = useToast()

  const [hackathon, setHackathon] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (id) {
      loadHackathon()
    }
  }, [id])

  const loadHackathon = async () => {
    try {
      const response = await fetch(`/api/organizer/hackathons/${id}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
        setFormData(data.hackathon)
      } else {
        addToast("error", "Failed to load hackathon")
        router.push("/organizer/dashboard/hackathons")
      }
    } catch (error) {
      console.error("Error:", error)
      addToast("error", "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/organizer/hackathons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setHackathon(data.hackathon)
        setIsEditing(false)
        addToast("success", "Hackathon updated successfully")
      } else {
        addToast("error", "Failed to update hackathon")
      }
    } catch (error) {
      console.error("Error:", error)
      addToast("error", "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSidebar type="organizer" />
        <main className="ml-64 p-8">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!hackathon) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/organizer/dashboard/hackathons")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {hackathon.title}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage hackathon details and settings
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(hackathon)
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        {!isEditing && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Registrations</p>
                    <p className="text-2xl font-bold text-foreground">
                      {hackathon._count?.registrations || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Submissions</p>
                    <p className="text-2xl font-bold text-foreground">
                      {hackathon._count?.submissions || 0}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Teams</p>
                    <p className="text-2xl font-bold text-foreground">
                      {hackathon._count?.teams || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Prize Pool</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${hackathon.prizeAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Hackathon Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mode">Mode</Label>
                        <Select
                          value={formData.mode || ""}
                          onValueChange={(value) =>
                            setFormData({ ...formData, mode: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Offline">Offline</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category || ""}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Web Development">
                              Web Development
                            </SelectItem>
                            <SelectItem value="Mobile">Mobile</SelectItem>
                            <SelectItem value="AI/ML">AI/ML</SelectItem>
                            <SelectItem value="Cloud">Cloud</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={formData.difficulty || ""}
                          onValueChange={(value) =>
                            setFormData({ ...formData, difficulty: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="prizeAmount">Prize Amount ($)</Label>
                        <Input
                          id="prizeAmount"
                          type="number"
                          value={formData.prizeAmount || 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              prizeAmount: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={
                            formData.startDate
                              ? new Date(formData.startDate)
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: new Date(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={
                            formData.endDate
                              ? new Date(formData.endDate).toISOString().slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: new Date(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="registrationDeadline">
                        Registration Deadline
                      </Label>
                      <Input
                        id="registrationDeadline"
                        type="datetime-local"
                        value={
                          formData.registrationDeadline
                            ? new Date(formData.registrationDeadline)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            registrationDeadline: new Date(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Status</h4>
                      <div className="mt-1">
                        <Badge>{hackathon.status}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">Mode</h4>
                        <p className="mt-1 text-muted-foreground">
                          {hackathon.mode}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Category</h4>
                        <p className="mt-1 text-muted-foreground">
                          {hackathon.category}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Difficulty
                        </h4>
                        <p className="mt-1 text-muted-foreground">
                          {hackathon.difficulty}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Prize Amount
                        </h4>
                        <p className="mt-1 text-muted-foreground">
                          ${hackathon.prizeAmount?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold text-foreground">
                            Start Date
                          </h4>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {new Date(hackathon.startDate).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold text-foreground">
                            End Date
                          </h4>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {new Date(hackathon.endDate).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {hackathon.location && (
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold text-foreground">
                            Location
                          </h4>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {hackathon.location}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Total registrations: {hackathon._count?.registrations || 0}
                  </p>
                  <Button className="mt-4" variant="outline" disabled>
                    View All Participants
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Total submissions: {hackathon._count?.submissions || 0}
                  </p>
                  <Button className="mt-4" variant="outline" disabled>
                    View All Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Hackathon Settings</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Additional settings coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
