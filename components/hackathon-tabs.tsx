"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CheckCircle2, Circle, Plus, Edit, Trash2, Download, Upload } from "lucide-react"
import type { Hackathon } from "@/lib/data"

interface HackathonTabsProps {
  hackathon: Hackathon
  isOrganizer?: boolean
}

export function HackathonTabs({ hackathon, isOrganizer = false }: HackathonTabsProps) {
  const [timeline, setTimeline] = useState<any[]>([])
  const [problemStatements, setProblemStatements] = useState<any[]>([])
  const [judges, setJudges] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])

  // Timeline Management
  const handleAddTimelineEvent = () => {
    const date = prompt("Enter event date (e.g., Jan 15, 2024):")
    const event = prompt("Enter event name:")
    if (date && event) {
      setTimeline([...timeline, { date, event, status: "upcoming" }])
    }
  }

  const handleEditTimelineEvent = (index: number) => {
    const item = timeline[index]
    const date = prompt("Edit event date:", item.date)
    const event = prompt("Edit event name:", item.event)
    if (date && event) {
      const updated = [...timeline]
      updated[index] = { ...item, date, event }
      setTimeline(updated)
    }
  }

  const handleDeleteTimelineEvent = (index: number) => {
    if (confirm("Delete this event?")) {
      setTimeline(timeline.filter((_, i) => i !== index))
    }
  }

  // Problem Statements Management
  const handleAddProblem = () => {
    const title = prompt("Enter problem title:")
    const description = prompt("Enter problem description:")
    const difficulty = prompt("Enter difficulty (Easy/Medium/Hard):")
    const prize = prompt("Enter prize amount:")
    if (title && description && difficulty && prize) {
      setProblemStatements([
        ...problemStatements,
        { id: Math.random().toString(36).substring(2, 11), title, description, difficulty, prize }
      ])
    }
  }

  const handleEditProblem = (index: number) => {
    const problem = problemStatements[index]
    const title = prompt("Edit problem title:", problem.title)
    const description = prompt("Edit description:", problem.description)
    const difficulty = prompt("Edit difficulty:", problem.difficulty)
    const prize = prompt("Edit prize:", problem.prize)
    if (title && description && difficulty && prize) {
      const updated = [...problemStatements]
      updated[index] = { ...problem, title, description, difficulty, prize }
      setProblemStatements(updated)
    }
  }

  const handleDeleteProblem = (index: number) => {
    if (confirm("Delete this problem statement?")) {
      setProblemStatements(problemStatements.filter((_, i) => i !== index))
    }
  }

  // Judges Management
  const handleAddJudge = () => {
    const name = prompt("Enter judge name:")
    const role = prompt("Enter judge role:")
    const company = prompt("Enter company:")
    const avatar = prompt("Enter avatar URL (optional):")
    if (name && role && company) {
      setJudges([...judges, { name, role, company, avatar: avatar || "/placeholder.svg" }])
    }
  }

  const handleEditJudge = (index: number) => {
    const judge = judges[index]
    const name = prompt("Edit judge name:", judge.name)
    const role = prompt("Edit role:", judge.role)
    const company = prompt("Edit company:", judge.company)
    if (name && role && company) {
      const updated = [...judges]
      updated[index] = { ...judge, name, role, company }
      setJudges(updated)
    }
  }

  const handleDeleteJudge = (index: number) => {
    if (confirm("Delete this judge?")) {
      setJudges(judges.filter((_, i) => i !== index))
    }
  }

  // FAQ Management
  const handleAddFaq = () => {
    const question = prompt("Enter FAQ question:")
    const answer = prompt("Enter FAQ answer:")
    if (question && answer) {
      setFaqs([...faqs, { question, answer }])
    }
  }

  const handleEditFaq = (index: number) => {
    const faq = faqs[index]
    const question = prompt("Edit question:", faq.question)
    const answer = prompt("Edit answer:", faq.answer)
    if (question && answer) {
      const updated = [...faqs]
      updated[index] = { question, answer }
      setFaqs(updated)
    }
  }

  const handleDeleteFaq = (index: number) => {
    if (confirm("Delete this FAQ?")) {
      setFaqs(faqs.filter((_, i) => i !== index))
    }
  }

  // Export/Import functionality
  const handleExportData = () => {
    const data = { timeline, problemStatements, judges, faqs }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hackathon-${hackathon.id}-data.json`
    a.click()
    alert("Data exported successfully!")
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.timeline) setTimeline(data.timeline)
          if (data.problemStatements) setProblemStatements(data.problemStatements)
          if (data.judges) setJudges(data.judges)
          if (data.faqs) setFaqs(data.faqs)
          alert("Data imported successfully!")
        } catch (error) {
          alert("Error importing data. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <TabsList className="w-full justify-start overflow-x-auto bg-card">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="problems">Problem Statements</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="judges">Judges & Mentors</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        {isOrganizer && (
          <div className="ml-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportData}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        )}
      </div>

      <TabsContent value="overview" className="space-y-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>About This Hackathon</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-muted-foreground">
              {hackathon.description}
            </p>
            <p className="mt-4 text-muted-foreground">
              Join thousands of developers, designers, and innovators from around the world in this 
              exciting hackathon. Whether you&apos;re a seasoned professional or just starting out, 
              this is your chance to build something amazing, learn new skills, and connect with 
              like-minded individuals.
            </p>
            <h3 className="mt-6 text-lg font-semibold text-foreground">What you&apos;ll gain:</h3>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li>Hands-on experience building real-world solutions</li>
              <li>Networking opportunities with industry experts</li>
              <li>Mentorship from experienced professionals</li>
              <li>A chance to win amazing prizes</li>
              <li>Portfolio-worthy project experience</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Tags & Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hackathon.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Event Timeline</CardTitle>
            {isOrganizer && (
              <Button size="sm" onClick={handleAddTimelineEvent}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No timeline events yet</p>
            ) : (
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : item.status === "current" ? (
                        <div className="h-6 w-6 rounded-full border-2 border-primary bg-primary/20" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                      {index < timeline.length - 1 && (
                        <div className={`mt-2 h-12 w-0.5 ${item.status === "completed" ? "bg-green-500" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                          <h3 className={`mt-1 font-semibold ${item.status === "current" ? "text-primary" : "text-foreground"}`}>
                            {item.event}
                          </h3>
                        </div>
                        {isOrganizer && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditTimelineEvent(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteTimelineEvent(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="problems">
        <div className="space-y-4">
          {isOrganizer && (
            <Button onClick={handleAddProblem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Problem Statement
            </Button>
          )}
          {problemStatements.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">No problem statements yet</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {problemStatements.map((problem, index) => (
                <AccordionItem key={problem.id} value={problem.id} className="border-border bg-card px-4 mb-4 rounded-lg">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{problem.title}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{problem.difficulty}</Badge>
                          <span className="text-sm text-primary">{problem.prize}</span>
                        </div>
                      </div>
                      {isOrganizer && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="ghost" onClick={() => handleEditProblem(index)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteProblem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{problem.description}</p>
                    {!isOrganizer && (
                      <Button className="mt-4" size="sm">
                        Choose This Problem
                      </Button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </TabsContent>

      <TabsContent value="rules">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Rules & Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <h3 className="text-lg font-semibold text-foreground">Eligibility</h3>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li>Open to all developers, designers, and tech enthusiasts worldwide</li>
              <li>Teams can have 1-4 members</li>
              <li>All team members must register individually</li>
            </ul>

            <h3 className="mt-6 text-lg font-semibold text-foreground">Project Requirements</h3>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li>Projects must be started after the hackathon begins</li>
              <li>Use of open-source libraries and APIs is allowed</li>
              <li>Projects must address one of the given problem statements</li>
              <li>All code must be submitted via GitHub</li>
            </ul>

            <h3 className="mt-6 text-lg font-semibold text-foreground">Submission Requirements</h3>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li>Working demo or prototype</li>
              <li>Source code repository (GitHub)</li>
              <li>Demo video (max 3 minutes)</li>
              <li>Project documentation</li>
            </ul>

            <h3 className="mt-6 text-lg font-semibold text-foreground">Code of Conduct</h3>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              <li>Be respectful to all participants and organizers</li>
              <li>No plagiarism or copying existing solutions</li>
              <li>Follow fair play guidelines</li>
              <li>Harassment of any kind will not be tolerated</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="judges">
        {isOrganizer && (
          <Button className="mb-4" onClick={handleAddJudge}>
            <Plus className="mr-2 h-4 w-4" />
            Add Judge
          </Button>
        )}
        {judges.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No judges added yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {judges.map((judge, index) => (
              <Card key={index} className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full">
                    <Image
                      src={judge.avatar || "/placeholder.svg"}
                      alt={judge.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{judge.name}</h3>
                  <p className="text-sm text-muted-foreground">{judge.role}</p>
                  <p className="text-sm text-primary">{judge.company}</p>
                  {isOrganizer && (
                    <div className="mt-4 flex justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditJudge(index)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteJudge(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="faq">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Frequently Asked Questions</CardTitle>
            {isOrganizer && (
              <Button size="sm" onClick={handleAddFaq}>
                <Plus className="mr-2 h-4 w-4" />
                Add FAQ
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {faqs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No FAQs yet</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-foreground">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>{faq.question}</span>
                        {isOrganizer && (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" onClick={() => handleEditFaq(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteFaq(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
