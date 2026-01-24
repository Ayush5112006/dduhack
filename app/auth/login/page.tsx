"use client"

import React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Github, Chrome, ArrowLeft, Copy, Check } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DEFAULT_EMAIL = "demo@example.com"
const DEFAULT_PASSWORD = "demo123"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState<"email" | "password" | null>(null)
  const [userRole, setUserRole] = useState<"participant" | "organizer" | "admin">("participant")
  const [errorMessage, setErrorMessage] = useState("")

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(DEFAULT_EMAIL)
    setCopied("email")
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(DEFAULT_PASSWORD)
    setCopied("password")
    setTimeout(() => setCopied(null), 2000)
  }

  const handleQuickLogin = () => {
    setEmail(DEFAULT_EMAIL)
    setPassword(DEFAULT_PASSWORD)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          userName: email.split("@")[0],
          userRole,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const role = data?.user?.userRole || userRole
        const redirect = role === "admin" 
          ? "/admin/dashboard" 
          : role === "organizer" 
          ? "/organizer/dashboard" 
          : role === "judge"
          ? "/judge/dashboard"
          : "/dashboard"
        window.location.href = redirect
      } else {
        const error = await response.json()
        setErrorMessage(error.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrorMessage("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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
      
      // Simulate successful login
      await new Promise((resolve) => setTimeout(resolve, 1000))
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Google login error:", error)
      alert("Google login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubLogin = async () => {
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
      
      // Simulate successful login
      await new Promise((resolve) => setTimeout(resolve, 1000))
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("GitHub login error:", error)
      alert("GitHub login failed. Please try again.")
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
            <blockquote className="text-lg text-muted-foreground">
              &ldquo;HackHub helped me discover amazing hackathons and connect with talented developers 
              from around the world. I&apos;ve won 3 hackathons so far!&rdquo;
            </blockquote>
            <div className="mt-4">
              <p className="font-semibold text-foreground">Alex Johnson</p>
              <p className="text-sm text-muted-foreground">Full Stack Developer, 3x Hackathon Winner</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            2026 HackHub. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
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
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="gap-2 bg-transparent"
                    onClick={handleGithubLogin}
                    disabled={isLoading}
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="gap-2 bg-transparent"
                    onClick={handleGoogleLogin}
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
                  <Label htmlFor="role">Sign in as</Label>
                  <Select value={userRole} onValueChange={(value) => setUserRole(value as any)}>
                    <SelectTrigger className="bg-secondary">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participant">Participant / Student</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10 bg-secondary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Demo Credentials Card */}
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                  <CardContent className="pt-4">
                    <p className="text-xs font-semibold text-yellow-600 mb-3">DEMO CREDENTIALS</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Email:</p>
                          <p className="text-sm font-mono text-foreground">{DEFAULT_EMAIL}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyEmail}
                          className="h-8 w-8 p-0"
                        >
                          {copied === "email" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Password:</p>
                          <p className="text-sm font-mono text-foreground">{DEFAULT_PASSWORD}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyPassword}
                          className="h-8 w-8 p-0"
                        >
                          {copied === "password" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleQuickLogin}
                      className="w-full mt-3 border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10"
                    >
                      Quick Login
                    </Button>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me for 30 days
                  </Label>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
