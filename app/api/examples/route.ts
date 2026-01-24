/**
 * Example API Route using Prisma
 * GET /api/examples/hackathons - Get all live hackathons from database
 * 
 * This demonstrates how to:
 * 1. Import the Prisma client
 * 2. Query data with relations
 * 3. Handle errors
 * 4. Return JSON responses
 */

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Example 1: Get all live hackathons
    const liveHackathons = await prisma.hackathon.findMany({
      where: { status: 'live' },
      include: {
        owner: true,
        registrations: true,
        submissions: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Example 2: Get featured hackathons
    const featured = await prisma.hackathon.findMany({
      where: { featured: true },
      take: 3,
    })

    // Example 3: Count hackathons by status
    const stats = {
      upcoming: await prisma.hackathon.count({
        where: { status: 'upcoming' },
      }),
      live: await prisma.hackathon.count({
        where: { status: 'live' },
      }),
      past: await prisma.hackathon.count({
        where: { status: 'past' },
      }),
    }

    return NextResponse.json({
      success: true,
      data: {
        liveHackathons,
        featured,
        stats,
      },
    })
  } catch (error) {
    console.error('Error fetching hackathons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hackathons' },
      { status: 500 }
    )
  }
}

/**
 * More Examples:
 */

// Get a specific user with profile
export async function getUserWithProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      submissions: true,
      certificates: true,
    },
  })
}

// Create a new registration
export async function createRegistration(data: {
  userId: string
  hackathonId: string
  mode: 'individual' | 'team'
}) {
  return prisma.registration.create({
    data: {
      userId: data.userId,
      hackathonId: data.hackathonId,
      userEmail: (await prisma.user.findUnique({
        where: { id: data.userId },
      }))?.email || '',
      mode: data.mode,
      status: 'pending',
    },
  })
}

// Get hackathon with all submissions and scores
export async function getHackathonWithSubmissions(hackathonId: string) {
  return prisma.hackathon.findUnique({
    where: { id: hackathonId },
    include: {
      submissions: {
        include: {
          scores: {
            include: {
              judge: true,
            },
          },
          user: true,
          team: {
            include: {
              members: true,
            },
          },
        },
      },
      registrations: {
        include: {
          user: true,
        },
      },
      winners: {
        include: {
          submission: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })
}

// Update user profile
export async function updateUserProfile(userId: string, data: any) {
  return prisma.userProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  })
}

// Get certificates for a user
export async function getUserCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    include: {
      hackathon: true,
      submission: true,
    },
    orderBy: { issuedAt: 'desc' },
  })
}

// Create a submission with transaction
export async function createSubmissionWithScores(
  submissionData: any,
  scoreData: any[]
) {
  return prisma.$transaction(async (tx) => {
    // Create submission
    const submission = await tx.submission.create({
      data: submissionData,
    })

    // Create all scores
    const scores = await Promise.all(
      scoreData.map((data) =>
        tx.score.create({
          data: {
            ...data,
            submissionId: submission.id,
          },
        })
      )
    )

    return { submission, scores }
  })
}
