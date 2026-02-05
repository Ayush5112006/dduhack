import { getUserProfile } from "@/app/actions/profile"
import { ProfileForm } from "@/components/profile/profile-form"
import { redirect } from "next/navigation"

export const metadata = {
  title: "My Profile | HackHub",
}

export default async function ProfilePage() {
  const { user, profile, error } = await getUserProfile()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <ProfileForm user={user} profile={profile} />
    </div>
  )
}
