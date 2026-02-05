import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('🌱 Seeding database...\n')

  const prisma = new PrismaClient()

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
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

  // Organizer user and demo hackathon
  const organizerPassword = await bcrypt.hash('organizer123', 10)
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@test.com' },
    update: {},
    create: {
      email: 'organizer@test.com',
      name: 'Organizer One',
      password: organizerPassword,
      role: 'organizer',
      status: 'active',
    },
  })

  // Participant user
  const participantPassword = await bcrypt.hash('participant123', 10)
  const participant = await prisma.user.upsert({
    where: { email: 'participant@test.com' },
    update: {},
    create: {
      email: 'participant@test.com',
      name: 'Participant One',
      password: participantPassword,
      role: 'participant',
      status: 'active',
    },
  })

  // Student user
  const studentPassword = await bcrypt.hash('student123', 10)
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      email: 'student@test.com',
      name: 'Student One',
      password: studentPassword,
      role: 'participant',
      status: 'active',
    },
  })

  const now = new Date()
  const oneDay = 1000 * 60 * 60 * 24

  const hackathon = await prisma.hackathon.upsert({
    where: { id: 'demo-hackathon-1' },
    update: {},
    create: {
      id: 'demo-hackathon-1',
      title: 'Demo Hackathon',
      organizer: 'Organizer One',
      ownerId: organizer.id,
      banner: null,
      description: 'Sample event for testing organizer dashboard.',
      prize: 'Goodies',
      prizeAmount: 1000,
      mode: 'Online',
      location: 'Remote',
      category: 'Innovation',
      tags: '["demo","sample"]',
      difficulty: 'Beginner',
      registrationDeadline: new Date(now.getTime() + oneDay * 7),
      startDate: new Date(now.getTime() + oneDay * 8),
      endDate: new Date(now.getTime() + oneDay * 15),
      status: 'live',
      allowTeams: true,
      minTeamSize: 1,
      maxTeamSize: 5,
      allowSoloSubmission: true,
      featured: true,
      participants: 10,
    },
  })

  const registration = await prisma.registration.upsert({
    where: { id: 'demo-registration-1' },
    update: {},
    create: {
      id: 'demo-registration-1',
      hackathonId: hackathon.id,
      userId: participant.id,
      userEmail: participant.email,
      mode: 'individual',
      status: 'approved',
      consent: true,
      fullName: participant.name,
      phone: '1234567890',
    },
  })

  const team = await prisma.team.upsert({
    where: { id: 'demo-team-1' },
    update: {},
    create: {
      id: 'demo-team-1',
      hackathonId: hackathon.id,
      name: 'Team Demo',
      code: 'DEMOTEAM',
      leaderId: participant.id,
      leaderEmail: participant.email,
      locked: false,
    },
  })

  await prisma.teamMember.upsert({
    where: { id: 'demo-team-member-1' },
    update: {},
    create: {
      id: 'demo-team-member-1',
      teamId: team.id,
      userId: participant.id,
      email: participant.email,
      status: 'joined',
      role: 'leader',
    },
  })

  await prisma.submission.upsert({
    where: { id: 'demo-submission-1' },
    update: {},
    create: {
      id: 'demo-submission-1',
      hackathonId: hackathon.id,
      teamId: team.id,
      userId: participant.id,
      userEmail: participant.email,
      title: 'Demo Project',
      description: 'Sample submission for activity feed.',
      github: 'https://github.com/example/demo',
      status: 'submitted',
    },
  })

  console.log('  ✓ Admin:', admin.email, '| Password: admin123')
  console.log('  ✓ Organizer:', organizer.email, '| Password: organizer123')
  console.log('  ✓ Participant:', participant.email, '| Password: participant123')
  console.log('  ✓ Student:', student.email, '| Password: student123')
  console.log('  ✓ Hackathon:', hackathon.title)
  console.log('  ✓ Registration ID:', registration.id)
  console.log('  ✓ Submission and team seeded')

  console.log('\n✅ Database seeded successfully!\n')
  console.log('═══════════════════════════════════════')
  console.log('👔 ADMIN LOGIN: admin@test.com / admin123 (role Admin)')
  console.log('🧭 ORGANIZER LOGIN: organizer@test.com / organizer123 (role Organizer)')
  console.log('🙋 PARTICIPANT LOGIN: participant@test.com / participant123 (role Participant)')
  console.log('👨‍🎓 STUDENT LOGIN: student@test.com / student123 (role Participant)')
  console.log('═══════════════════════════════════════\n')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('❌ Error seeding database:', e)
  process.exit(1)
})

