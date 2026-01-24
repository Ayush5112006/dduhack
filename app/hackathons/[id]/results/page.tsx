"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Award, Medal } from "lucide-react"
import Link from "next/link"

type Winner = {
  id: string
  rank: number
  prize?: string
  submission: {
    id: string
    title: string
    description: string
    github?: string
    demo?: string
    score?: number
  }
}

export default function ResultsPage() {
  const params = useParams()
  const id = params.id as string
  const [winners, setWinners] = useState<Winner[]>([])
  const [hackathonTitle, setHackathonTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [winnersRes, hackathonRes] = await Promise.all([
          fetch(`/api/hackathons/${id}/winners`),
          fetch(`/api/hackathons/${id}`),
        ])

        if (winnersRes.ok) {
          const data = await winnersRes.json()
          setWinners(data.winners || [])
        }

        if (hackathonRes.ok) {
          const data = await hackathonRes.json()
          setHackathonTitle(data.hackathon?.title || "")
        }
      } catch (error) {
        console.error("Failed to load", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-12 w-12 text-yellow-500" />
    if (rank === 2) return <Medal className="h-12 w-12 text-gray-400" />
    if (rank === 3) return <Award className="h-12 w-12 text-orange-600" />
    return null
  }

  const getRankLabel = (rank: number) => {
    if (rank === 1) return "1st Place"
    if (rank === 2) return "2nd Place"
    if (rank === 3) return "3rd Place"
    return `${rank}th Place`
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground">{hackathonTitle}</h1>
          <p className="mt-2 text-xl text-muted-foreground">Winners & Results</p>
        </div>

        {winners.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center">
              <Trophy className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">Results have not been announced yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {winners
              .sort((a, b) => a.rank - b.rank)
              .map((winner) => (
                <Card
                  key={winner.id}
                  className="border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {getRankIcon(winner.rank)}
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{winner.submission?.title}</CardTitle>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="default">{getRankLabel(winner.rank)}</Badge>
                          {winner.prize && <Badge variant="outline">{winner.prize}</Badge>}
                          {winner.submission?.score && (
                            <Badge variant="secondary">Score: {winner.submission.score}/50</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{winner.submission?.description}</p>
                    <div className="mt-4 flex gap-3">
                      {winner.submission?.github && (
                        <Link
                          href={winner.submission.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View on GitHub →
                        </Link>
                      )}
                      {winner.submission?.demo && (
                        <Link
                          href={winner.submission.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Live Demo →
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
