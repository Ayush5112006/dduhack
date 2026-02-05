'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/toast-provider'

export default function ForgotOtpPage() {
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [applicationNumber, setApplicationNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [mockOtp, setMockOtp] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMockOtp(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, applicationNumber }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast('error', data.error || 'Failed to send OTP')
        return
      }
      addToast('success', data.message || 'OTP sent if the email is registered')
      if (data.mockOtp) {
        setMockOtp(data.mockOtp)
      }
      // Redirect to verify OTP page after 2 seconds
      setTimeout(() => {
        window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`
      }, 2000)
    } catch (error: any) {
      addToast('error', 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot OTP</CardTitle>
          <CardDescription>Enter your email and application number to receive a new OTP.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Application Number</label>
              <Input
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(e.target.value)}
                placeholder="Enter your application ID"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>



          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an OTP?{' '}
            <a href="/verify-otp" className="text-primary hover:underline font-medium">
              Verify it here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
