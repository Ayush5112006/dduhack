import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getPrismaClient } from '@/lib/prisma-multi-db'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const code = params.code
    const db = getPrismaClient(session.userRole)

    const cert = await db.certificate.findFirst({
      where: {
        verificationCode: code,
        userId: session.userId,
      },
    })

    if (!cert || !cert.fileUrl) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    const filename = path.basename(cert.fileUrl)
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'certificates', filename)
    const fileBuffer = await fs.readFile(filePath)

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch certificate' }, { status: 500 })
  }
}
