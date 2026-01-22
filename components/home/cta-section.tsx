import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Rocket } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 lg:p-16">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-balance text-3xl font-bold text-foreground lg:text-4xl">
              Ready to showcase your skills?
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Join thousands of developers building the future. Find your perfect hackathon, 
              build something amazing, and connect with like-minded innovators.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/hackathons">
                <Button size="lg" className="gap-2">
                  Browse Hackathons <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/organizer/dashboard">
                <Button size="lg" variant="outline">
                  Host a Hackathon
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
