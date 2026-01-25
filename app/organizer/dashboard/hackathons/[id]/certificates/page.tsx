import { getSession } from '@/lib/session'
import { getPrismaClient } from '@/lib/prisma-multi-db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export const metadata = {
  title: 'Certificates | Organizer',
}

async function getData(hackathonId: string) {
  const session = await getSession()
  if (!session) redirect('/auth/login')
  if (session.userRole !== 'organizer' && session.userRole !== 'admin') redirect('/dashboard')

  const db = getPrismaClient(session.userRole)
  const hackathon = await db.hackathon.findUnique({ where: { id: hackathonId } })
  if (!hackathon || (hackathon.ownerId !== session.userId && session.userRole !== 'admin')) redirect('/organizer/dashboard')

  const registrations = await db.registration.findMany({
    where: { hackathonId },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  })

  const certificates = await db.certificate.findMany({ where: { hackathonId } })
  const certMap = new Map(certificates.map(c => [c.userId, c]))

  return { session, hackathon, registrations, certMap }
}

export default async function CertificatesPage({ params }: { params: { id: string } }) {
  const { hackathon, registrations, certMap } = await getData(params.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
          <CardDescription>
            Upload participation certificates for {hackathon.title}. Only PDF, max 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-4">Participant</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Upload</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => {
                  const cert = certMap.get(r.userId)
                  const uploaded = !!cert?.fileUrl
                  return (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 pr-4">{r.user.name}</td>
                      <td className="py-2 pr-4">{r.user.email}</td>
                      <td className="py-2 pr-4">
                        {uploaded ? (
                          <Badge>Uploaded</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <form action="/api/organizer/certificates/upload" method="post" encType="multipart/form-data">
                          <input type="hidden" name="hackathonId" value={hackathon.id} />
                          <input type="hidden" name="userId" value={r.userId} />
                          <Input type="file" name="file" accept="application/pdf" />
                          <Button type="submit" size="sm" className="mt-2">Upload</Button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
