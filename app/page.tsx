import dynamicImport from "next/dynamic"

import { Footer } from "@/components/footer"
import { LazySection } from "@/components/home/lazy-section"

export const revalidate = 300

const HeroSection = dynamicImport(
  () => import("@/components/home/hero-section").then((m) => ({ default: m.HeroSection })),
  { loading: () => <SectionSkeleton height="lg" /> }
)

const FeaturedHackathons = dynamicImport(
  () => import("@/components/home/featured-hackathons").then((m) => ({ default: m.FeaturedHackathons })),
  { loading: () => <SectionSkeleton /> }
)

const CategoriesSection = dynamicImport(
  () => import("@/components/home/categories-section").then((m) => ({ default: m.CategoriesSection })),
  { loading: () => <SectionSkeleton /> }
)

const HowItWorks = dynamicImport(
  () => import("@/components/home/how-it-works").then((m) => ({ default: m.HowItWorks })),
  { loading: () => <SectionSkeleton /> }
)

const PastWinners = dynamicImport(
  () => import("@/components/home/past-winners").then((m) => ({ default: m.PastWinners })),
  { loading: () => <SectionSkeleton /> }
)

const SponsorsSection = dynamicImport(
  () => import("@/components/home/sponsors-section").then((m) => ({ default: m.SponsorsSection })),
  { loading: () => <SectionSkeleton /> }
)

const CTASection = dynamicImport(
  () => import("@/components/home/cta-section").then((m) => ({ default: m.CTASection })),
  { loading: () => <SectionSkeleton /> }
)

function SectionSkeleton({ height = "md" }: { height?: "md" | "lg" }) {
  const h = height === "lg" ? "min-h-[320px]" : "min-h-[240px]"
  return (
    <div className={`mx-4 my-6 rounded-2xl border border-border bg-card/40 p-6 shadow-sm animate-pulse ${h}`}>
      <div className="h-6 w-40 rounded-md bg-muted" />
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="h-24 rounded-md bg-muted/70" />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar handled by MainLayout */}
      <div className="flex-1 w-full">
        <HeroSection />
        <LazySection fallback={<SectionSkeleton />}>
          <FeaturedHackathons />
        </LazySection>
        <LazySection fallback={<SectionSkeleton />} rootMargin="150px">
          <CategoriesSection />
        </LazySection>
        <LazySection fallback={<SectionSkeleton />} rootMargin="150px">
          <HowItWorks />
        </LazySection>
        <LazySection fallback={<SectionSkeleton />} rootMargin="150px">
          <PastWinners />
        </LazySection>
        <LazySection fallback={<SectionSkeleton />} rootMargin="150px">
          <SponsorsSection />
        </LazySection>
        <LazySection fallback={<SectionSkeleton />} rootMargin="200px">
          <CTASection />
        </LazySection>
      </div>
      <Footer />
    </div>
  )
}
