"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Award, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

type Certificate = {
  id: string
  userName: string
  hackathonTitle: string
  type: string
  rank?: number
  issuedAt: number
  verificationCode: string
}

export default function VerifyCertificatePage() {
  const params = useParams()
  const code = params.code as string
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`/api/certificates/verify/${code}`)
        const data = await response.json()

        if (response.ok && data.valid) {
          setCertificate(data.certificate)
          setIsValid(true)
        } else {
          setIsValid(false)
        }
      } catch (error) {
        console.error("Verification error", error)
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }
    verify()
  }, [code])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Verifying certificate...</div>
  }

  const getCertificateIcon = (type?: string) => {
    if (type === "winner" || type === "runner-up") return <Trophy className="h-16 w-16 text-yellow-500" />
    if (type === "completion") return <CheckCircle className="h-16 w-16 text-green-500" />
    return <Award className="h-16 w-16 text-blue-500" />
  }

  const getCertificateLabel = (cert: Certificate) => {
    if (cert.type === "winner" && cert.rank) {
      return `${cert.rank === 1 ? "1st" : cert.rank === 2 ? "2nd" : "3rd"} Place Winner`
    }
    return cert.type.charAt(0).toUpperCase() + cert.type.slice(1)
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground">Certificate Verification</h1>
        </div>

        {!isValid ? (
          <Card className="border-red-500 bg-card">
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
              <h2 className="mt-4 text-2xl font-bold text-foreground">Invalid Certificate</h2>
              <p className="mt-2 text-muted-foreground">
                The certificate code <code className="rounded bg-secondary px-2 py-1 font-mono">{code}</code> could not be verified.
              </p>
              <Link href="/" className="mt-4 inline-block text-primary hover:underline">
                Go to Home →
              </Link>
            </CardContent>
          </Card>
        ) : certificate ? (
          <Card className="border-green-500 bg-card">
            <CardContent className="py-12">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="mt-4 text-2xl font-bold text-green-500">Verified Certificate</h2>
              </div>

              <div className="mx-auto mt-8 max-w-2xl rounded-lg border-4 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-8">
                <div className="text-center">
                  {getCertificateIcon(certificate.type)}
                  <h3 className="mt-4 text-3xl font-bold text-foreground">Certificate of {getCertificateLabel(certificate)}</h3>
                  <p className="mt-4 text-lg text-muted-foreground">This certifies that</p>
                  <h4 className="mt-2 text-4xl font-bold text-primary">{certificate.userName}</h4>
                  <p className="mt-4 text-lg text-muted-foreground">
                    has {certificate.type === "participation" ? "participated in" : certificate.type === "winner" ? "won" : "completed"}
                  </p>
                  <h5 className="mt-2 text-2xl font-bold text-foreground">{certificate.hackathonTitle}</h5>

                  {certificate.rank && (
                    <Badge variant="default" className="mt-4 text-lg">
                      {certificate.rank === 1 ? "🥇 " : certificate.rank === 2 ? "🥈 " : "🥉 "}
                      {certificate.rank === 1 ? "1st" : certificate.rank === 2 ? "2nd" : "3rd"} Place
                    </Badge>
                  )}

                  <p className="mt-6 text-sm text-muted-foreground">
                    Issued on {new Date(certificate.issuedAt).toLocaleDateString("en-US", { 
                      year: "numeric", 
                      month: "long", 
                      day: "numeric" 
                    })}
                  </p>

                  <div className="mt-6 border-t pt-4">
                    <p className="text-xs text-muted-foreground">Verification Code</p>
                    <code className="mt-1 inline-block rounded bg-secondary px-3 py-1 font-mono text-sm">
                      {certificate.verificationCode}
                    </code>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                This certificate has been digitally verified and is authentic.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
