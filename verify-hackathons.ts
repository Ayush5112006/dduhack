import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    const hackathons = await prisma.hackathon.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
      },
    })

    console.log("\n📊 Hackathons in database:")
    console.log(`Found ${hackathons.length} hackathons\n`)
    hackathons.forEach((h) => {
      console.log(`  • ${h.title} (${h.status}) - ${h.startDate.toISOString()}`)
    })

    if (hackathons.length === 0) {
      console.log("❌ No hackathons found!")
    } else {
      console.log("\n✅ Hackathons exist in database!")
    }
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
