"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { Logo } from "@/components/logo"

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const emailParam = searchParams.get("email") || ""

    const [formData, setFormData] = useState({
        email: emailParam,
        otp: "",
        password: "",
        confirmPassword: "",
    })

    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!formData.email || !formData.otp || !formData.password) {
            setError("All fields are required")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Failed to reset password")
                return
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/auth/login")
            }, 3000)
        } catch (error) {
            setError("Network error. Please try again.")
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
                    <h2 className="text-2xl font-bold text-foreground">Password Reset!</h2>
                    <p className="text-muted-foreground">
                        Your password has been successfully updated. You can now log in with your new password.
                    </p>
                    <p className="text-sm text-muted-foreground">Redirecting to login...</p>
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
                        <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground">
                            Secure your account
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Create a strong new password to protect your profile and submissions.
                        </p>
                    </div>
                    <div className="text-sm text-muted-foreground">2026 HackHub. All rights reserved.</div>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
                <div className="w-full max-w-md">
                    <Link
                        href="/auth/forgot-password"
                        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>

                    <Card className="border-border bg-card">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Set New Password</CardTitle>
                            <CardDescription>
                                Enter the code sent to your email and choose a new password.
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
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="bg-secondary"
                                        disabled={!!emailParam} // Disable if passed from query param
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="otp">Verification Code (OTP)</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="123456"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        className="bg-secondary tracking-widest font-mono"
                                        maxLength={6}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 8 characters"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="bg-secondary pr-10"
                                            disabled={isLoading}
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

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Repeat password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="bg-secondary"
                                        disabled={isLoading}
                                    />
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full mt-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating Password...
                                        </>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
