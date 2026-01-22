import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedHackathons } from "@/components/home/featured-hackathons"
import { CategoriesSection } from "@/components/home/categories-section"
import { HowItWorks } from "@/components/home/how-it-works"
import { PastWinners } from "@/components/home/past-winners"
import { SponsorsSection } from "@/components/home/sponsors-section"
import { CTASection } from "@/components/home/cta-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedHackathons />
        <CategoriesSection />
        <HowItWorks />
        <PastWinners />
        <SponsorsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
