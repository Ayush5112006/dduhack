"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, Lightbulb } from "lucide-react"
import Link from "next/link"

interface ProblemStatement {
  id: string
  title: string
  description: string
  domain: string
  difficulty: string
  bounty?: number
}

const HACKATHON_WITH_PROBLEMS = {
  id: "bootcamp-hack",
  title: "Bootcamp Hack",
  organizer: "Organizer One",
  problemStatements: [
    {
      id: "ps-1",
      title: "Smart Healthcare Monitoring System",
      description: "Build a wearable-integrated health monitoring system that tracks vital signs and predicts health anomalies using AI.",
      domain: "Health",
      difficulty: "Advanced",
      bounty: 5000,
    },
    {
      id: "ps-2",
      title: "Online Learning Platform Optimization",
      description: "Create an intelligent tutoring system that adapts to individual student learning patterns.",
      domain: "Education",
      difficulty: "Intermediate",
      bounty: 3000,
    },
    {
      id: "ps-3",
      title: "FinTech Payment Gateway",
      description: "Develop a secure, scalable payment gateway with multi-currency support and fraud detection.",
      domain: "FinTech",
      difficulty: "Advanced",
      bounty: 7000,
    },
    {
      id: "ps-4",
      title: "Environmental Carbon Footprint Tracker",
      description: "Build an application to track and reduce personal and corporate carbon footprints.",
      domain: "Environment",
      difficulty: "Intermediate",
      bounty: 3500,
    },
    {
      id: "ps-5",
      title: "Smart City Traffic Management",
      description: "Create a real-time traffic prediction and optimization system using IoT and machine learning.",
      domain: "Smart Cities",
      difficulty: "Advanced",
      bounty: 6000,
    },
    {
      id: "ps-6",
      title: "Open Innovation Challenge",
      description: "Propose your own innovative solution to any real-world problem.",
      domain: "Open Innovation",
      difficulty: "Beginner",
      bounty: 2000,
    },
  ],
}

interface ProblemSelectorProps {
  onSelect?: (problem: ProblemStatement) => void
}

export function ProblemStatementSelector({ onSelect }: ProblemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [selectedProblem, setSelectedProblem] = useState<ProblemStatement | null>(null)

  const domains = ["Health", "Education", "FinTech", "Environment", "Smart Cities", "Open Innovation"]

  const filteredProblems = HACKATHON_WITH_PROBLEMS.problemStatements.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDomain = !selectedDomain || problem.domain === selectedDomain
    return matchesSearch && matchesDomain
  })

  const handleSelectProblem = (problem: ProblemStatement) => {
    setSelectedProblem(problem)
    if (onSelect) {
      onSelect(problem)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {HACKATHON_WITH_PROBLEMS.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Choose a problem statement or propose your own innovation
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary">{HACKATHON_WITH_PROBLEMS.problemStatements.length} Problem Statements</Badge>
            <Badge variant="outline">Prizes: Up to ${Math.max(...HACKATHON_WITH_PROBLEMS.problemStatements.map(p => p.bounty || 0))}</Badge>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search problem statements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedDomain === null ? "default" : "outline"}
              onClick={() => setSelectedDomain(null)}
              size="sm"
            >
              All Domains
            </Button>
            {domains.map(domain => (
              <Button
                key={domain}
                variant={selectedDomain === domain ? "default" : "outline"}
                onClick={() => setSelectedDomain(domain)}
                size="sm"
              >
                {domain}
              </Button>
            ))}
          </div>
        </div>

        {/* Problem Statements Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {filteredProblems.length > 0 ? (
            filteredProblems.map(problem => (
              <Card
                key={problem.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedProblem?.id === problem.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleSelectProblem(problem)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{problem.title}</CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {problem.domain}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {problem.difficulty}
                          </Badge>
                        </div>
                      </CardDescription>
                    </div>
                    {selectedProblem?.id === problem.id && (
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {problem.description}
                  </p>
                  {problem.bounty && (
                    <div className="text-sm font-semibold text-emerald-600">
                      Prize: ${problem.bounty}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No problems match your search criteria</p>
            </div>
          )}
        </div>

        {/* Selection Summary and CTA */}
        {selectedProblem && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Selected Problem Statement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{selectedProblem.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{selectedProblem.description}</p>
              </div>
              <div className="flex gap-4">
                <Badge variant="secondary">{selectedProblem.domain}</Badge>
                <Badge variant="outline">{selectedProblem.difficulty}</Badge>
                {selectedProblem.bounty && (
                  <Badge variant="default" className="bg-emerald-500">
                    ${selectedProblem.bounty} Prize
                  </Badge>
                )}
              </div>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href={`/dashboard/hackathons/register?problemId=${selectedProblem.id}&hackathon=${HACKATHON_WITH_PROBLEMS.id}`}>
                    Continue to Registration <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProblem(null)}
                >
                  Choose Different Problem
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
