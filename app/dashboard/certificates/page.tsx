"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Award, FileText } from "lucide-react"
import { useToast } from "@/components/toast-provider"

const mockCertificates: Array<{
  id: string
  hackathon: string
  achievement: string
  date: string
  issuer: string
  type: string
}> = []

export default function CertificatesPage() {
  const [certificates] = useState(mockCertificates)
  const { addToast } = useToast()

  const handleDownload = (id: string, name: string) => {
    addToast("success", `Downloaded ${name} certificate`)
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
            <CardContent className="p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                No certificates earned yet. Submit your first project to earn certificates!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="border-border bg-card hover:bg-accent transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                      {cert.type}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{cert.hackathon}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{cert.achievement}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Issued by {cert.issuer} on {cert.date}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleDownload(cert.id, cert.hackathon)}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
