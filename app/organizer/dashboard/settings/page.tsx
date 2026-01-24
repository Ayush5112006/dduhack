"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Save, Mail, Shield, Bell } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    organizationName: "DDU Hackathon",
    email: "organizer@ddu.edu",
    phone: "+91 8888 999 999",
    website: "https://dduhackathon.com",
    timezone: "IST",
    notifications: {
      emailNotifications: true,
      participantUpdates: true,
      submissionAlerts: true,
    },
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings({
      ...settings,
      [name]: value,
    })
  }

  const handleNotificationToggle = (key: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    })
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved successfully!")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="organizer" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your organization and account settings
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left sidebar - Settings menu */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-primary/10 text-primary border-primary/30"
            >
              <Mail className="h-4 w-4" />
              Organization
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Shield className="h-4 w-4" />
              Security
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </Button>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization Settings */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="text-foreground">
                    Organization Name
                  </Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    value={settings.organizationName}
                    onChange={handleInputChange}
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleInputChange}
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={settings.phone}
                    onChange={handleInputChange}
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-foreground">
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={settings.website}
                    onChange={handleInputChange}
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-foreground">
                    Timezone
                  </Label>
                  <Select defaultValue={settings.timezone}>
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IST">Indian Standard Time (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Standard Time (EST)</SelectItem>
                      <SelectItem value="CST">Central Standard Time (CST)</SelectItem>
                      <SelectItem value="PST">Pacific Standard Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your hackathons
                    </p>
                  </div>
                  <Badge
                    variant={settings.notifications.emailNotifications ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleNotificationToggle("emailNotifications")}
                  >
                    {settings.notifications.emailNotifications ? "On" : "Off"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Participant Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when participants register or withdraw
                    </p>
                  </div>
                  <Badge
                    variant={settings.notifications.participantUpdates ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleNotificationToggle("participantUpdates")}
                  >
                    {settings.notifications.participantUpdates ? "On" : "Off"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Submission Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Be alerted when teams submit their projects
                    </p>
                  </div>
                  <Badge
                    variant={settings.notifications.submissionAlerts ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleNotificationToggle("submissionAlerts")}
                  >
                    {settings.notifications.submissionAlerts ? "On" : "Off"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full gap-2"
              size="lg"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
