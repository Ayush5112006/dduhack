"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/logo"

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [mockOtp, setMockOtp] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)
        setMockOtp(null)

        if (!email) {
            setError("Email is required")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/forgot-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Failed to send OTP. Please try again.")
                return
            }

            setSuccess(true)
            if (data.mockOtp) {
                setMockOtp(data.mockOtp)
            }

            // Redirect to reset password page after a short delay
            setTimeout(() => {
                router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)
            }, 2000)

        } catch (error) {
            setError("Network error. Please try again.")
            console.error("Forgot password error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="w-full max-w-md text-center space-y-4">
                    <div className="flex justify-center">
                        <CheckCircle2 className="h-16 w-16 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Email Sent!</h2>
                    <p className="text-muted-foreground">
                        We've sent a verification code to <strong>{email}</strong>.
                    </p>
                    <p className="text-sm text-muted-foreground">Redirecting to verification...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Sidebar (visual) */}
            <div className="hidden w-1/2 bg-card lg:block">
                <div className="flex h-full flex-col justify-between p-12">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo />
                    </Link>

                    <div>
                        <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground">
                            Recover your access
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Don't worry, it happens to the best of us. We'll help you get back into your account in no time.
                        </p>
                    </div>

                    <div className="text-sm text-muted-foreground">2026 HackHub. All rights reserved.</div>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
                <div className="w-full max-w-md">
                    <Link
                        href="/auth/login"
                        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>

                    <Card className="border-border bg-card">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                            <CardDescription>
                                Enter your email address and we'll send you a code to reset your password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-secondary"
                                        disabled={isLoading}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending code...
                                        </>
                                    ) : (
                                        "Send Reset Code"
                                    )}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Remember your password?{" "}
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
