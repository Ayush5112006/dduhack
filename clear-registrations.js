const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    const deleted = await prisma.registration.deleteMany({});
    console.log(`Deleted ${deleted.count} registration records.`);
  } catch (error) {
    console.error('Error deleting registrations:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
