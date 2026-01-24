"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Eye,
  Edit,
  Trash2,
  Users,
  FileText,
  MoreHorizontal,
  Calendar,
  MapPin,
  Trophy,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/components/toast-provider"
import { useRouter } from "next/navigation"

interface HackathonCardProps {
  hackathon: {
    id: string
    title: string
    description?: string
    status: string
    mode: string
    category: string
    startDate: string | Date
    endDate: string | Date
    registrationDeadline: string | Date
    participants: number
    difficulty: string
    prizeAmount: number
    location?: string
    banner?: string
    _count?: {
      registrations: number
      submissions: number
      teams: number
    }
  }
  onUpdate?: () => void
}

export function HackathonCard({ hackathon, onUpdate }: HackathonCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { addToast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/organizer/hackathons/${hackathon.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )

      if (response.ok) {
        addToast("success", "Hackathon deleted successfully")
        setShowDeleteDialog(false)
        onUpdate?.()
      } else {
        addToast("error", "Failed to delete hackathon")
      }
    } catch (error) {
      console.error("Error:", error)
      addToast("error", "An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-500/10 text-green-700"
      case "upcoming":
        return "bg-blue-500/10 text-blue-700"
      case "closed":
        return "bg-red-500/10 text-red-700"
      case "past":
        return "bg-gray-500/10 text-gray-700"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <>
      <Card className="overflow-hidden border-border bg-card hover:shadow-lg transition-shadow">
        {hackathon.banner && (
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 w-full" />
        )}
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="line-clamp-2">{hackathon.title}</CardTitle>
                <Badge className={getStatusColor(hackathon.status)}>
                  {hackathon.status}
                </Badge>
              </div>
              {hackathon.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {hackathon.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/organizer/dashboard/hackathons/${hackathon.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/organizer/dashboard/hackathons/${hackathon.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/organizer/dashboard/hackathons/${hackathon.id}/participants`}>
                    <Users className="mr-2 h-4 w-4" /> Participants
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/organizer/dashboard/hackathons/${hackathon.id}/submissions`}>
                    <FileText className="mr-2 h-4 w-4" /> Submissions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(hackathon.startDate)}</span>
              </div>
              {hackathon.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{hackathon.location}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{hackathon.category}</Badge>
              <Badge variant="outline">{hackathon.mode}</Badge>
              <Badge variant="outline">{hackathon.difficulty}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t pt-3">
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {hackathon._count?.registrations || 0}
                </div>
                <div className="text-xs text-muted-foreground">Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {hackathon._count?.submissions || 0}
                </div>
                <div className="text-xs text-muted-foreground">Submissions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {hackathon._count?.teams || 0}
                </div>
                <div className="text-xs text-muted-foreground">Teams</div>
              </div>
            </div>

            {hackathon.prizeAmount > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-2 text-sm">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  Total Prize: ${hackathon.prizeAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Hackathon?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{hackathon.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
