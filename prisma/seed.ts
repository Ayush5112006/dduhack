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
  
  const student1 = await studentDb.user.create({
    data: {
      email: 'student@test.com',
      name: 'John Student',
      password: studentPassword,
      role: 'participant',
      status: 'active',
    },
  })
  console.log('  ✓ Created:', student1.email, '| Password: student123')

  const student2 = await studentDb.user.create({
    data: {
      email: 'jane.student@test.com',
      name: 'Jane Student',
      password: studentPassword,
      role: 'participant',
      status: 'active',
    },
  })
  console.log('  ✓ Created:', student2.email, '| Password: student123')

  // =============================================
  // SEED ORGANIZER DATABASE
  // =============================================
  console.log('\n📋 Seeding ORGANIZER database...')
  const organizerDb = getPrismaClient('organizer')
  
  const organizerPassword = await bcrypt.hash('organizer123', 10)
  
  const org1 = await organizerDb.user.create({
    data: {
      email: 'organizer@test.com',
      name: 'Tech Company Inc',
      password: organizerPassword,
      role: 'organizer',
      status: 'active',
    },
  })
  console.log('  ✓ Created:', org1.email, '| Password: organizer123')

  const org2 = await organizerDb.user.create({
    data: {
      email: 'acme.organizer@test.com',
      name: 'ACME Hackathons',
      password: organizerPassword,
      role: 'organizer',
      status: 'active',
    },
  })
  console.log('  ✓ Created:', org2.email, '| Password: organizer123')

  // =============================================
  // SEED ADMIN DATABASE
  // =============================================
  console.log('\n👔 Seeding ADMIN database...')
  const adminDb = getPrismaClient('admin')
  
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await adminDb.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    },
  })
  console.log('  ✓ Created:', admin.email, '| Password: admin123')

  const superAdmin = await adminDb.user.create({
    data: {
      email: 'superadmin@test.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    },
  })
  console.log('  ✓ Created:', superAdmin.email, '| Password: admin123')

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

