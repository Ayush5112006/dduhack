"use client"

import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  const requirements = [
    { label: "At least 8 characters", met: hasMinLength },
    { label: "One uppercase letter", met: hasUppercase },
    { label: "One lowercase letter", met: hasLowercase },
    { label: "One number", met: hasNumber },
  ]

  const metCount = requirements.filter((req) => req.met).length
  const strength =
    metCount === 0
      ? "weak"
      : metCount === 1 || metCount === 2
        ? "fair"
        : metCount === 3
          ? "good"
          : "strong"

  const strengthColors = {
    weak: "bg-red-500",
    fair: "bg-yellow-500",
    good: "bg-blue-500",
    strong: "bg-green-500",
  }

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Password Strength
          </label>
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {strength}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              strengthColors[strength]
            }`}
            style={{
              width: `${(metCount / requirements.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {requirements.map((req, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm"
          >
            {req.met ? (
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span
              className={
                req.met
                  ? "text-green-500"
                  : "text-muted-foreground"
              }
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
