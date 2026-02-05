import { getOrganizerHackathons } from "@/app/actions/organizer-hackathon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Calendar, Users, Trophy } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "My Hackathons | Organizer Dashboard",
}

export default async function MyHackathonsPage() {
  const { hackathons, error } = await getOrganizerHackathons()

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Hackathons</h1>
          <p className="text-muted-foreground">Manage and track your organized events.</p>
        </div>
        <Button asChild>
          <Link href="/organizer/hackathons/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Hackathon
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hackathons && hackathons.length > 0 ? (
          hackathons.map((hackathon) => (
            <Card key={hackathon.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant={hackathon.status === 'live' ? 'default' : 'secondary'} className="mb-2">
                    {hackathon.status}
                  </Badge>
                  <Badge variant="outline">{hackathon.mode}</Badge>
                </div>
                <CardTitle className="line-clamp-1">{hackathon.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {hackathon.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(hackathon.startDate).toLocaleDateString('en-US')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{hackathon._count.registrations} Joined</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span>${hackathon.prizeAmount.toLocaleString('en-US')} Prize</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/hackathons/${hackathon.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">No hackathons found</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first event</p>
            <Button asChild>
              <Link href="/organizer/hackathons/create">Create Hackathon</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
