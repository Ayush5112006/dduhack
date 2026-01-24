import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dduhack.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    },
  })
  console.log('✓ Admin user created:', admin.email)

  // Create organizer users
  const orgPassword = await bcrypt.hash('org123', 10)
  const org1 = await prisma.user.create({
    data: {
      email: 'org1@dduhack.com',
      name: 'OpenAI Labs',
      password: orgPassword,
      role: 'organizer',
      status: 'active',
    },
  })

  const org2 = await prisma.user.create({
    data: {
      email: 'org2@dduhack.com',
      name: 'Vercel Team',
      password: orgPassword,
      role: 'organizer',
      status: 'active',
    },
  })
  console.log('✓ Organizer users created')

  // Create participant users
  const userPassword = await bcrypt.hash('user123', 10)
  const participant1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: 'John Doe',
      password: userPassword,
      role: 'participant',
      status: 'active',
    },
  })

  const participant2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'Jane Smith',
      password: userPassword,
      role: 'participant',
      status: 'active',
    },
  })
  console.log('✓ Participant users created')

  // Create judge user
  const judge = await prisma.user.create({
    data: {
      email: 'judge@dduhack.com',
      name: 'Judge Expert',
      password: await bcrypt.hash('judge123', 10),
      role: 'judge',
      status: 'active',
    },
  })
  console.log('✓ Judge user created')

  // Create hackathons
  const now = new Date()
  const hackathon1 = await prisma.hackathon.create({
    data: {
      title: 'Global AI Innovation Summit',
      organizer: 'OpenAI Labs',
      ownerId: org1.id,
      banner: '/placeholder.svg',
      prize: '$25,000',
      prizeAmount: 25000,
      mode: 'Hybrid',
      location: 'San Francisco + Remote',
      registrationDeadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000),
      category: 'AI',
      tags: '["AI","ML","LLM","Data"]',
      difficulty: 'Advanced',
      isFree: true,
      featured: true,
      description: 'Build production-ready AI apps using cutting-edge foundation models, agents, and retrieval.',
      eligibility: 'Open for all',
      status: 'upcoming',
      participants: 3200,
    },
  })

  const hackathon2 = await prisma.hackathon.create({
    data: {
      title: 'Web Crafters Championship',
      organizer: 'Vercel + Cloudflare',
      ownerId: org2.id,
      banner: '/placeholder.svg',
      prize: '$15,000',
      prizeAmount: 15000,
      mode: 'Online',
      location: 'Global',
      registrationDeadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      startDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000),
      category: 'Web',
      tags: '["Next.js","Edge","Performance","UI/UX"]',
      difficulty: 'Intermediate',
      isFree: true,
      featured: true,
      description: 'Ship blazing-fast web experiences with edge rendering, streaming, and AI UX.',
      eligibility: 'Open for all',
      status: 'live',
      participants: 5400,
    },
  })
  console.log('✓ Hackathons created')

  // Create problem statements
  await prisma.problemStatement.create({
    data: {
      hackathonId: hackathon1.id,
      title: 'Build an AI Chatbot',
      description: 'Create an intelligent chatbot powered by LLMs',
      difficulty: 'Medium',
      prize: '$5,000',
      dataset: 'https://example.com/dataset',
    },
  })

  await prisma.problemStatement.create({
    data: {
      hackathonId: hackathon2.id,
      title: 'Performance Optimization',
      description: 'Optimize a web app for lightning-fast performance',
      difficulty: 'Hard',
      prize: '$4,000',
    },
  })
  console.log('✓ Problem statements created')

  // Create registrations
  await prisma.registration.create({
    data: {
      hackathonId: hackathon1.id,
      userId: participant1.id,
      userEmail: participant1.email,
      mode: 'individual',
      status: 'approved',
      consent: true,
      formData: '{}',
    },
  })

  await prisma.registration.create({
    data: {
      hackathonId: hackathon2.id,
      userId: participant2.id,
      userEmail: participant2.email,
      mode: 'individual',
      status: 'approved',
      consent: true,
      formData: '{}',
    },
  })
  console.log('✓ Registrations created')

  // Create submissions
  const submission1 = await prisma.submission.create({
    data: {
      hackathonId: hackathon1.id,
      userId: participant1.id,
      userEmail: participant1.email,
      title: 'AI Chat Assistant',
      description: 'A modern AI chatbot with natural language understanding',
      github: 'https://github.com/user1/ai-chat',
      demo: 'https://ai-chat-demo.com',
      techStack: '["Node.js","LLM API","React"]',
      status: 'submitted',
    },
  })

  const submission2 = await prisma.submission.create({
    data: {
      hackathonId: hackathon2.id,
      userId: participant2.id,
      userEmail: participant2.email,
      title: 'High-Performance Web App',
      description: 'A blazing-fast web application with edge rendering',
      github: 'https://github.com/user2/fast-web',
      demo: 'https://fast-web-app.vercel.app',
      techStack: '["Next.js","Edge Functions","Tailwind"]',
      status: 'submitted',
    },
  })
  console.log('✓ Submissions created')

  // Create scores
  await prisma.score.create({
    data: {
      submissionId: submission1.id,
      judgeId: judge.id,
      hackathonId: hackathon1.id,
      innovation: 9,
      technical: 8,
      design: 8,
      impact: 9,
      presentation: 8,
      total: 8.4,
      feedback: 'Excellent work! The AI chatbot is very responsive.',
    },
  })
  console.log('✓ Scores created')

  // Create winners
  await prisma.winner.create({
    data: {
      hackathonId: hackathon1.id,
      submissionId: submission1.id,
      rank: 1,
      prize: '$25,000',
    },
  })
  console.log('✓ Winners announced')

  // Create certificates
  await prisma.certificate.create({
    data: {
      userId: participant1.id,
      userName: participant1.name,
      userEmail: participant1.email,
      hackathonId: hackathon1.id,
      hackathonTitle: hackathon1.title,
      submissionId: submission1.id,
      type: 'winner',
      rank: 1,
      verificationCode: `CERT-${Date.now()}-1`,
    },
  })

  await prisma.certificate.create({
    data: {
      userId: participant2.id,
      userName: participant2.name,
      userEmail: participant2.email,
      hackathonId: hackathon2.id,
      hackathonTitle: hackathon2.title,
      type: 'participation',
      verificationCode: `CERT-${Date.now()}-2`,
    },
  })
  console.log('✓ Certificates created')

  // Create user profiles
  await prisma.userProfile.create({
    data: {
      userId: participant1.id,
      bio: 'AI enthusiast and fullstack developer',
      location: 'San Francisco, CA',
      github: 'https://github.com/user1',
      linkedin: 'https://linkedin.com/in/user1',
      skills: '["Python","JavaScript","AI/ML"]',
      interests: '["AI","Web Dev","Open Source"]',
      totalHackathons: 5,
      totalSubmissions: 5,
      wins: 1,
    },
  })

  await prisma.userProfile.create({
    data: {
      userId: participant2.id,
      bio: 'Web performance and UX specialist',
      location: 'Remote',
      github: 'https://github.com/user2',
      linkedin: 'https://linkedin.com/in/user2',
      skills: '["TypeScript","React","Next.js"]',
      interests: '["Web Performance","UI/UX","Dev Tools"]',
      totalHackathons: 3,
      totalSubmissions: 4,
      wins: 0,
    },
  })
  console.log('✓ User profiles created')

  console.log('\n✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
