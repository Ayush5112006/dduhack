import { verifyCertificate } from "@/app/actions/certificate"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Award, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Verify Certificate | HackHub",
}

export default async function VerifyCertificatePage({
  params
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const { certificate, error } = await verifyCertificate(code)

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Invalid Certificate</CardTitle>
            <CardDescription>
              The certificate with code <code className="font-mono font-bold">{code}</code> could not be found or verified.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link href="/">Return Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
      <Card className="w-full max-w-2xl border-primary/20 shadow-2xl">
        <CardHeader className="text-center border-b border-border/50 pb-8">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-6 ring-8 ring-primary/5">
            <Award className="h-12 w-12 text-primary" />
          </div>
          <Badge className="mx-auto mb-4 px-4 py-1 text-sm bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verified Authentic
          </Badge>
          <CardTitle className="text-3xl font-bold">{certificate.hackathonTitle}</CardTitle>
          <CardDescription className="text-lg mt-2">
            Certificate of {certificate.type}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8 px-8 md:px-12">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm uppercase tracking-wide">Presented To</p>
            <p className="text-2xl font-bold text-foreground">{certificate.userName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Issued Date</p>
              <p className="font-medium">{new Date(certificate.issuedAt).toLocaleDateString('en-US')}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Verification Code</p>
              <code className="font-mono font-bold text-primary">{certificate.verificationCode}</code>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/50 pt-8 pb-8">
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            This certificate was electronically issued by HackHub and can be verified at any time using the code above.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
