"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Download,
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { useToast } from "@/components/toast-provider"

type ReportData = {
  totalUsers: number
  totalHackathons: number
  totalSubmissions: number
  userGrowth: number
  hackathonGrowth: number
  topHackathons: Array<{ title: string; registrations: number }>
  topOrganizers: Array<{ name: string; hackathons: number }>
  recentActivity: Array<{ date: string; users: number; hackathons: number }>
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportReport = async (type: string) => {
    addToast("success", `Exporting ${type} report...`)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar type="admin" />
      <main className="flex-1 p-8 ml-0 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
              <p className="text-muted-foreground">Platform performance and insights</p>
            </div>
            <Button onClick={() => handleExportReport("full")}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reportData ? (
            <>
              {/* Stats Overview */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      +{reportData.userGrowth || 0}% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.totalHackathons || 0}</div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                      +{reportData.hackathonGrowth || 0}% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.totalSubmissions || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all hackathons</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Reports */}
              <Tabs defaultValue="hackathons" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="hackathons">Top Hackathons</TabsTrigger>
                  <TabsTrigger value="organizers">Top Organizers</TabsTrigger>
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="hackathons">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Hackathons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Hackathon</TableHead>
                            <TableHead className="text-right">Registrations</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(reportData.topHackathons || []).map((hackathon, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="font-medium">{hackathon.title}</TableCell>
                              <TableCell className="text-right">
                                {hackathon.registrations}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="organizers">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Organizers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Organizer</TableHead>
                            <TableHead className="text-right">Hackathons Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(reportData.topOrganizers || []).map((organizer, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="font-medium">{organizer.name}</TableCell>
                              <TableCell className="text-right">{organizer.hackathons}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Platform Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>New Users</TableHead>
                            <TableHead>New Hackathons</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(reportData.recentActivity || []).map((activity, index) => (
                            <TableRow key={index}>
                              <TableCell>{activity.date}</TableCell>
                              <TableCell>{activity.users}</TableCell>
                              <TableCell>{activity.hackathons}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-20">
              <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No report data available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
