"use client"

import { useState, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, CheckCircle2, Loader2, Github, Mail, Check } from "lucide-react"
import { Logo } from "@/components/logo"

const PasswordStrengthIndicator = memo(function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = {
    hasMinLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  }

  const strength = Object.values(checks).filter(Boolean).length
  const strengthColor = strength <= 1 ? "text-red-500" : strength <= 2 ? "text-yellow-500" : strength <= 3 ? "text-blue-500" : "text-green-500"

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`flex items-center gap-1.5 ${checks.hasMinLength ? "text-green-500" : "text-gray-500"}`}>
          {checks.hasMinLength && <Check size={14} />}
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.hasLowercase ? "text-green-500" : "text-gray-500"}`}>
          {checks.hasLowercase && <Check size={14} />}
          <span>One lowercase letter</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.hasUppercase ? "text-green-500" : "text-gray-500"}`}>
          {checks.hasUppercase && <Check size={14} />}
          <span>One uppercase letter</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.hasNumber ? "text-green-500" : "text-gray-500"}`}>
          {checks.hasNumber && <Check size={14} />}
          <span>One number</span>
        </div>
      </div>
    </div>
  )
})

const RegisterForm = memo(function RegisterForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "participant",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const validateForm = useCallback(() => {
    if (!formData.firstName.trim()) {
      setError("First name is required")
      return false
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setError("Password must contain uppercase, lowercase, and numbers")
      return false
    }
    return true
  }, [formData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone || null,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.")
        return
      }

      // Show success message
      setSuccess(true)

      // Redirect to OTP verification page after a brief delay
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
      }, 1500)
    } catch (error) {
      setError("Network error. Please try again.")
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [formData, router, validateForm])

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">Account Created Successfully!</h2>
          <p className="mb-4 text-muted-foreground">Redirecting to email verification...</p>
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left Sidebar */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-950 to-slate-900 p-12 lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 hover:bg-slate-700">
            <Logo />
            <span className="text-lg font-bold text-cyan-400">HackHub</span>
          </Link>
        </div>

        <div>
          <h1 className="mb-8 text-4xl font-bold leading-tight text-white">
            Start your hackathon journey today
          </h1>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Check className="mt-1 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span className="text-gray-300">Access to 500+ hackathons worldwide</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-1 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span className="text-gray-300">Connect with developers globally</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-1 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span className="text-gray-300">Win prizes worth millions</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-1 h-5 w-5 flex-shrink-0 text-cyan-400" />
              <span className="text-gray-300">Learn from industry experts</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">2026 HackHub. All rights reserved.</div>
      </div>

      {/* Right Form Section */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <Card className="w-full border-0 bg-slate-900 px-8 py-12 shadow-2xl sm:max-w-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Create an account</h2>
            <p className="mt-2 text-sm text-gray-400">Join thousands of developers building the future</p>
          </div>

          {/* OAuth Buttons */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800 hover:bg-slate-700"
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800 hover:bg-slate-700"
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-900 px-2 text-gray-500">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* First and Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium text-white">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange("firstName", e.target.value)}
                  className="mt-1.5 border-slate-700 bg-slate-800 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium text-white">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange("lastName", e.target.value)}
                  className="mt-1.5 border-slate-700 bg-slate-800 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                className="mt-1.5 border-slate-700 bg-slate-800 text-white placeholder:text-gray-500"
                disabled={isLoading}
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-white">
                Phone Number <span className="text-gray-500">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 63511 87842"
                value={formData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                className="mt-1.5 border-slate-700 bg-slate-800 text-white placeholder:text-gray-500"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">For hackathon communications and verification</p>
            </div>

            {/* Role Selection */}
            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-white">
                I am a
              </Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleFieldChange("role", e.target.value)}
                className="mt-1.5 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-gray-500"
                disabled={isLoading}
              >
                <option value="participant">Participant / Developer (default)</option>
                <option value="organizer">Organizer</option>
                <option value="mentor">Mentor</option>
                <option value="judge">Judge</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Account role is fixed to participant for registration.</p>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange("password", e.target.value)}
                  className="border-slate-700 bg-slate-800 text-white placeholder:text-gray-500 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && <PasswordStrengthIndicator password={formData.password} />}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                id="terms"
                defaultChecked
                className="mt-1 rounded border-slate-700 bg-slate-800"
              />
              <label htmlFor="terms" className="text-gray-400">
                I agree to the{" "}
                <Link href="/terms" className="text-cyan-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-cyan-400 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-2.5 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-cyan-400 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
})

export default RegisterForm

