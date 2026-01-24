import bcrypt from 'bcrypt'
import { getPrismaClient } from '../lib/prisma-multi-db'

async function main() {
  console.log('🌱 Seeding databases...\n')

  // =============================================
  // SEED STUDENT DATABASE
  // =============================================
  console.log('📚 Seeding STUDENT database...')
  const studentDb = getPrismaClient('participant')
  
  const studentPassword = await bcrypt.hash('student123', 10)
  
  const student1 = await studentDb.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      email: 'student@test.com',
      name: 'John Student',
      password: studentPassword,
      role: 'participant',
      status: 'active',
    },
  })
  console.log('  ✓ Ensured:', student1.email, '| Password: student123')

  const student2 = await studentDb.user.upsert({
    where: { email: 'jane.student@test.com' },
    update: {},
    create: {
      email: 'jane.student@test.com',
      name: 'Jane Student',
      password: studentPassword,
      role: 'participant',
      status: 'active',
    },
  })
  console.log('  ✓ Ensured:', student2.email, '| Password: student123')

  // =============================================
  // SEED ORGANIZER DATABASE
  // =============================================
  console.log('\n📋 Seeding ORGANIZER database...')
  const organizerDb = getPrismaClient('organizer')
  
  const organizerPassword = await bcrypt.hash('organizer123', 10)
  
  const org1 = await organizerDb.user.upsert({
    where: { email: 'organizer@test.com' },
    update: {},
    create: {
      email: 'organizer@test.com',
      name: 'Tech Company Inc',
      password: organizerPassword,
      role: 'organizer',
      status: 'active',
    },
  })
  console.log('  ✓ Ensured:', org1.email, '| Password: organizer123')

  const org2 = await organizerDb.user.upsert({
    where: { email: 'acme.organizer@test.com' },
    update: {},
    create: {
      email: 'acme.organizer@test.com',
      name: 'ACME Hackathons',
      password: organizerPassword,
      role: 'organizer',
      status: 'active',
    },
  })
  console.log('  ✓ Ensured:', org2.email, '| Password: organizer123')

  // Create hackathons for organizers
  console.log('\n🎯 Creating hackathons for organizers...')
  const now = new Date()
  const regDeadline1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const startDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const endDate1 = new Date(startDate1.getTime() + 2 * 24 * 60 * 60 * 1000)

  const regDeadline2 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)
  const startDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const endDate2 = new Date(startDate2.getTime() + 3 * 24 * 60 * 60 * 1000)

  const regDeadline3 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
  const startDate3 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
  const endDate3 = new Date(startDate3.getTime() + 2 * 24 * 60 * 60 * 1000)

  const hackathon1 = await organizerDb.hackathon.upsert({
    where: { id: 'hackathon-1' },
    update: {},
    create: {
      id: 'hackathon-1',
      title: 'Web Development Challenge 2026',
      organizer: org1.name,
      ownerId: org1.id,
      description: 'Build amazing web applications with modern technologies. Learn React, Next.js, and modern web development practices.',
      category: 'Web Development',
      difficulty: 'Intermediate',
      startDate: startDate1,
      endDate: endDate1,
      registrationDeadline: regDeadline1,
      prizeAmount: 500000,
      location: 'Online',
      mode: 'Online',
    },
  })
  console.log('  ✓ Created:', hackathon1.title)

  const hackathon2 = await organizerDb.hackathon.upsert({
    where: { id: 'hackathon-2' },
    update: {},
    create: {
      id: 'hackathon-2',
      title: 'AI & Machine Learning Hackathon',
      organizer: org2.name,
      ownerId: org2.id,
      description: 'Solve real-world problems using AI and ML. Work with datasets, build models, and create innovative AI solutions.',
      category: 'AI/ML',
      difficulty: 'Advanced',
      startDate: startDate2,
      endDate: endDate2,
      registrationDeadline: regDeadline2,
      prizeAmount: 750000,
      location: 'Online',
      mode: 'Online',
    },
  })
  console.log('  ✓ Created:', hackathon2.title)

  const hackathon3 = await organizerDb.hackathon.upsert({
    where: { id: 'hackathon-3' },
    update: {},
    create: {
      id: 'hackathon-3',
      title: 'Mobile App Innovation Summit',
      organizer: org1.name,
      ownerId: org1.id,
      description: 'Create innovative mobile applications for iOS and Android. Build next-gen mobile experiences.',
      category: 'Mobile',
      difficulty: 'Intermediate',
      startDate: startDate3,
      endDate: endDate3,
      registrationDeadline: regDeadline3,
      prizeAmount: 600000,
      location: 'Bangalore',
      mode: 'Hybrid',
    },
  })
  console.log('  ✓ Created:', hackathon3.title)

  // =============================================
  // SEED ADMIN DATABASE
  // =============================================
  console.log('\n👔 Seeding ADMIN database...')
  const adminDb = getPrismaClient('admin')
  
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await adminDb.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    },
  })
  console.log('  ✓ Ensured:', admin.email, '| Password: admin123')

  const superAdmin = await adminDb.user.upsert({
    where: { email: 'superadmin@test.com' },
    update: {},
    create: {
      email: 'superadmin@test.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    },
  })
  console.log('  ✓ Ensured:', superAdmin.email, '| Password: admin123')

  console.log('\n✅ All databases seeded successfully!\n')
  console.log('═══════════════════════════════════════')
  console.log('📋 TEST CREDENTIALS')
  console.log('═══════════════════════════════════════')
  console.log('\n🎓 STUDENT LOGIN:')
  console.log('  Email: student@test.com')
  console.log('  Password: student123')
  console.log('  Role: Select "Participant / Student"\n')
  
  console.log('📋 ORGANIZER LOGIN:')
  console.log('  Email: organizer@test.com')
  console.log('  Password: organizer123')
  console.log('  Role: Select "Organizer"\n')
  
  console.log('👔 ADMIN LOGIN:')
  console.log('  Email: admin@test.com')
  console.log('  Password: admin123')
  console.log('  Role: Select "Admin"\n')
  console.log('═══════════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    // Close all database connections
    const { closeAllDatabases } = await import('../lib/prisma-multi-db')
    await closeAllDatabases()
  })

