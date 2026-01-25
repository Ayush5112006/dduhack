"use client"

import { AlertCircle, Lock, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSubmissionLockReason, getTimeUntilDeadline } from "@/lib/submission-utils"

interface SubmissionLockStatusProps {
  submission?: any
  hackathon?: any
  locked: boolean
  lockedReason?: string
  deadlineText?: string
}

export function SubmissionLockStatus({ submission, hackathon, locked, lockedReason, deadlineText }: SubmissionLockStatusProps) {
  if (!locked) {
    return null
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Submission Locked</h3>
            <p className="text-sm text-red-800 mt-1">
              {deadlineText || "This submission is locked and cannot be edited. Contact the organizers for more information."}
            </p>
            {lockedReason && (
              <p className="text-xs text-red-700 mt-1">
                <strong>Reason:</strong> {lockedReason}
              </p>
            )}
          </div>
          <Badge variant="destructive" className="flex-shrink-0">
            Locked
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

interface DeadlineCountdownProps {
  hackathon?: any
}

export function DeadlineCountdown({ hackathon }: DeadlineCountdownProps) {
  const deadline = getTimeUntilDeadline(hackathon)

  if (!deadline || deadline.remaining <= 0) {
    return null
  }

  const isUrgent = deadline.remaining < 24 * 60 * 60 * 1000

  return (
    <>
      {isUrgent ? (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-semibold text-orange-900">
                Submission Deadline
              </p>
              <p className="text-xs text-orange-700">{deadline.formatted}</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Submission Deadline
              </p>
              <p className="text-xs text-blue-700">{deadline.formatted}</p>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
