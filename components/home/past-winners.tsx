"use client"

import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function PastWinners() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const winners: any[] = []

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, winners.length))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, winners.length)) % Math.max(1, winners.length))
  }

  return (
    <section className="border-b border-border bg-background py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Past Winners</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground px-0">
              Be inspired by the teams who built amazing projects
            </p>
          </div>
        </div>

        {winners.length === 0 ? (
          <div className="mt-8 sm:mt-10 py-12 text-center">
            <p className="text-muted-foreground">No winners data available yet</p>
          </div>
        ) : (
        <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {winners.map((winner, index) => (
            <Card
              key={winner.name}
              className={`border-border bg-card transition-all ${
                index === currentIndex ? "ring-2 ring-primary md:ring-0" : ""
              }`}
            >
              <div className="p-4 sm:p-6">
                <p className="font-semibold text-foreground">{winner.name}</p>
              </div>
            </Card>
          ))}
        </div>
        )}

        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 md:hidden">
          <Button
            size="sm"
            variant="outline"
            onClick={prevSlide}
            className="h-10 w-10 p-0"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            {Math.max(1, currentIndex + 1)} / {Math.max(1, winners.length)}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={nextSlide}
            className="h-10 w-10 p-0"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
