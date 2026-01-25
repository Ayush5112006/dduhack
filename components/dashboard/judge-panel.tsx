'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Star, ExternalLink, ArrowRight } from 'lucide-react'

interface Submission {
  id: string
  title: string
  description?: string
  githubUrl: string
  demoUrl?: string
  techStack: string[]
  status: string
  participantName: string
  participantEmail: string
  hackathonName: string
  score?: {
    innovation: number
    technical: number
    design: number
    impact: number
    presentation: number
    total: number
    feedback?: string
  }
}

interface ScoreData {
  innovation: number
  technical: number
  design: number
  impact: number
  presentation: number
  feedback: string
}

export function JudgePanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [scoring, setScoring] = useState(false)
  const [scoreData, setScoreData] = useState<ScoreData>({
    innovation: 5,
    technical: 5,
    design: 5,
    impact: 5,
    presentation: 5,
    feedback: '',
  })
  const { toast } = useToast()

  // Fetch submissions assigned to this judge
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/judge/scores')
        const data = await response.json()

        if (response.ok) {
          setSubmissions(data.submissions || [])
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to load submissions',
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch submissions',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [toast])

  const handleScoreChange = (metric: keyof Omit<ScoreData, 'feedback'>, value: number) => {
    setScoreData((prev) => ({
      ...prev,
      [metric]: Math.min(10, Math.max(1, value)),
    }))
  }

  const calculateAverage = () => {
    const sum = scoreData.innovation + scoreData.technical + scoreData.design + scoreData.impact + scoreData.presentation
    return (sum / 5).toFixed(2)
  }

  const handleSubmitScore = async () => {
    if (!selectedSubmission) return

    try {
      setScoring(true)
      const response = await fetch('/api/judge/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          innovation: scoreData.innovation,
          technical: scoreData.technical,
          design: scoreData.design,
          impact: scoreData.impact,
          presentation: scoreData.presentation,
          feedback: scoreData.feedback,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Score submitted successfully!',
        })
        // Update submission in list with new score
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === selectedSubmission.id
              ? {
                  ...sub,
                  score: {
                    innovation: scoreData.innovation,
                    technical: scoreData.technical,
                    design: scoreData.design,
                    impact: scoreData.impact,
                    presentation: scoreData.presentation,
                    total: parseFloat(calculateAverage()),
                    feedback: scoreData.feedback,
                  },
                }
              : sub
          )
        )
        setSelectedSubmission(null)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to submit score',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit score',
        variant: 'destructive',
      })
    } finally {
      setScoring(false)
    }
  }

  const unscored = submissions.filter((s) => !s.score)
  const scored = submissions.filter((s) => s.score)
  const averageScore = scored.length > 0
    ? (scored.reduce((sum, s) => sum + (s.score?.total || 0), 0) / scored.length).toFixed(2)
    : 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Submissions</CardTitle>
          <CardDescription>You haven't been assigned any submissions yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Check back later when submissions are assigned to you for scoring.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">submissions to evaluate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scored.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {unscored.length} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageScore}/10</div>
            <p className="text-xs text-muted-foreground mt-1">based on scored submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Tabs defaultValue="unscored" className="w-full">
        <TabsList>
          <TabsTrigger value="unscored">
            Pending ({unscored.length})
          </TabsTrigger>
          <TabsTrigger value="scored">
            Completed ({scored.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unscored" className="space-y-4">
          {unscored.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">All submissions have been scored!</p>
              </CardContent>
            </Card>
          ) : (
            unscored.map((submission) => (
              <Card key={submission.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{submission.title}</CardTitle>
                      <CardDescription>
                        by {submission.participantName} • {submission.hackathonName}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Tech Stack</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {submission.techStack.map((tech) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    {submission.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm mt-1 line-clamp-2">{submission.description}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      {submission.githubUrl && (
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          GitHub
                        </a>
                      )}
                      {submission.demoUrl && (
                        <a
                          href={submission.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Demo
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
                <div className="border-t px-6 py-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedSubmission(submission)
                      setScoreData({ innovation: 5, technical: 5, design: 5, impact: 5, presentation: 5, feedback: '' })
                    }}
                  >
                    Score Now <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="scored" className="space-y-4">
          {scored.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No scored submissions yet</p>
              </CardContent>
            </Card>
          ) : (
            scored.map((submission) => (
              <Card key={submission.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{submission.title}</CardTitle>
                      <CardDescription>
                        by {submission.participantName} • {submission.hackathonName}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        {submission.score?.total.toFixed(1)}/10
                      </div>
                      <Badge className="mt-2">Scored</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Innovation</p>
                      <p className="text-lg font-semibold">{submission.score?.innovation}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Technical</p>
                      <p className="text-lg font-semibold">{submission.score?.technical}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Design</p>
                      <p className="text-lg font-semibold">{submission.score?.design}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Impact</p>
                      <p className="text-lg font-semibold">{submission.score?.impact}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Presentation</p>
                      <p className="text-lg font-semibold">{submission.score?.presentation}</p>
                    </div>
                  </div>
                  {submission.score?.feedback && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Feedback</p>
                      <p className="text-sm">{submission.score.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Scoring Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <CardHeader className="sticky top-0 bg-background border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedSubmission.title}</CardTitle>
                  <CardDescription>{selectedSubmission.participantName}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSubmission(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Project Links */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Project Links</Label>
                <div className="flex flex-col gap-2">
                  <a
                    href={selectedSubmission.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    GitHub Repository
                  </a>
                  {selectedSubmission.demoUrl && (
                    <a
                      href={selectedSubmission.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>

              {/* Scoring Rubric */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Scoring Rubric (1-10 scale)</Label>

                {/* Innovation */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Innovation</Label>
                    <span className="text-sm font-semibold">{scoreData.innovation}/10</span>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={scoreData.innovation}
                    onChange={(e) => handleScoreChange('innovation', parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">Creativity and uniqueness of the idea</p>
                </div>

                {/* Technical */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Technical Excellence</Label>
                    <span className="text-sm font-semibold">{scoreData.technical}/10</span>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={scoreData.technical}
                    onChange={(e) => handleScoreChange('technical', parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">Code quality, architecture, and implementation</p>
                </div>

                {/* Design */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Design & UX</Label>
                    <span className="text-sm font-semibold">{scoreData.design}/10</span>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={scoreData.design}
                    onChange={(e) => handleScoreChange('design', parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">User interface and user experience quality</p>
                </div>

                {/* Impact */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Impact & Usefulness</Label>
                    <span className="text-sm font-semibold">{scoreData.impact}/10</span>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={scoreData.impact}
                    onChange={(e) => handleScoreChange('impact', parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">Real-world value and potential impact</p>
                </div>

                {/* Presentation */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Presentation</Label>
                    <span className="text-sm font-semibold">{scoreData.presentation}/10</span>
                  </div>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={scoreData.presentation}
                    onChange={(e) => handleScoreChange('presentation', parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">Clarity of documentation and presentation</p>
                </div>
              </div>

              {/* Overall Score */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Overall Score</span>
                  <span className="text-2xl font-bold">{calculateAverage()}/10</span>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback (optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide constructive feedback for the team..."
                  value={scoreData.feedback}
                  onChange={(e) => setScoreData((prev) => ({ ...prev, feedback: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitScore}
                  disabled={scoring}
                  className="ml-auto"
                >
                  {scoring ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Score'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
