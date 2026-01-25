import { UserPlus, Code2, Send, Trophy } from "lucide-react"

const steps: Array<{
  number: number
  title: string
  description: string
  icon: typeof UserPlus
}> = []

export function HowItWorks() {
  return (
    <section className="border-b border-border bg-card py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">How It Works</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground px-2">
            Your journey from idea to winning project in four simple steps
          </p>
        </div>

        <div className="mt-10 sm:mt-12 md:mt-16 grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-border via-primary/30 to-border lg:block" style={{ left: '75%' }} />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
