const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.log("Please provide an email address.")
        console.log("Usage: node scripts/make-admin.js <email>")
        return
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'admin' }
        })
        console.log(`User ${user.email} is now an ADMIN.`)
    } catch (error) {
        console.error("Error updating user:", error.message)
    }
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
