"use client"

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
import { CheckCircle2, Circle } from "lucide-react"
import type { Hackathon } from "@/lib/data"

const timeline = [
  { date: "Feb 1, 2026", event: "Registration Opens", status: "completed" },
  { date: "Feb 15, 2026", event: "Registration Closes", status: "completed" },
  { date: "Feb 20, 2026", event: "Hackathon Begins", status: "current" },
  { date: "Feb 21, 2026", event: "Mentor Sessions", status: "upcoming" },
  { date: "Feb 22, 2026", event: "Submissions Due", status: "upcoming" },
  { date: "Feb 25, 2026", event: "Winners Announced", status: "upcoming" },
]

const problemStatements = [
  {
    id: "1",
    title: "AI-Powered Healthcare Assistant",
    description: "Build an AI assistant that helps patients manage their health records, schedule appointments, and get preliminary health advice based on symptoms.",
    difficulty: "Intermediate",
    prize: "$15,000",
  },
  {
    id: "2",
    title: "Smart City Traffic Management",
    description: "Create a system that uses machine learning to optimize traffic flow in urban areas, reducing congestion and emissions.",
    difficulty: "Advanced",
    prize: "$20,000",
  },
  {
    id: "3",
    title: "Accessible Education Platform",
    description: "Develop an inclusive learning platform that adapts to different learning abilities and provides personalized education paths.",
    difficulty: "Beginner",
    prize: "$10,000",
  },
]

const judges = [
  {
    name: "Dr. Sarah Chen",
    role: "AI Research Lead",
    company: "TechCorp",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Michael Rodriguez",
    role: "CTO",
    company: "InnovateLabs",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Emily Watson",
    role: "VP Engineering",
    company: "FutureTech",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
]

const faqs = [
  {
    question: "Who can participate?",
    answer: "Anyone with a passion for technology can participate! Whether you're a student, professional, or hobbyist developer, you're welcome to join. Teams can have 1-4 members.",
  },
  {
    question: "What are the judging criteria?",
    answer: "Projects will be judged on Innovation (25%), Technical Complexity (25%), User Experience (20%), Business Viability (15%), and Presentation (15%).",
  },
  {
    question: "Can I participate solo?",
    answer: "Yes, you can participate as an individual or form a team of up to 4 members. We also have a team formation channel in our Discord server.",
  },
  {
    question: "What should I submit?",
    answer: "You need to submit your source code (GitHub repo), a demo video (max 3 minutes), project documentation, and a live demo link if available.",
  },
  {
    question: "Are there any restrictions on tech stack?",
    answer: "No restrictions! Use whatever technologies, frameworks, and tools you're comfortable with. Just make sure your solution addresses the problem statement effectively.",
  },
]

interface HackathonTabsProps {
  hackathon: Hackathon
}

export function HackathonTabs({ hackathon }: HackathonTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-8 w-full justify-start overflow-x-auto bg-card">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="problems">Problem Statements</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
        <TabsTrigger value="judges">Judges & Mentors</TabsTrigger>
        <TabsTrigger value="faq">FAQ</TabsTrigger>
      </TabsList>

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
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={item.event} className="flex gap-4">
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
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                    <h3 className={`mt-1 font-semibold ${item.status === "current" ? "text-primary" : "text-foreground"}`}>
                      {item.event}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="problems">
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {problemStatements.map((problem) => (
              <AccordionItem key={problem.id} value={problem.id} className="border-border bg-card px-4 mb-4 rounded-lg">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    <div>
                      <h3 className="font-semibold text-foreground">{problem.title}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{problem.difficulty}</Badge>
                        <span className="text-sm text-primary">{problem.prize}</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{problem.description}</p>
                  <Button className="mt-4" size="sm">
                    Choose This Problem
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
        <div className="grid gap-6 md:grid-cols-3">
          {judges.map((judge) => (
            <Card key={judge.name} className="border-border bg-card">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="faq">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
