import { prisma } from "@/lib/prisma"

async function seedHackathons() {
  try {
    console.log("Seeding hackathons...")

    // First, get or create an organizer user
    const organizer = await prisma.user.findFirst({
      where: { role: "organizer" },
    })

    if (!organizer) {
      console.error("No organizer user found. Please create an organizer first.")
      process.exit(1)
    }

    const hackathonsData = [
      {
        title: "Bootcamp Hack",
        description: "A comprehensive hackathon for building innovative solutions using modern tech stack.",
        organizer: organizer.name,
        category: "General",
        mode: "Online",
        difficulty: "Intermediate",
        prizeAmount: 5000,
        startDate: new Date("2026-02-04"),
        endDate: new Date("2026-02-06"),
        registrationDeadline: new Date("2026-01-31"),
        banner: "/banner-bootcamp.svg",
        status: "live",
        ownerId: organizer.id,
      },
      {
        title: "AI & ML Challenge",
        description: "Build intelligent solutions using artificial intelligence and machine learning.",
        organizer: organizer.name,
        category: "AI/ML",
        mode: "Hybrid",
        difficulty: "Advanced",
        prizeAmount: 8000,
        startDate: new Date("2026-02-15"),
        endDate: new Date("2026-02-17"),
        registrationDeadline: new Date("2026-02-10"),
        banner: "/banner-ai.svg",
        status: "upcoming",
        ownerId: organizer.id,
      },
      {
        title: "Web Development Sprint",
        description: "Create amazing web applications using React, Node.js, and modern web technologies.",
        organizer: organizer.name,
        category: "Web Development",
        mode: "Online",
        difficulty: "Beginner",
        prizeAmount: 3000,
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-03"),
        registrationDeadline: new Date("2026-02-20"),
        banner: "/banner-web.svg",
        status: "upcoming",
        ownerId: organizer.id,
      },
      {
        title: "Mobile App Hackathon",
        description: "Develop cutting-edge mobile applications for iOS and Android platforms.",
        organizer: organizer.name,
        category: "Mobile",
        mode: "Online",
        difficulty: "Intermediate",
        prizeAmount: 6000,
        startDate: new Date("2026-03-10"),
        endDate: new Date("2026-03-12"),
        registrationDeadline: new Date("2026-03-01"),
        banner: "/banner-mobile.svg",
        status: "upcoming",
        ownerId: organizer.id,
      },
      {
        title: "Cybersecurity Hackathon",
        description: "Challenge yourself by finding vulnerabilities and securing applications.",
        organizer: organizer.name,
        category: "Security",
        mode: "Online",
        difficulty: "Advanced",
        prizeAmount: 7000,
        startDate: new Date("2026-03-20"),
        endDate: new Date("2026-03-22"),
        registrationDeadline: new Date("2026-03-10"),
        banner: "/banner-security.svg",
        status: "upcoming",
        ownerId: organizer.id,
      },
      {
        title: "Cloud & DevOps Challenge",
        description: "Build scalable cloud infrastructure and automate deployment pipelines.",
        organizer: organizer.name,
        category: "DevOps",
        mode: "Hybrid",
        difficulty: "Intermediate",
        prizeAmount: 5500,
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-04-03"),
        registrationDeadline: new Date("2026-03-20"),
        banner: "/banner-cloud.svg",
        status: "upcoming",
        ownerId: organizer.id,
      },
    ]

    for (const hackathonData of hackathonsData) {
      const existing = await prisma.hackathon.findFirst({
        where: { title: hackathonData.title },
      })

      if (existing) {
        console.log(`Hackathon "${hackathonData.title}" already exists. Skipping...`)
        continue
      }

      const hackathon = await prisma.hackathon.create({
        data: hackathonData,
      })

      console.log(`✅ Created hackathon: ${hackathon.title}`)
    }

    console.log("✅ Hackathons seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding hackathons:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedHackathons()
