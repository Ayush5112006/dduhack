import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getPrismaClient } from '@/lib/prisma-multi-db'
import { prisma as defaultPrisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.userRole !== 'organizer' && session.userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const form = await req.formData()
    const hackathonId = String(form.get('hackathonId') || '')
    const userId = String(form.get('userId') || '')
    const file = form.get('file') as File | null

    if (!hackathonId || !userId || !file) {
      return NextResponse.json({ error: 'hackathonId, userId and file are required' }, { status: 400 })
    }

    // Validate file type and size
    const mime = file.type
    const size = file.size
    if (mime !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }
    if (size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 400 })
    }

    const db = getPrismaClient(session.userRole)

    // Verify organizer owns the hackathon and it's past
    const hackathon = await db.hackathon.findUnique({ where: { id: hackathonId } })
    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }
    if (hackathon.ownerId !== session.userId && session.userRole !== 'admin') {
      return NextResponse.json({ error: 'You are not the organizer of this hackathon' }, { status: 403 })
    }
    // Must be past
    const isPast = hackathon.status === 'past' || (hackathon.endDate && new Date(hackathon.endDate) < new Date())
    if (!isPast) {
      return NextResponse.json({ error: 'Certificates can be uploaded only after hackathon completion' }, { status: 400 })
    }

    // Resolve user and populate certificate fields
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates')
    await fs.mkdir(uploadsDir, { recursive: true })

    const filename = `certificate-${hackathonId}-${userId}.pdf`
    const filePath = path.join(uploadsDir, filename)
    const publicUrl = `/uploads/certificates/${filename}`

    // Prevent overwrite
    try {
      await fs.access(filePath)
      return NextResponse.json({ error: 'Certificate already uploaded for this participant' }, { status: 409 })
    } catch {
      // file does not exist - proceed
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(filePath, buffer)

    // Upsert certificate: enforce one per hackathon+user
    const certificate = await db.certificate.upsert({
      where: {
        hackathonId_userId: {
          hackathonId,
          userId,
        },
      },
      update: {
        fileUrl: publicUrl,
      },
      create: {
        userId,
        userName: user.name,
        userEmail: user.email,
        hackathonId,
        hackathonTitle: hackathon.title,
        type: 'participation',
        verificationCode: crypto.randomUUID(),
        fileUrl: publicUrl,
      },
    })

    return NextResponse.json({ success: true, certificate })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Upload failed' }, { status: 500 })
  }
}
