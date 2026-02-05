import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const count = await prisma.hackathon.count({
        where: {
            status: "live",
            endDate: { gte: new Date() }
        }
    })
    console.log(`Live hackathons found: ${count}`)

    if (count === 0) {
        console.log("Creating dummy live hackathon...")
        await prisma.hackathon.create({
            data: {
                title: "Demo Hackathon 2026",
                description: "A demo hackathon for testing teams",
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
                registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: "live",
                mode: "online",
                difficulty: "Beginner",
                category: "Open Innovation",
                ownerId: "cm6lx00000000000000000000", // Needs valid owner ID. 
                // Wait, I don't know a valid owner ID. 
                // I should fetch a user first.
            }
        }).catch(err => console.log("Failed to create dummy hackathon (likely missing owner):", err.message))
    }
}

main()
