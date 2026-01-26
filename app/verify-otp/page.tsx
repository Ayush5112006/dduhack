"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Check, X, Clock } from "lucide-react"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setError("OTP has expired. Please request a new one.")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1) // Only single digit

    setOtp(newOtp)
    setError("") // Clear error on input

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Verify OTP
  const handleVerify = async () => {
    if (otp.some((digit) => !digit)) {
      setError("Please enter all 6 digits")
      return
    }

    if (!email) {
      setError("Email is required. Please register first.")
      return
    }

    const otpCode = otp.join("")

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error || "Too many attempts. Please try again later.")
        } else if (response.status === 410) {
          setError(data.error || "OTP expired. Please request a new one.")
        } else if (response.status === 401) {
          setError(data.error || "Invalid OTP")
          if (data.attemptsRemaining !== undefined) {
            setAttemptsLeft(data.attemptsRemaining)
          }
        } else {
          setError(data.error || "Verification failed")
        }
        return
      }

      setSuccess(true)
      setOtp(["", "", "", "", "", ""])

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error) {
      setError("Network error. Please try again.")
      console.error("Verification error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResend = async () => {
    if (!email) {
      setError("Email is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error || "Please wait before requesting another OTP")
        } else {
          setError(data.error || "Failed to resend OTP")
        }
        return
      }

      // Reset timer and OTP
      setTimeLeft(600)
      setOtp(["", "", "", "", "", ""])
      setAttemptsLeft(5)
      inputRefs.current[0]?.focus()
    } catch (error) {
      setError("Network error. Please try again.")
      console.error("Resend error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-full mb-4">
            <div className="text-3xl">🎯</div>
          </div>
          <h1 className="text-3xl font-bold text-white">HackHub</h1>
          <p className="text-slate-400 mt-2">Email Verification</p>
        </div>

        {success ? (
          // Success state
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Verified!</h2>
            <p className="text-slate-300 mb-6">
              Your email has been successfully verified. Redirecting to login...
            </p>
            <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          </div>
        ) : (
          // Form state
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8">
            {/* Email display */}
            <div className="mb-8">
              <p className="text-slate-400 text-sm mb-2">Verifying email:</p>
              <p className="text-white font-medium break-all">{email}</p>
            </div>

            {/* Timer */}
            <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-slate-200 text-sm">Time remaining:</span>
              </div>
              <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-blue-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* OTP Input */}
            <div className="mb-8">
              <label className="block text-white text-sm font-medium mb-4">
                Enter 6-digit verification code
              </label>

              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    placeholder="-"
                    className="w-14 h-14 text-center text-xl font-bold bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 transition"
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Attempts left */}
            {attemptsLeft < 5 && attemptsLeft > 0 && (
              <div className="mb-6 text-sm text-amber-400">
                {attemptsLeft === 1
                  ? "⚠️ Last attempt remaining"
                  : `⚠️ ${attemptsLeft} attempts remaining`}
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isLoading || timeLeft === 0}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 mb-4"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>

            {/* Resend button */}
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="w-full text-teal-400 hover:text-teal-300 disabled:text-slate-600 font-medium py-2 px-4 text-sm transition"
            >
              Didn't receive the code? Resend OTP
            </button>

            {/* Help text */}
            <div className="mt-8 pt-6 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-sm mb-4">
                🔒 Never share this code with anyone. Our support team will
                never ask you for it.
              </p>

              <p className="text-slate-500 text-xs">
                Wrong email?{" "}
                <Link
                  href="/auth/register"
                  className="text-teal-400 hover:text-teal-300"
                >
                  Register again
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
