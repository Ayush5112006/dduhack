"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile } from "@/app/actions/profile"
import { User, UserProfile } from "@prisma/client"
import { Loader2 } from "lucide-react"

interface ProfileFormProps {
    user: User
    profile: UserProfile | null
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            const result = await updateUserProfile(formData)
            if (result.success) {
                addToast("success", "Profile updated successfully")
                router.refresh()
            } else {
                addToast("error", result.error || "Failed to update profile")
            }
        } catch (error) {
            addToast("error", "An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="mt-2 text-sm max-w-lg">
                        <Label htmlFor="avatar-upload" className="cursor-pointer text-primary hover:underline">
                            Upload new avatar (Not implemented yet)
                        </Label>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                placeholder="Tell us about yourself..."
                                defaultValue={profile?.bio || ""}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="e.g. New York, USA"
                                defaultValue={profile?.location || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills (comma separated)</Label>
                            <Input
                                id="skills"
                                name="skills"
                                placeholder="React, Node.js, Python"
                                defaultValue={profile?.skills || ""}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="website">Personal Website</Label>
                            <Input
                                id="website"
                                name="website"
                                placeholder="https://yourwebsite.com"
                                defaultValue={profile?.website || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="github">GitHub Profile</Label>
                            <Input
                                id="github"
                                name="github"
                                placeholder="https://github.com/username"
                                defaultValue={profile?.github || ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn Profile</Label>
                            <Input
                                id="linkedin"
                                name="linkedin"
                                placeholder="https://linkedin.com/in/username"
                                defaultValue={profile?.linkedin || ""}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading} size="lg">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
