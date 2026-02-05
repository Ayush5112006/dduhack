import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Rocket } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-background py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card p-6 sm:p-8 lg:p-16">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Rocket className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h2 className="text-balance text-2xl sm:text-3xl font-bold text-foreground lg:text-4xl">
              Ready to showcase your skills?
            </h2>
            <p className="mt-4 text-pretty text-sm sm:text-base text-muted-foreground px-2">
              Join thousands of developers building the future. Find your perfect hackathon,
              build something amazing, and connect with like-minded innovators.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col justify-center gap-3 sm:gap-4 sm:flex-row px-2">
              <Button asChild size="lg" className="gap-2 h-12 w-full sm:w-auto touch-manipulation">
                <Link href="/hackathons">
                  Browse Hackathons <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 w-full sm:w-auto touch-manipulation">
                <Link href="/organizer/dashboard">
                  Host a Hackathon
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
