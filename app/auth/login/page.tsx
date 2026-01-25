"use client"

import React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Github, Chrome, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const LOCKOUT_KEY = 'login_lockout'
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userRole, setUserRole] = useState<"participant" | "organizer" | "admin">("participant")
  const [errorMessage, setErrorMessage] = useState("")
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)

  // Check for lockout on mount
  React.useEffect(() => {
    const lockout = localStorage.getItem(LOCKOUT_KEY)
    if (lockout) {
      const lockoutData = JSON.parse(lockout)
      if (lockoutData.until > Date.now()) {
        setLockoutTime(lockoutData.until)
      } else {
        localStorage.removeItem(LOCKOUT_KEY)
      }
    }
  }, [])

  // Update lockout timer
  React.useEffect(() => {
    if (!lockoutTime) return
    
    const interval = setInterval(() => {
      if (Date.now() >= lockoutTime) {
        setLockoutTime(null)
        localStorage.removeItem(LOCKOUT_KEY)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutTime])

  const recordFailedAttempt = () => {
    const attemptsKey = 'login_attempts'
    const attempts = JSON.parse(localStorage.getItem(attemptsKey) || '[]')
    const now = Date.now()
    
    // Filter out attempts older than 30 minutes
    const recentAttempts = attempts.filter((time: number) => now - time < LOCKOUT_DURATION)
    recentAttempts.push(now)
    
    localStorage.setItem(attemptsKey, JSON.stringify(recentAttempts))
    
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const lockUntil = now + LOCKOUT_DURATION
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ until: lockUntil }))
      setLockoutTime(lockUntil)
      return true // locked out
    }
    
    return false // not locked out
  }

  const clearFailedAttempts = () => {
    localStorage.removeItem('login_attempts')
    localStorage.removeItem(LOCKOUT_KEY)
    setLockoutTime(null)
  }

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return ''
    const remaining = Math.ceil((lockoutTime - Date.now()) / 60000)
    return remaining > 0 ? `${remaining} minute${remaining !== 1 ? 's' : ''}` : ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if locked out
    if (lockoutTime && Date.now() < lockoutTime) {
      setErrorMessage(`Too many failed attempts. Try again in ${getRemainingLockoutTime()}`)
      return
    }
    
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
          role: userRole,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const role = data?.user?.userRole || userRole
        
        // Clear failed attempts on successful login
        clearFailedAttempts()
        
        // Check if there's a stored redirect path
        const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin")
        if (redirectAfterLogin) {
          sessionStorage.removeItem("redirectAfterLogin")
          window.location.href = redirectAfterLogin
        } else {
          // Default redirect based on role
          const redirect = role === "admin" 
            ? "/admin/dashboard" 
            : role === "organizer" 
            ? "/organizer/dashboard" 
            : "/dashboard"
          window.location.href = redirect
        }
      } else {
        const error = await response.json()
        const errorMsg = error.error || "Login failed"
        setErrorMessage(errorMsg)
        
        // Record failed attempt and check for lockout
        const isLockedOut = recordFailedAttempt()
        if (isLockedOut) {
          setErrorMessage(`Too many failed attempts. Account locked for 30 minutes in this browser.`)
        }
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
            <Logo />
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

                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me for 30 days
                  </Label>
                </div>

                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || !!lockoutTime}>
                  {lockoutTime 
                    ? `Locked (${getRemainingLockoutTime()} remaining)` 
                    : isLoading 
                    ? "Signing in..." 
                    : "Sign in"}
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
