"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)
  const { addToast } = useToast()

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
    addToast("success", "Setting updated!")
  }

  const handleChangePassword = () => {
    router.push("/dashboard/password")
  }

  const handleLogoutAll = async () => {
    if (!confirm("Logout from all devices? You'll be logged out everywhere.")) {
      return
    }

    setIsLoggingOutAll(true)
    try {
      const response = await fetch("/api/auth/logout-all", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to logout")
      }

      await logout()
      addToast("success", "Logged out from all devices!")
      router.push("/auth/login")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to logout from all devices"
      addToast("error", message)
    } finally {
      setIsLoggingOutAll(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure? This action cannot be undone.")
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "Failed to delete account")
      }

      await logout()
      addToast("success", "Account deleted. Goodbye!")
      router.push("/auth/login")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete account"
      addToast("error", message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <main className="space-y-8">
        <div className="">
          <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            Settings
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Notifications Settings */}
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg md:text-xl">Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-foreground leading-snug">Email Notifications</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Receive notifications via email
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggle("emailNotifications")}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-t border-border/30 pt-3 sm:pt-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-foreground leading-snug">Push Notifications</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Receive browser push notifications
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={() => handleToggle("pushNotifications")}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-t border-border/30 pt-3 sm:pt-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-foreground leading-snug">Activity Updates</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Get updates about your activities
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    checked={settings.activityEmails}
                    onCheckedChange={() => handleToggle("activityEmails")}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-t border-border/30 pt-3 sm:pt-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-foreground leading-snug">Marketing Emails</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Receive promotional and marketing emails
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={() => handleToggle("marketingEmails")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg md:text-xl">Privacy & Visibility</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <p className="font-medium text-sm sm:text-base text-foreground mb-3">Profile Visibility</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
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
                      className="capitalize text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
                    >
                      {level.replace("-", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <CardTitle className="text-base sm:text-lg md:text-xl">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base text-foreground leading-snug">Two-Factor Authentication</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Add an extra layer of security
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={() => handleToggle("twoFactorAuth")}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2 border-border/50 justify-center sm:justify-start mt-2 h-10 text-sm"
                onClick={handleChangePassword}
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg md:text-xl">Session Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <p className="text-xs sm:text-sm text-muted-foreground">
                You are currently logged in from this device
              </p>
              <Badge variant="outline" className="w-fit bg-green-500/10 text-green-500 border-green-500/30 text-xs sm:text-sm">
                Active
              </Badge>
              <Button
                variant="outline"
                className="w-full sm:w-auto gap-2 border-border/50 justify-center sm:justify-start h-10 text-sm"
                onClick={handleLogoutAll}
                disabled={isLoggingOutAll}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOutAll ? "Logging out..." : "Logout from All Devices"}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-destructive/30 bg-destructive/5 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg md:text-xl text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                These actions cannot be undone. Please proceed with caution.
              </p>
              <Button
                variant="destructive"
                className="w-full sm:w-auto gap-2 h-10 text-sm"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
