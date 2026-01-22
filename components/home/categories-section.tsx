import Link from "next/link"
import { Brain, Globe, Smartphone, Blocks, Shield, Cpu } from "lucide-react"
import { categories } from "@/lib/data"

const iconMap = {
  Brain: Brain,
  Globe: Globe,
  Smartphone: Smartphone,
  Blocks: Blocks,
  Shield: Shield,
  Cpu: Cpu,
}

export function CategoriesSection() {
  return (
    <section className="border-b border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">Browse by Category</h2>
          <p className="mt-2 text-muted-foreground">
            Find hackathons that match your interests and skills
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap]
            return (
              <Link
                key={category.name}
                href={`/hackathons?category=${category.name.toLowerCase().replace(" & ", "-")}`}
                className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-card/80"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${category.color}`}>
                  <Icon className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-foreground">{category.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{category.count} hackathons</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
