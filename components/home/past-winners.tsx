"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { winners } from "@/lib/data"
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function PastWinners() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % winners.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + winners.length) % winners.length)
  }

  return (
    <section className="border-b border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Past Winners</h2>
            <p className="mt-2 text-muted-foreground">
              Be inspired by the teams who built amazing projects
            </p>
          </div>
          <div className="hidden gap-2 md:flex">
            <Button variant="outline" size="icon" onClick={prevSlide} aria-label="Previous winner">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextSlide} aria-label="Next winner">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {winners.map((winner, index) => (
            <Card
              key={winner.name}
              className={`border-border bg-card transition-all ${
                index === currentIndex ? "ring-2 ring-primary md:ring-0" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src={winner.avatar || "/placeholder.svg"}
                      alt={winner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{winner.name}</h3>
                    <p className="text-sm text-muted-foreground">{winner.hackathon}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground">{winner.project}</p>
                  <div className="mt-3 flex items-center gap-1 text-primary">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm font-semibold">{winner.prize}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2 md:hidden">
          <Button variant="outline" size="icon" onClick={prevSlide} aria-label="Previous winner">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextSlide} aria-label="Next winner">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
