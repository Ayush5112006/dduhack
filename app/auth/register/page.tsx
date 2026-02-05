"use client"

import { useState, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, CheckCircle2, Loader2, Github, Check, ArrowLeft, Chrome } from "lucide-react"
import { Logo } from "@/components/logo"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PasswordStrengthIndicator = memo(function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = {
    hasMinLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  }

  const strength = Object.values(checks).filter(Boolean).length

  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className={`flex items-center gap-1.5 ${checks.hasMinLength ? "text-green-500" : "text-muted-foreground"}`}>
          {checks.hasMinLength && <Check size={14} />}
          <span>At least 8 characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.hasLowercase ? "text-green-500" : "text-muted-foreground"}`}>
          {checks.hasLowercase && <Check size={14} />}
          <span>One lowercase letter</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.hasUppercase ? "text-green-500" : "text-muted-foreground"}`}>
          {checks.hasUppercase && <Check size={14} />}
          <span>One uppercase letter</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.hasNumber ? "text-green-500" : "text-muted-foreground"}`}>
          {checks.hasNumber && <Check size={14} />}
          <span>One number</span>
        </div>
      </div>
    </div>
  )
})

export default function RegisterPage() {
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
          <CheckCircle2 className="mb-4 h-16 w-16 text-primary" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">Account Created Successfully!</h2>
          <p className="mb-4 text-muted-foreground">Redirecting to email verification...</p>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <div className="hidden w-1/2 bg-card lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>

          <div>
            <h1 className="mb-8 text-4xl font-bold leading-tight text-foreground">
              Start your hackathon journey today
            </h1>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">Access to 500+ hackathons worldwide</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">Connect with developers globally</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">Win prizes worth millions</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">Learn from industry experts</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">2026 HackHub. All rights reserved.</div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex w-full items-center justify-center px-4 lg:w-1/2 py-8">
        <div className="w-full max-w-lg">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Join thousands of developers building the future</CardDescription>
            </CardHeader>
            <CardContent>
              {/* OAuth Buttons */}
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  disabled={isLoading}
                  onClick={() => { }}
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  disabled={isLoading}
                  onClick={() => { }}
                >
                  <Chrome className="h-4 w-4" />
                  Google
                </Button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleFieldChange("firstName", e.target.value)}
                      disabled={isLoading}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleFieldChange("lastName", e.target.value)}
                      disabled={isLoading}
                      className="bg-secondary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    disabled={isLoading}
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 63511 87842"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    disabled={isLoading}
                    className="bg-secondary"
                  />
                  <p className="text-[10px] text-muted-foreground">For hackathon communications and verification</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleFieldChange("role", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-secondary">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participant">Participant / Developer</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                      className="pr-10 bg-secondary"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.password && <PasswordStrengthIndicator password={formData.password} />}
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <Checkbox
                    id="terms"
                    defaultChecked
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
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

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
