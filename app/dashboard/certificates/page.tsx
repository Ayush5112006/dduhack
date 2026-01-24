"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Award, Share2, Trophy, CheckCircle, FileText } from "lucide-react"
import { useToast } from "@/components/toast-provider"
import Link from "next/link"

type Certificate = {
  id: string
  hackathonTitle: string
  type: string
  rank?: number
  issuedAt: number
  verificationCode: string
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/certificates", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          setCertificates(data.certificates || [])
        }
      } catch (error) {
        console.error("Failed to load certificates", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const getCertificateIcon = (type: string) => {
    if (type === "winner" || type === "runner-up") return <Trophy className="h-8 w-8 text-yellow-500" />
    if (type === "completion") return <CheckCircle className="h-8 w-8 text-green-500" />
    return <Award className="h-8 w-8 text-blue-500" />
  }

  const getCertificateLabel = (cert: Certificate) => {
    if (cert.type === "winner" && cert.rank) {
      return `${cert.rank === 1 ? "1st" : cert.rank === 2 ? "2nd" : "3rd"} Place Winner`
    }
    return cert.type.charAt(0).toUpperCase() + cert.type.slice(1)
  }

  const handleDownload = (cert: Certificate) => {
    addToast("success", `Certificate ${cert.verificationCode} ready for download`)
  }

  const handleShare = (cert: Certificate) => {
    const url = `${window.location.origin}/certificates/verify/${cert.verificationCode}`
    navigator.clipboard.writeText(url)
    addToast("success", "Certificate link copied to clipboard!")
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar type="participant" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
          <p className="mt-2 text-muted-foreground">
            View and download your earned certificates
          </p>
        </div>

        {certificates.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center">
              <Award className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">No certificates yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Participate in hackathons to earn certificates!
              </p>
              <Link href="/hackathons">
                <Button className="mt-4">Browse Hackathons</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <Card key={cert.id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {getCertificateIcon(cert.type)}
                      <div>
                        <CardTitle className="text-xl">{cert.hackathonTitle}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {getCertificateLabel(cert)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>
                      <strong>Issued:</strong> {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                    <p className="mt-1">
                      <strong>Verification Code:</strong>{" "}
                      <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs">
                        {cert.verificationCode}
                      </code>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(cert)}
                      className="flex-1 gap-2"
                    >
                      <Download className="h-4 w-4" /> Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(cert)}
                      className="flex-1 gap-2"
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>

                  <Link
                    href={`/certificates/verify/${cert.verificationCode}`}
                    className="block text-center text-xs text-primary hover:underline"
                  >
                    View Public Certificate →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
