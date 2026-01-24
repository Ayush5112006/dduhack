"use client"

import React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Role selection removed; default to participant
import { Eye, EyeOff, Github, Chrome, ArrowLeft, Check } from "lucide-react"

const passwordRequirements = [
  { label: "At least 8 characters", regex: /.{8,}/ },
  { label: "One uppercase letter", regex: /[A-Z]/ },
  { label: "One lowercase letter", regex: /[a-z]/ },
  { label: "One number", regex: /[0-9]/ },
]

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [role] = useState("participant")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          userName: `${firstName} ${lastName}`.trim() || email.split("@")[0],
          userRole: role,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const userRole = data?.user?.userRole || role
        const redirect = userRole === "admin" 
          ? "/admin/dashboard" 
          : userRole === "organizer" 
          ? "/organizer/dashboard" 
          : "/dashboard"
        window.location.href = redirect
      } else {
        const error = await response.json()
        setErrorMessage(error.error || "Signup failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setErrorMessage("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      // Google OAuth URL - replace with your actual Google OAuth client ID
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=YOUR_GOOGLE_CLIENT_ID&` +
        `redirect_uri=${window.location.origin}/auth/callback/google&` +
        `response_type=code&` +
        `scope=email profile&` +
        `access_type=offline&` +
        `prompt=consent`
      
      // For demo purposes, simulate OAuth flow
      alert("Google OAuth would open here. For production, configure Google OAuth credentials in Google Cloud Console.")
      console.log("Google Auth URL:", googleAuthUrl)
      
      // Simulate successful signup
      await new Promise((resolve) => setTimeout(resolve, 1000))
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Google signup error:", error)
      alert("Google signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignup = async () => {
    setIsLoading(true)
    try {
      // GitHub OAuth URL - replace with your actual GitHub OAuth client ID
      const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=YOUR_GITHUB_CLIENT_ID&` +
        `redirect_uri=${window.location.origin}/auth/callback/github&` +
        `scope=user:email read:user`
      
      // For demo purposes, simulate OAuth flow
      alert("GitHub OAuth would open here. For production, register an OAuth app at github.com/settings/developers.")
      console.log("GitHub Auth URL:", githubAuthUrl)
      
      // Simulate successful signup
      await new Promise((resolve) => setTimeout(resolve, 1000))
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("GitHub signup error:", error)
      alert("GitHub signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-1/2 bg-card lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-xl font-bold text-foreground">HackHub</span>
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Start your hackathon journey today</h2>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-muted-foreground">Access to 500+ hackathons worldwide</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-muted-foreground">Connect with developers globally</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-muted-foreground">Win prizes worth millions</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-muted-foreground">Learn from industry experts</span>
              </li>
            </ul>
          </div>
          <div className="text-sm text-muted-foreground">
            2026 HackHub. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="gap-2 bg-transparent"
                    onClick={handleGithubSignup}
                    disabled={isLoading}
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="gap-2 bg-transparent"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                  >
                    <Chrome className="h-4 w-4" />
                    Google
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-secondary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <div className="rounded-md border border-border/60 bg-secondary px-3 py-2 text-sm text-foreground">
                    Participant / Developer (default)
                  </div>
                  <p className="text-xs text-muted-foreground">Account role is fixed to participant for registration.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-secondary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                          req.regex.test(password) ? "text-green-500" : "text-muted-foreground"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox id="terms" className="mt-1" />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
