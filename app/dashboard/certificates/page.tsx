import { getUserCertificates, issueMockCertificate } from "@/app/actions/certificate"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Download, ExternalLink, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"

export const metadata = {
  title: "My Certificates | HackHub",
}

export default async function CertificatesPage() {
  const session = await getSession()
  if (!session) redirect("/auth/login")

  const { certificates, error } = await getUserCertificates()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
          <p className="text-muted-foreground">View and download your earned credentials.</p>
        </div>
        {/* Temporary Issue Button for Verification */}
        <form action={async () => {
          "use server"
          // hardcoded hackathon ID for quick test if needed, or remove later
        }}>
          {/* <Button type="submit">Execute Test</Button> */}
        </form>
      </div>

      {error && <div className="text-red-500">Error loading certificates</div>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates && certificates.length > 0 ? (
          certificates.map((cert) => (
            <Card key={cert.id} className="relative overflow-hidden border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Award className="h-32 w-32" />
              </div>
              <CardHeader>
                <Badge className="w-fit mb-2 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20">
                  {cert.type}
                </Badge>
                <CardTitle className="line-clamp-1">{cert.hackathonTitle}</CardTitle>
                <CardDescription>Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient</span>
                    <span className="font-medium">{cert.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification Code</span>
                    <code className="bg-muted px-1 py-0.5 rounded text-xs select-all">
                      {cert.verificationCode}
                    </code>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link href={`/certificates/verify/${cert.verificationCode}`} target="_blank">
                    <ShieldCheck className="h-4 w-4" /> Verify
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-16 border rounded-lg bg-muted/10">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No certificates yet</h3>
            <p className="text-muted-foreground">Participate in hackathons to earn certificates!</p>
          </div>
        )}
      </div>
    </div>
  )
}
