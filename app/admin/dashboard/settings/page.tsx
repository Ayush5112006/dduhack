"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="admin" />
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
                  {["public", "private", "admin-only"].map((level) => (
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
              <div className="border-t border-border pt-4">
                <p className="font-medium text-foreground mb-2">Password</p>
                <Link href="/dashboard/password">
                  <Button variant="outline" className="gap-2">
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-t border-border pt-4">
                <p className="font-medium text-foreground mb-2">Logout from all devices</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Sign out from all devices and sessions
                </p>
                <Button
                  variant="outline"
                  onClick={handleLogoutAll}
                  disabled={isLoggingOutAll}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOutAll ? "Logging out..." : "Logout All Sessions"}
                </Button>
              </div>
              <div className="border-t border-border pt-4">
                <p className="font-medium text-destructive mb-2">Delete Account</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all data
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

