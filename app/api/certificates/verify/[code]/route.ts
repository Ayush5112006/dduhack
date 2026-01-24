import { NextResponse } from "next/server"
import { certificates } from "@/lib/data"

// GET: Verify certificate by code
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  const certificate = certificates.find((c) => c.verificationCode === code)

  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found", valid: false }, { status: 404 })
  }

  return NextResponse.json({ certificate, valid: true })
}
