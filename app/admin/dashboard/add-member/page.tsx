"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar-new"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, UserPlus, Check, Shield, Users, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast-provider"

const passwordRequirements = [
  { label: "At least 8 characters", regex: /.{8,}/ },
  { label: "One uppercase letter", regex: /[A-Z]/ },
  { label: "One lowercase letter", regex: /[a-z]/ },
  { label: "One number", regex: /[0-9]/ },
]

export default function AddMemberPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "participant",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addToast("success", "Member added successfully")
        if (data?.tempPassword) {
          addToast("success", `Temp password (dev): ${data.tempPassword}`)
        }
        router.push("/admin/dashboard/users")
      } else {
        const data = await response.json()
        addToast("error", data.error || "Failed to add member")
      }
    } catch (error) {
      addToast("error", "Failed to add member")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminSidebar />
      
      <div className="lg:ml-64 flex flex-1 flex-col lg:flex-row">
        {/* Left Panel - Info Section */}
        <div className="hidden w-full flex-col justify-between bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-slate-950 p-12 lg:flex lg:w-1/2 border-r border-slate-700/50">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Admin Panel</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold leading-tight text-white">
              Add New Team Member
            </h2>
            <p className="text-lg text-slate-400">
              Create accounts for team members and assign them appropriate roles in the platform.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Available Roles</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                    <Users className="h-3 w-3 text-cyan-400" />
                  </div>
                  <div>
                    <span className="font-medium text-white">Participant</span>
                    <p className="text-sm text-slate-400">Join hackathons and submit projects</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                    <Award className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <span className="font-medium text-white">Organizer</span>
                    <p className="text-sm text-slate-400">Create and manage hackathon events</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <Shield className="h-3 w-3 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-medium text-white">Admin</span>
                    <p className="text-sm text-slate-400">Full platform access and control</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
          <div className="w-full max-w-md">
            <Card className="border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">Add Team Member</CardTitle>
                    <CardDescription className="text-slate-400">Create a new user account</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-slate-300">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-slate-300">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-slate-300">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-white focus:border-cyan-500/50">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700/50">
                        <SelectItem value="participant" className="text-white hover:bg-slate-800">Participant</SelectItem>
                        <SelectItem value="organizer" className="text-white hover:bg-slate-800">Organizer</SelectItem>
                        <SelectItem value="admin" className="text-white hover:bg-slate-800">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Choose the appropriate role for this user. An email with credentials will be sent if email is configured.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="bg-slate-900/50 border-slate-700/50 text-white placeholder-slate-500 pr-10 focus:border-cyan-500/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {passwordRequirements.map((req) => (
                        <div
                          key={req.label}
                          className={`flex items-center gap-1 text-xs ${
                            req.regex.test(formData.password) ? "text-emerald-400" : "text-slate-500"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white transition-all" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Creating account..."
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Account
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={isLoading}
                      className="border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-cyan-400"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
