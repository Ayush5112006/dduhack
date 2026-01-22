import { sponsors } from "@/lib/data"

export function SponsorsSection() {
  return (
    <section className="border-b border-border bg-card py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Trusted by leading companies worldwide
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex h-12 w-24 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-xl font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              {sponsor.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
