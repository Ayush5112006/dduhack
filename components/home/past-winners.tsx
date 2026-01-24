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
    <section className="border-b border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Past Winners</h2>
            <p className="mt-2 text-muted-foreground">
              Be inspired by the teams who built amazing projects
            </p>
          </div>
        </div>

        {winners.length === 0 ? (
          <div className="mt-10 py-12 text-center">
            <p className="text-muted-foreground">No winners data available yet</p>
          </div>
        ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {winners.map((winner, index) => (
            <Card
              key={winner.name}
              className={`border-border bg-card transition-all ${
                index === currentIndex ? "ring-2 ring-primary md:ring-0" : ""
              }`}
            >
              <div className="p-6">
                <p className="font-semibold text-foreground">{winner.name}</p>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}
