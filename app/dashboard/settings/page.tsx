"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useSession } from "@/components/session-provider"
import { Lock, Bell, Eye, LogOut, Trash2, Shield } from "lucide-react"
import { useToast } from "@/components/toast-provider"

export default function SettingsPage() {
  const router = useRouter()
  const { logout } = useSession()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    activityEmails: true,
    marketingEmails: false,
    twoFactorAuth: false,
    profileVisibility: "public",
  })
  const { addToast } = useToast()

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
    addToast("success", "Setting updated!")
  }

  const handleChangePassword = () => {
    addToast("info", "Password change functionality coming soon!")
  }

  const handleLogoutAll = async () => {
    if (confirm("Logout from all devices?")) {
      await logout()
      router.push("/auth/login")
      addToast("success", "Logged out from all devices!")
    }
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      addToast("error", "Account deletion functionality coming soon!")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={() => handleToggle("pushNotifications")}
                />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="font-medium text-foreground">Activity Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Get updates about your activities
                  </p>
                </div>
                <Switch
                  checked={settings.activityEmails}
                  onCheckedChange={() => handleToggle("activityEmails")}
                />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="font-medium text-foreground">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional and marketing emails
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={() => handleToggle("marketingEmails")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <CardTitle>Privacy & Visibility</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-foreground mb-3">Profile Visibility</p>
                <div className="flex gap-3">
                  {["public", "private", "hackathon-only"].map((level) => (
                    <Button
                      key={level}
                      variant={
                        settings.profileVisibility === level ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSettings({ ...settings, profileVisibility: level })
                      }
                      className="capitalize"
                    >
                      {level.replace("-", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={() => handleToggle("twoFactorAuth")}
                />
              </div>
              <Button
                variant="outline"
                className="w-full gap-2 border-border justify-start mt-4"
                onClick={handleChangePassword}
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You are currently logged in from this device
              </p>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Active
              </Badge>
              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
                onClick={handleLogoutAll}
              >
                <LogOut className="h-4 w-4" />
                Logout from All Devices
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                These actions cannot be undone. Please proceed with caution.
              </p>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
