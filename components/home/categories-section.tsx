import Link from "next/link"
import { Brain, Globe, Smartphone, Blocks, Shield, Cpu } from "lucide-react"
import { categories, hackathons } from "@/lib/data"

const iconMap: Record<string, any> = {
  AI: Brain,
  Blockchain: Globe,
  Web: Globe,
  Mobile: Smartphone,
  Security: Shield,
  IoT: Cpu,
}

const colorMap: Record<string, string> = {
  AI: "from-purple-400 to-purple-600",
  Blockchain: "from-blue-400 to-blue-600",
  Web: "from-green-400 to-green-600",
  Mobile: "from-orange-400 to-orange-600",
  Security: "from-red-400 to-red-600",
  IoT: "from-cyan-400 to-cyan-600",
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
            const Icon = iconMap[category] || Brain
            const count = hackathons.filter((h) => h.category === category).length
            return (
              <Link
                key={category}
                href={`/hackathons?category=${category.toLowerCase()}`}
                className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:bg-card/80"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[category] || "from-gray-400 to-gray-600"}`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-foreground">{category}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{count} hackathons</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
