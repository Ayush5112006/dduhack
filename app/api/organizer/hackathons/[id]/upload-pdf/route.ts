import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { getSession } from "@/lib/session"
import { getPrismaClient } from "@/lib/prisma-multi-db"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.userRole !== "organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const db = getPrismaClient("organizer")
  const hackathonId = params.id

  // Verify hackathon ownership
  try {
    const hackathon = await db.hackathon.findUnique({
      where: { id: hackathonId },
    })

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 })
    }

    if (hackathon.ownerId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } catch (error) {
    console.error("Failed to verify hackathon ownership", error)
    return NextResponse.json({ error: "Failed to verify hackathon" }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const filename = `problem-statement-${hackathonId}-${timestamp}-${randomString}.pdf`
    const filepath = join(UPLOAD_DIR, filename)

    // Ensure upload directory exists
    await ensureUploadDir()

    // Write file
    const buffer = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(buffer))

    // Update hackathon with PDF path
    const relativePath = `/uploads/${filename}`
    const updated = await db.hackathon.update({
      where: { id: hackathonId },
      data: { problemStatementPdf: relativePath },
      include: {
        _count: { select: { registrations: true, submissions: true, teams: true } },
      },
    })

    return NextResponse.json({
      success: true,
      path: relativePath,
      filename,
    }, { status: 200 })
  } catch (error) {
    console.error("Failed to upload PDF", error)
    return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 })
  }
}
