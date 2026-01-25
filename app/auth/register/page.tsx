"use client"

import React from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Github, Chrome, ArrowLeft, Check } from "lucide-react"

const Button = dynamic(() => import("@/components/ui/button").then(m => ({ default: m.Button })), { ssr: false })
const Input = dynamic(() => import("@/components/ui/input").then(m => ({ default: m.Input })), { ssr: false })
const Label = dynamic(() => import("@/components/ui/label").then(m => ({ default: m.Label })), { ssr: false })
const Checkbox = dynamic(() => import("@/components/ui/checkbox").then(m => ({ default: m.Checkbox })), { ssr: false })
const Card = dynamic(() => import("@/components/ui/card").then(m => ({ default: m.Card })), { ssr: false })
const CardContent = dynamic(() => import("@/components/ui/card").then(m => ({ default: m.CardContent })), { ssr: false })
const CardDescription = dynamic(() => import("@/components/ui/card").then(m => ({ default: m.CardDescription })), { ssr: false })
const CardHeader = dynamic(() => import("@/components/ui/card").then(m => ({ default: m.CardHeader })), { ssr: false })
const CardTitle = dynamic(() => import("@/components/ui/card").then(m => ({ default: m.CardTitle })), { ssr: false })
const Logo = dynamic(() => import("@/components/logo").then(m => ({ default: m.Logo })), { ssr: false })

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
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState("")
  
  // OTP verification state
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [otp, setOTP] = useState(["", "", "", "", "", ""])
  const [otpError, setOtpError] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    // Validate phone number if provided: allow 10 digits (India) or +country digits
    const digits = phone.replace(/\D/g, "")
    if (phone && digits.length > 0 && digits.length !== 10 && !/^\+\d{8,15}$/.test(phone)) {
      setIsLoading(false)
      setErrorMessage("Please enter a valid phone number (10 digits for India) or include country code.")
      return
    }

    // Normalize to E.164 for India if exactly 10 digits and no country code
    const normalizedPhone = phone
      ? (phone.startsWith("+") ? phone : (digits.length === 10 ? "+91" + digits : phone))
      : undefined

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          phone: normalizedPhone,
          userName: `${firstName} ${lastName}`.trim() || email.split("@")[0],
          userRole: role,
        }),
      })

      if (response.ok) {
        // Expect JSON but guard against unexpected content types
        try {
          await response.json()
        } catch (e) {
          // Ignore parse issues on success
        }
        setUserEmail(email)
        setShowOTPVerification(true)
        // Reset form
        setFirstName("")
        setLastName("")
        setPassword("")
        setPhone("")
        setEmail("")
      } else {
        // Robust error parsing: prefer JSON, fallback to text
        const ct = response.headers.get("content-type") || ""
        if (ct.includes("application/json")) {
          const error = await response.json()
          setErrorMessage(error.error || "Signup failed. Please try again.")
        } else {
          const text = await response.text()
          setErrorMessage(
            text?.trim() ? "Signup failed: " + text.substring(0, 140) : "Signup failed. Please try again."
          )
        }
      }
    } catch (error) {
      console.error("Signup error:", error)
      setErrorMessage("Signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOTP = [...otp]
    newOTP[index] = value.slice(-1)
    setOTP(newOTP)
    setOtpError("")

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handlePhoneChange = (value: string) => {
    // Allow digits and plus sign at start
    let v = value
    // Strip all non-digits except leading +
    if (v.startsWith("+")) {
      v = "+" + v.slice(1).replace(/\D/g, "")
    } else {
      v = v.replace(/\D/g, "")
    }
    setPhone(v)
    const digits = v.replace(/\D/g, "")
    if (digits.length === 0) {
      setPhoneError("")
    } else if (v.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
      setPhoneError("")
    } else if (!v.startsWith("+") && digits.length === 10) {
      setPhoneError("")
    } else {
      setPhoneError("Invalid phone format. Use 10 digits or include country code.")
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const verifyOTP = async () => {
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setOtpError("Please enter all 6 digits")
      return
    }

    setOtpLoading(true)
    setOtpError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: userEmail,
          otp: otpCode,
          role,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = "/dashboard"
      } else {
        const error = await response.json()
        setOtpError(error.error || "OTP verification failed")
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      setOtpError("Failed to verify OTP. Please try again.")
    } finally {
      setOtpLoading(false)
    }
  }

  const resendOTP = async () => {
    setResendLoading(true)
    setOtpError("")

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          role,
        }),
      })

      if (response.ok) {
        setOtpError("")
        alert("New OTP sent to your email!")
        setOTP(["", "", "", "", "", ""])
      } else {
        const error = await response.json()
        setOtpError(error.error || "Failed to resend OTP")
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      setOtpError("Failed to resend OTP. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=YOUR_GOOGLE_CLIENT_ID&` +
        `redirect_uri=${window.location.origin}/auth/callback/google&` +
        `response_type=code&` +
        `scope=email profile&` +
        `access_type=offline&` +
        `prompt=consent`
      
      alert("Google OAuth would open here. For production, configure Google OAuth credentials in Google Cloud Console.")
      console.log("Google Auth URL:", googleAuthUrl)
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
      const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=YOUR_GITHUB_CLIENT_ID&` +
        `redirect_uri=${window.location.origin}/auth/callback/github&` +
        `scope=user:email read:user`
      
      alert("GitHub OAuth would open here. For production, register an OAuth app at github.com/settings/developers.")
      console.log("GitHub Auth URL:", githubAuthUrl)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("GitHub signup error:", error)
      alert("GitHub signup failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (showOTPVerification) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden w-1/2 bg-card lg:block">
          <div className="flex h-full flex-col justify-between p-12">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Verify your email</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">Complete your registration</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">Secure your account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">Get verified instantly</span>
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
            <Button
              variant="ghost"
              onClick={() => {
                setShowOTPVerification(false)
                setOTP(["", "", "", "", "", ""])
                setOtpError("")
              }}
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Card className="border-border bg-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Verify your email</CardTitle>
                <CardDescription>Enter the 6-digit code we sent to {userEmail}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        className="h-12 w-12 text-center text-lg font-bold bg-secondary"
                        placeholder="-"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-sm text-red-500 text-center">{otpError}</p>
                  )}

                  <Button
                    onClick={verifyOTP}
                    disabled={otpLoading || otp.some(digit => !digit)}
                    className="w-full"
                  >
                    {otpLoading ? "Verifying..." : "Verify Email"}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?{" "}
                      <Button
                        variant="link"
                        onClick={resendOTP}
                        disabled={resendLoading}
                        className="p-0 h-auto font-medium text-primary"
                      >
                        {resendLoading ? "Sending..." : "Resend OTP"}
                      </Button>
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-700">
                    <p>OTP will expire in 10 minutes. Check your spam folder if you don't see the email.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-1/2 bg-card lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
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
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="63511 87842 or +91 63511 87842"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="bg-secondary"
                  />
                  {phoneError ? (
                    <p className="text-xs text-red-500">{phoneError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">For hackathon communications and verification</p>
                  )}
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
