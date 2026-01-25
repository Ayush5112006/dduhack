"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 lg:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Over 500+ hackathons hosted this year</span>
          </div>
          
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            Find Your Next{" "}
            <span className="text-primary">Step</span>
          </h1>
          
          <p className="mt-4 sm:mt-6 text-pretty text-base sm:text-lg text-muted-foreground lg:text-xl px-2">
            Discover thousands of hackathons worldwide. Build innovative projects, 
            connect with developers, and win amazing prizes.
          </p>
          
          <div className="mt-8 sm:mt-10">
            <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row px-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search hackathons..."
                  className="h-12 sm:h-12 w-full bg-secondary pl-12 pr-4 text-base touch-manipulation"
                />
              </div>
              <Link href="/hackathons" className="w-full sm:w-auto">
                <Button size="lg" className="h-12 gap-2 px-6 w-full sm:w-auto touch-manipulation">
                  <SlidersHorizontal className="h-4 w-4" />
                  Browse All
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground px-2">
              <span>Popular:</span>
              <Link href="/hackathons?category=ai" className="rounded-full bg-secondary px-3 py-1.5 transition-colors hover:bg-secondary/80 hover:text-foreground touch-manipulation">
                AI
              </Link>
              <Link href="/hackathons?category=web" className="rounded-full bg-secondary px-3 py-1.5 transition-colors hover:bg-secondary/80 hover:text-foreground touch-manipulation">
                Web3
              </Link>
              <Link href="/hackathons?category=mobile" className="rounded-full bg-secondary px-3 py-1.5 transition-colors hover:bg-secondary/80 hover:text-foreground touch-manipulation">
                Mobile
              </Link>
              <Link href="/hackathons?category=security" className="rounded-full bg-secondary px-3 py-1.5 transition-colors hover:bg-secondary/80 hover:text-foreground touch-manipulation">
                Security
              </Link>
            </div>
          </div>
          
          <div className="mt-12 sm:mt-16 grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 md:grid-cols-4 px-2">
            <div>
              <div className="text-3xl font-bold text-foreground">500+</div>
              <div className="mt-1 text-sm text-muted-foreground">Active Hackathons</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">100K+</div>
              <div className="mt-1 text-sm text-muted-foreground">Developers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">$5M+</div>
              <div className="mt-1 text-sm text-muted-foreground">Prizes Awarded</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">50+</div>
              <div className="mt-1 text-sm text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
